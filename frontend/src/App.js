import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Persons from './pages/admin/Persons';
import Reminders from './pages/admin/Reminders';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/persons" element={<Persons />} />
        <Route path="/admin/reminders" element={<Reminders />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </Router>
  );
}

export default App;