import { useEffect, useState } from 'react';
import styles from './Home.module.css';

type HealthResponse = {
  status: string;
  service: string;
  version: string;
};

type DashboardSummary = {
  totalUnidades: number;
  totalUsuarios: number;
  totalInventarios: number;
  totalNovedades: number;
  inventariosEnProceso: number;
  inventariosCerrados: number;
  inventariosCancelados: number;
  novedadesPendientes: number;
  novedadesResueltas: number;
};

export function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    fetch(`${apiUrl}/api/health`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('No se pudo conectar con la API');
        }

        return response.json() as Promise<HealthResponse>;
      })
      .then(async (healthData) => {
        setHealth(healthData);

        if (!token) {
          return;
        }

        const summaryResponse = await fetch(`${apiUrl}/api/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!summaryResponse.ok) {
          if (summaryResponse.status === 401 || summaryResponse.status === 403) {
            return;
          }

          throw new Error('No se pudo obtener el resumen del dashboard');
        }

        const summaryData = (await summaryResponse.json()) as DashboardSummary;
        setSummary(summaryData);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      });
  }, []);

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sistema de Inventario</h1>
        <p className={styles.subtitle}>
          Bomberos Voluntarios de Barker — panel operativo del proyecto.
        </p>

        {health && (
          <p className={styles.apiRow}>
            API: <span className={styles.status}>{health.status}</span>{' '}
            <small>
              ({health.service} v{health.version})
            </small>
          </p>
        )}

        {error && <p className={styles.alert} role="alert">API no disponible: {error}</p>}
      </div>

      {summary ? (
        <div className={styles.grid}>
          <article className={styles.metricCard}>
            <span className={styles.label}>Unidades</span>
            <strong>{summary.totalUnidades}</strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.label}>Usuarios</span>
            <strong>{summary.totalUsuarios}</strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.label}>Inventarios</span>
            <strong>{summary.totalInventarios}</strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.label}>Novedades</span>
            <strong>{summary.totalNovedades}</strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.label}>En proceso</span>
            <strong>{summary.inventariosEnProceso}</strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.label}>Cerrados</span>
            <strong>{summary.inventariosCerrados}</strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.label}>Cancelados</span>
            <strong>{summary.inventariosCancelados}</strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.label}>Pendientes</span>
            <strong>{summary.novedadesPendientes}</strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.label}>Resueltas</span>
            <strong>{summary.novedadesResueltas}</strong>
          </article>
        </div>
      ) : (
        !error && (
          <div className={styles.emptyState}>
            Inicia sesión para ver el resumen operativo del dashboard.
          </div>
        )
      )}
    </section>
  );
}
