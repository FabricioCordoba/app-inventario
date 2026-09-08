import { FormEvent, useEffect, useMemo, useState } from 'react';
import styles from './Catalogs.module.css';

type UnitRecord = {
  id: number;
  numero: string;
  nombre: string;
  activo: boolean;
  sectores?: SectorRecord[];
};

type SectorRecord = {
  id: number;
  nombre: string;
  activo: boolean;
  unidadId: number;
  orden?: number;
};

type MaterialRecord = {
  id: number;
  nombre: string;
  activo: boolean;
  requiereInstancias?: boolean;
};

type UnitMaterialRecord = {
  id: number;
  unidadId: number;
  sectorId: number;
  materialId: number;
  cantidadRequerida: number;
  activo: boolean;
  unidad?: { id: number; numero: string; nombre: string };
  sector?: { id: number; nombre: string };
  material?: { id: number; nombre: string };
};

const defaultHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export function CatalogsPage() {
  const [units, setUnits] = useState<UnitRecord[]>([]);
  const [sectors, setSectors] = useState<SectorRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [unitMaterials, setUnitMaterials] = useState<UnitMaterialRecord[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unitForm, setUnitForm] = useState({ numero: '', nombre: '', activo: true });
  const [sectorForm, setSectorForm] = useState({ nombre: '', orden: 0, activo: true });
  const [materialForm, setMaterialForm] = useState({ nombre: '', requiereInstancias: false, activo: true });
  const [configForm, setConfigForm] = useState({
    sectorId: 0,
    materialId: 0,
    cantidadRequerida: 1,
    activo: true,
  });

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedUnitId, units],
  );

  const unitSectors = useMemo(
    () => sectors.filter((sector) => sector.unidadId === selectedUnitId),
    [selectedUnitId, sectors],
  );

  const activeUnitMaterials = useMemo(
    () =>
      unitMaterials.filter(
        (item) =>
          (selectedUnitId === null || item.unidadId === selectedUnitId) &&
          (selectedSectorId === null || item.sectorId === selectedSectorId),
      ),
    [selectedSectorId, selectedUnitId, unitMaterials],
  );

  const loadData = async () => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para administrar catálogos.');
      setLoading(false);
      return;
    }

    try {
      const [unitsResponse, sectorsResponse, materialsResponse, configResponse] = await Promise.all([
        fetch(`${apiUrl}/api/units`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/sectors`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/materials`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/unit-materials`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!unitsResponse.ok || !sectorsResponse.ok || !materialsResponse.ok || !configResponse.ok) {
        throw new Error('No tiene permisos para ver los catálogos.');
      }

      const unitsPayload = (await unitsResponse.json()) as UnitRecord[];
      const sectorsPayload = (await sectorsResponse.json()) as SectorRecord[];
      const materialsPayload = (await materialsResponse.json()) as MaterialRecord[];
      const unitMaterialsPayload = (await configResponse.json()) as UnitMaterialRecord[];

      setUnits(unitsPayload);
      setSectors(sectorsPayload);
      setMaterials(materialsPayload);
      setUnitMaterials(unitMaterialsPayload);

      if (!selectedUnitId && unitsPayload[0]) {
        setSelectedUnitId(unitsPayload[0].id);
      }

      if (!selectedSectorId && sectorsPayload[0]) {
        setSelectedSectorId(sectorsPayload[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (selectedUnitId && !unitSectors.some((sector) => sector.id === selectedSectorId)) {
      setSelectedSectorId(unitSectors[0]?.id ?? null);
    }
  }, [selectedSectorId, selectedUnitId, unitSectors]);

  useEffect(() => {
    if (!selectedUnitId && units[0]) {
      setSelectedUnitId(units[0].id);
    }
  }, [units, selectedUnitId]);

  useEffect(() => {
    if (selectedUnitId && selectedUnit) {
      if (!configForm.sectorId && unitSectors[0]) {
        setConfigForm((current) => ({ ...current, sectorId: unitSectors[0].id, materialId: materials[0]?.id ?? 0 }));
      }
      if (!configForm.materialId && materials[0]) {
        setConfigForm((current) => ({ ...current, materialId: materials[0].id }));
      }
    }
  }, [materials, selectedUnit, selectedUnitId, unitSectors, configForm.materialId, configForm.sectorId]);

  const createUnit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para crear una unidad.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/units`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({
          numero: unitForm.numero,
          nombre: unitForm.nombre,
          activo: unitForm.activo,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'No se pudo crear la unidad');
      }

      setUnitForm({ numero: '', nombre: '', activo: true });
      setError(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const createSector = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUnitId) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para crear un sector.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/sectors`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({
          unidadId: selectedUnitId,
          nombre: sectorForm.nombre,
          orden: sectorForm.orden,
          activo: sectorForm.activo,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'No se pudo crear el sector');
      }

      setSectorForm({ nombre: '', orden: 0, activo: true });
      setError(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const createMaterial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para crear un material.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/materials`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({
          nombre: materialForm.nombre,
          requiereInstancias: materialForm.requiereInstancias,
          activo: materialForm.activo,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'No se pudo crear el material');
      }

      setMaterialForm({ nombre: '', requiereInstancias: false, activo: true });
      setError(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const createUnitMaterial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUnitId) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para configurar materiales.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/unit-materials`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({
          unidadId: selectedUnitId,
          sectorId: configForm.sectorId,
          materialId: configForm.materialId,
          cantidadRequerida: configForm.cantidadRequerida,
          activo: configForm.activo,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'No se pudo guardar la configuración');
      }

      setError(null);
      setConfigForm((current) => ({ ...current, cantidadRequerida: 1 }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Catálogos y configuración</h1>
          <p className={styles.subtitle}>Unidades, sectores, materiales y configuración por unidad/sector/material</p>
        </div>
      </div>

      {loading && <div className={styles.state}>Cargando catálogos...</div>}
      {error && <div className={styles.alert}>{error}</div>}

      {!loading && !error && (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Unidades</h2>
            <div className={styles.list}>
              {units.map((unit) => (
                <button
                  key={unit.id}
                  type="button"
                  className={`${styles.listItem} ${selectedUnitId === unit.id ? styles.selected : ''}`}
                  onClick={() => setSelectedUnitId(unit.id)}
                >
                  <span>{unit.numero} — {unit.nombre}</span>
                  <small>{unit.activo ? 'Activo' : 'Inactivo'}</small>
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={createUnit}>
              <h3>Nueva unidad</h3>
              <label>
                <span>Número</span>
                <input value={unitForm.numero} onChange={(e) => setUnitForm({ ...unitForm, numero: e.target.value })} required />
              </label>
              <label>
                <span>Nombre</span>
                <input value={unitForm.nombre} onChange={(e) => setUnitForm({ ...unitForm, nombre: e.target.value })} required />
              </label>
              <label className={styles.checkLine}>
                <input type="checkbox" checked={unitForm.activo} onChange={(e) => setUnitForm({ ...unitForm, activo: e.target.checked })} />
                <span>Activa</span>
              </label>
              <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear unidad'}</button>
            </form>
          </div>

          <div className={styles.card}>
            <h2>Sectores</h2>
            <div className={styles.list}>
              {unitSectors.map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  className={`${styles.listItem} ${selectedSectorId === sector.id ? styles.selected : ''}`}
                  onClick={() => setSelectedSectorId(sector.id)}
                >
                  <span>{sector.nombre}</span>
                  <small>{sector.activo ? 'Activo' : 'Inactivo'}</small>
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={createSector}>
              <h3>Nuevo sector</h3>
              <label>
                <span>Nombre</span>
                <input value={sectorForm.nombre} onChange={(e) => setSectorForm({ ...sectorForm, nombre: e.target.value })} required />
              </label>
              <label>
                <span>Orden</span>
                <input type="number" value={sectorForm.orden} onChange={(e) => setSectorForm({ ...sectorForm, orden: Number(e.target.value) })} />
              </label>
              <label className={styles.checkLine}>
                <input type="checkbox" checked={sectorForm.activo} onChange={(e) => setSectorForm({ ...sectorForm, activo: e.target.checked })} />
                <span>Activo</span>
              </label>
              <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear sector'}</button>
            </form>
          </div>

          <div className={styles.card}>
            <h2>Materiales</h2>
            <div className={styles.list}>
              {materials.map((material) => (
                <div key={material.id} className={styles.listItemPlain}>
                  <span>{material.nombre}</span>
                  <small>{material.activo ? 'Activo' : 'Inactivo'}</small>
                </div>
              ))}
            </div>

            <form className={styles.form} onSubmit={createMaterial}>
              <h3>Nuevo material</h3>
              <label>
                <span>Nombre</span>
                <input value={materialForm.nombre} onChange={(e) => setMaterialForm({ ...materialForm, nombre: e.target.value })} required />
              </label>
              <label className={styles.checkLine}>
                <input type="checkbox" checked={materialForm.requiereInstancias} onChange={(e) => setMaterialForm({ ...materialForm, requiereInstancias: e.target.checked })} />
                <span>Requiere instancias</span>
              </label>
              <label className={styles.checkLine}>
                <input type="checkbox" checked={materialForm.activo} onChange={(e) => setMaterialForm({ ...materialForm, activo: e.target.checked })} />
                <span>Activo</span>
              </label>
              <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear material'}</button>
            </form>
          </div>

          <div className={styles.cardWide}>
            <h2>Configuración por unidad / sector / material</h2>

            <form className={styles.configForm} onSubmit={createUnitMaterial}>
              <label>
                <span>Unidad</span>
                <select value={selectedUnitId ?? ''} onChange={(e) => setSelectedUnitId(Number(e.target.value))}>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.numero} — {unit.nombre}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Sector</span>
                <select value={configForm.sectorId || (unitSectors[0]?.id ?? '')} onChange={(e) => setConfigForm({ ...configForm, sectorId: Number(e.target.value) })}>
                  {unitSectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>{sector.nombre}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Material</span>
                <select value={configForm.materialId || (materials[0]?.id ?? '')} onChange={(e) => setConfigForm({ ...configForm, materialId: Number(e.target.value) })}>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>{material.nombre}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Cantidad requerida</span>
                <input type="number" min="0" value={configForm.cantidadRequerida} onChange={(e) => setConfigForm({ ...configForm, cantidadRequerida: Number(e.target.value) })} />
              </label>

              <label className={styles.checkLine}>
                <input type="checkbox" checked={configForm.activo} onChange={(e) => setConfigForm({ ...configForm, activo: e.target.checked })} />
                <span>Activo</span>
              </label>

              <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar configuración'}</button>
            </form>

            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Sector</th>
                    <th>Material</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUnitMaterials.map((item) => (
                    <tr key={item.id}>
                      <td>{item.unidad?.numero ?? item.unidadId}</td>
                      <td>{item.sector?.nombre ?? item.sectorId}</td>
                      <td>{item.material?.nombre ?? item.materialId}</td>
                      <td>{item.cantidadRequerida}</td>
                      <td>{item.activo ? 'Activo' : 'Inactivo'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
