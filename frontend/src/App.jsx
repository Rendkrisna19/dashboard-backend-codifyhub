import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Layout from "./components/Layout.jsx";
import Clients from "./pages/Clients.jsx";
import Projects from "./pages/Projects.jsx";
import Team from "./pages/Team.jsx";

function isAuthed() { return !!localStorage.getItem("token"); }
function Protected({ children }) { return isAuthed() ? children : <Navigate to="/login" replace />; }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/clients"
        element={
          <Protected>
            <Layout><Clients /></Layout>
          </Protected>
        }
      />

      <Route path="/projects" element={<Protected><Layout><Projects /></Layout></Protected>} />
      <Route path="/team" element={<Protected><Layout><Team /></Layout></Protected>} />
      <Route path="*" element={<Navigate to={isAuthed() ? "/" : "/login"} replace />} />
    </Routes>
  );
}
