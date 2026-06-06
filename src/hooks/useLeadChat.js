// src/hooks/useLeadChat.js
import { useState, useEffect, useRef } from "react";
import {
  collection, addDoc, query, orderBy,
  onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getChatCompletion } from "../services/openrouter";

// ── System prompt — injected on every call, never stored in Firestore ────────
function buildSystemPrompt(lead) {
  return `You are LeadBot, a professional sales and outreach assistant inside a social media lead tracking app called SocialLead.

You are helping manage the following lead:
- Name: ${lead.name || "Unknown"}
- Platform: ${lead.platform || "Unknown"}
- Handle: ${lead.handle || "not provided"}
- Current Status: ${lead.status || "new"}
- Follow-up Date: ${lead.followUpDate || "not set"}
- Notes: ${lead.notes || "none"}

Your responsibilities:
1. Write personalized outreach and follow-up messages tailored to this specific lead
2. Suggest next steps based on their current status ("${lead.status}")
3. Adapt your tone to the platform — ${lead.platform} communication style
4. Keep all messages concise, warm, and professional
5. When asked to write a message, output ONLY the message text with no extra commentary unless asked

Always refer to the lead by their name (${lead.name}) and platform (${lead.platform}) in your suggestions.
Never make up information not provided above.`;
}

export function useLeadChat(lead) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep a ref to the latest messages for use inside sendMessage
  // without needing it as a dependency
  const messagesRef_local = useRef([]);
  messagesRef_local.current = messages;

  const messagesRef = collection(db, "leads", lead.id, "messages");

  // ── Real-time Firestore listener ─────────────────────────────────────────
  useEffect(() => {
    if (!lead?.id) return;
    setLoading(true);

    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setError("Could not load chat history. Check your connection.");
        setLoading(false);
      }
    );

    return unsub;
  }, [lead.id]);

  // ── Send a message ────────────────────────────────────────────────────────
  async function sendMessage(userText) {
    if (!userText.trim()) return;
    setError("");
    setAiLoading(true);

    try {
      // 1. Save user message to Firestore
      await addDoc(messagesRef, {
        role: "user",
        content: userText.trim(),
        createdAt: serverTimestamp(),
      });

      // 2. Build full conversation for OpenRouter
      //    Use ref so we always get the latest messages without stale closure
      const history = messagesRef_local.current.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const openRouterMessages = [
        { role: "system", content: buildSystemPrompt(lead) },
        ...history,
        { role: "user", content: userText.trim() },
      ];

      // 3. Call OpenRouter (auto-retries free models on failure)
      const aiReply = await getChatCompletion(openRouterMessages);

      // 4. Save AI reply to Firestore
      await addDoc(messagesRef, {
        role: "assistant",
        content: aiReply,
        createdAt: serverTimestamp(),
      });

    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message);
    }

    setAiLoading(false);
  }

  return { messages, loading, aiLoading, error, sendMessage };
}