import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import DishDetail from './pages/DishDetail';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:slug" element={<MenuPage />} />
        <Route path="/:slug/dish/:dishId" element={<DishDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
