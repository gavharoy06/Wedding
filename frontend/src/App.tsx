import { Routes, Route } from 'react-router-dom';
import HomePage from './Homepage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/venues" element={<div>To'yxonalar ro'yxati (keyingi sahifa)</div>} />
      <Route path="/venues/:id" element={<div>To'yxona tafsiloti</div>} />
      <Route path="/login" element={<div>Kirish</div>} />
      <Route path="/register/owner" element={<div>Hamkor ro'yxati</div>} />
      <Route path="*" element={<div>Sahifa topilmadi</div>} />
    </Routes>
  );
}

export default App;
