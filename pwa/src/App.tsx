import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ReportInput from "./pages/reportInput";
import Home from './pages/home'; 
import './styles/app.css';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/report" element={<PrivateRoute><ReportInput /></PrivateRoute>} />
        {/* Redireciona qualquer rota desconhecida para a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
