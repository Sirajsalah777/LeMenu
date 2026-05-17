import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DishForm from './pages/DishForm';

function AppRoutes() {
  const { isAuthenticated, booting } = useAuth();

  if (booting) {
    return <LoadingScreen message="Chargement..." />;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} />
      <Route path="/dish/new" element={isAuthenticated ? <DishForm /> : <Navigate to="/" replace />} />
      <Route path="/dish/edit/:id" element={isAuthenticated ? <DishForm /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/admin">
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
