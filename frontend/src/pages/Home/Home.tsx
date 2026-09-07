import { useEffect, useState } from 'react';
import styles from './Home.module.css';

type HealthResponse = {
  status: string;
  service: string;
  version: string;
};

export function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? '/api';

    fetch(`${apiUrl}/health`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('No se pudo conectar con la API');
        }
        return response.json() as Promise<HealthResponse>;
      })
      .then(setHealth)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      });
  }, []);

  return (
    <section className={styles.card}>
      <h1 className={styles.title}>Sistema de Inventario</h1>
      <p className={styles.subtitle}>
        Bomberos Voluntarios de Barker — base del proyecto inicializada.
      </p>

      {health && (
        <p>
          API: <span className={styles.status}>{health.status}</span>{' '}
          <small>({health.service} v{health.version})</small>
        </p>
      )}

      {error && <p role="alert">API no disponible: {error}</p>}
    </section>
  );
}
