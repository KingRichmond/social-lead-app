// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import LeadChatPage from "./components/LeadChatPage";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/"         element={user  ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/lead/:id" element={user  ? <LeadChatPage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}