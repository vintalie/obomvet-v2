import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ReportInput from "./pages/criarEmergencia";
import Home from './pages/home'; 
import Features from './pages/features'; 
import About from './pages/about';
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
        <Route path="/reportInput" element={<ReportInput />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        {/* Redireciona qualquer rota desconhecida para a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
