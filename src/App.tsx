import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ReaderPage from './pages/ReaderPage';
import SpecialPage from './pages/SpecialPage';

export default function App() {
  return (
    <BrowserRouter basename="/quran">
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/page/1" replace />} />
          <Route path="/page/:pageNum" element={<ReaderPage />} />
          <Route path="/special" element={<SpecialPage />} />
          <Route path="*" element={<Navigate to="/page/1" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
