import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    roles: string[];
    permisos: string[];
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@bvbarker.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'Credenciales inválidas');
      }

      const payload = (await response.json()) as LoginResponse;
      localStorage.setItem('access_token', payload.accessToken);
      localStorage.setItem('refresh_token', payload.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(payload.user));

      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Acceso al panel de inventarios</p>

        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </section>
  );
}
