import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

type RegisterResponse = {
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

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!PASSWORD_PATTERN.test(form.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'No se pudo completar el registro');
      }

      const payload = (await response.json()) as RegisterResponse;
      localStorage.setItem('access_token', payload.accessToken);
      localStorage.setItem('refresh_token', payload.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(payload.user));

      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>Registrate para acceder al sistema</p>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Nombre</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(event) => handleChange('nombre', event.target.value)}
              autoComplete="given-name"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Apellido</span>
            <input
              type="text"
              value={form.apellido}
              onChange={(event) => handleChange('apellido', event.target.value)}
              autoComplete="family-name"
              required
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Contraseña</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => handleChange('password', event.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Confirmar contraseña</span>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => handleChange('confirmPassword', event.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrarme'}
        </button>

        <p className={styles.footerText}>
          Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </section>
  );
}
