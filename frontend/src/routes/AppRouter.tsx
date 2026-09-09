import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { ForgotPasswordPage } from '../pages/ForgotPassword/ForgotPassword';
import { HomePage } from '../pages/Home/Home';
import { LoginPage } from '../pages/Login/Login';
import { ResetPasswordPage } from '../pages/ResetPassword/ResetPassword';
import { CatalogsPage } from '../pages/Catalogs/Catalogs';

export function AppRouter() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/catalogos" element={isAuthenticated ? <CatalogsPage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/recuperar-contrasena" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
          <Route path="/restablecer-contrasena" element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPasswordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
