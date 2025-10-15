import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Pets from "./pages/pets";
import Dashboard from "./pages/dashboard";
import CriarEmergencia from "./pages/criarEmergencia";
import Home from './pages/home'; 
import './styles/app.css';
import { getToken } from './utils/auth';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = getToken();
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
        <Route path="/pets" element={<PrivateRoute><Pets /></PrivateRoute>} />
        <Route path="/criar-emergencia" element={<CriarEmergencia />} />
        {/* Redireciona qualquer rota desconhecida para a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
