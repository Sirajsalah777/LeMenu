import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DishForm = lazy(() => import('./pages/DishForm'));

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingScreen message="Chargement de l'application..." />}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/dish/new" element={isAuthenticated ? <DishForm /> : <Navigate to="/" replace />} />
        <Route path="/dish/edit/:id" element={isAuthenticated ? <DishForm /> : <Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
