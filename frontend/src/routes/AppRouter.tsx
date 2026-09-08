import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { HomePage } from '../pages/Home/Home';
import { LoginPage } from '../pages/Login/Login';
import { RolesPage } from '../pages/Roles/Roles';
import { UsersPage } from '../pages/Users/Users';

export function AppRouter() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/usuarios" element={isAuthenticated ? <UsersPage /> : <Navigate to="/login" replace />} />
          <Route path="/roles" element={isAuthenticated ? <RolesPage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
