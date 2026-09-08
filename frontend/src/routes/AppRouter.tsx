import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { HomePage } from '../pages/Home/Home';
import { LoginPage } from '../pages/Login/Login';

export function AppRouter() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
