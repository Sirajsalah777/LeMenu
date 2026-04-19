import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DishForm from './pages/DishForm';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/dish/new" element={isAuthenticated ? <DishForm /> : <Navigate to="/" />} />
        <Route path="/dish/edit/:id" element={isAuthenticated ? <DishForm /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
