import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppPage from './pages/app/AppPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
