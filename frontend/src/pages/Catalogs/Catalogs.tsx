import { FormEvent, useEffect, useState } from 'react';
import styles from './Catalogs.module.css';

type Unit = { id: number; numero: string; tipo: string; estado: string; activo: boolean };
type Sector = { id: number; unidadId: number; nombre: string; orden: number; activo: boolean };
type Material = { id: number; nombre: string; tipoControl: string; unidadMedida: string; requiereInstancias: boolean; activo: boolean };
type UnitMaterial = {
  id: number;
  unidadId: number;
  materialId: number;
  sectorId: number;
  cantidadRequerida: number;
  valorNominal: number | null;
  valorMinimo: number | null;
  unidad?: Unit;
  material?: Material;
  sector?: Sector;
};

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const token = () => localStorage.getItem('access_token') ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...options?.headers,
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
    throw new Error(message ?? 'No se pudo completar la operación');
  }

  return payload as T;
}

export function CatalogsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [unitMaterials, setUnitMaterials] = useState<UnitMaterial[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [unitForm, setUnitForm] = useState({ numero: '', tipo: '', estado: 'ACTIVA' });
  const [sectorForm, setSectorForm] = useState({ unidadId: '', nombre: '', orden: '0' });
  const [materialForm, setMaterialForm] = useState({
    nombre: '',
    tipoControl: 'CANTIDAD',
    unidadMedida: 'UNIDADES',
    requiereInstancias: false,
  });
  const [configurationForm, setConfigurationForm] = useState({
    unidadId: '',
    sectorId: '',
    materialId: '',
    cantidadRequerida: '0',
    valorNominal: '',
    valorMinimo: '',
  });

  const loadCatalogs = async () => {
    const [unitData, sectorData, materialData, configurationData] = await Promise.all([
      request<Unit[]>('/units?activo=true'),
      request<Sector[]>('/sectors?activo=true'),
      request<Material[]>('/materials?activo=true'),
      request<UnitMaterial[]>('/unit-materials?activo=true'),
    ]);
    setUnits(unitData);
    setSectors(sectorData);
    setMaterials(materialData);
    setUnitMaterials(configurationData);
  };

  useEffect(() => {
    void loadCatalogs().catch((err: unknown) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los catálogos'));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>, path: string, body: unknown, success: string) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await request(path, { method: 'POST', body: JSON.stringify(body) });
      await loadCatalogs();
      setNotice(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la operación');
    } finally {
      setBusy(false);
    }
  };

  const visibleSectors = sectors.filter((sector) => String(sector.unidadId) === configurationForm.unidadId);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Configuración operativa</p>
          <h1>Unidades y materiales</h1>
          <p className={styles.subtitle}>Prepara la estructura que luego se utilizará para realizar inventarios.</p>
        </div>
        <div className={styles.counts}>
          <span>{units.length} unidades</span>
          <span>{sectors.length} sectores</span>
          <span>{materials.length} materiales</span>
        </div>
      </header>

      {error && <p className={styles.alert} role="alert">{error}</p>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}

      <div className={styles.forms}>
        <form className={styles.panel} onSubmit={(event) => submit(event, '/units', { ...unitForm, anio: undefined }, 'Unidad creada correctamente')}>
          <h2>Nueva unidad</h2>
          <label>Numero<input value={unitForm.numero} onChange={(event) => setUnitForm({ ...unitForm, numero: event.target.value })} required /></label>
          <label>Tipo<input value={unitForm.tipo} onChange={(event) => setUnitForm({ ...unitForm, tipo: event.target.value })} placeholder="Autobomba" required /></label>
          <label>Estado<select value={unitForm.estado} onChange={(event) => setUnitForm({ ...unitForm, estado: event.target.value })}><option value="ACTIVA">Activa</option><option value="MANTENIMIENTO">Mantenimiento</option><option value="FUERA_DE_SERVICIO">Fuera de servicio</option><option value="BAJA">Baja</option></select></label>
          <button disabled={busy}>Crear unidad</button>
        </form>

        <form className={styles.panel} onSubmit={(event) => submit(event, '/sectors', { ...sectorForm, unidadId: Number(sectorForm.unidadId), orden: Number(sectorForm.orden) }, 'Sector creado correctamente')}>
          <h2>Nuevo sector</h2>
          <label>Unidad<select value={sectorForm.unidadId} onChange={(event) => setSectorForm({ ...sectorForm, unidadId: event.target.value })} required><option value="">Seleccionar unidad</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.numero} - {unit.tipo}</option>)}</select></label>
          <label>Nombre<input value={sectorForm.nombre} onChange={(event) => setSectorForm({ ...sectorForm, nombre: event.target.value })} placeholder="Baulera 1" required /></label>
          <label>Orden<input type="number" min="0" value={sectorForm.orden} onChange={(event) => setSectorForm({ ...sectorForm, orden: event.target.value })} /></label>
          <button disabled={busy || units.length === 0}>Crear sector</button>
        </form>

        <form className={styles.panel} onSubmit={(event) => submit(event, '/materials', materialForm, 'Material creado correctamente')}>
          <h2>Nuevo material</h2>
          <label>Nombre<input value={materialForm.nombre} onChange={(event) => setMaterialForm({ ...materialForm, nombre: event.target.value })} placeholder="Manguera 45 mm" required /></label>
          <label>Tipo de control<select value={materialForm.tipoControl} onChange={(event) => setMaterialForm({ ...materialForm, tipoControl: event.target.value })}><option value="CANTIDAD">Cantidad</option><option value="CAPACIDAD">Capacidad</option><option value="PRESION">Presion</option></select></label>
          <label>Unidad de medida<select value={materialForm.unidadMedida} onChange={(event) => setMaterialForm({ ...materialForm, unidadMedida: event.target.value })}><option value="UNIDADES">Unidades</option><option value="LITROS">Litros</option><option value="PSI">PSI</option></select></label>
          <label className={styles.checkbox}><input type="checkbox" checked={materialForm.requiereInstancias} onChange={(event) => setMaterialForm({ ...materialForm, requiereInstancias: event.target.checked })} /> Requiere instancias individuales</label>
          <button disabled={busy}>Crear material</button>
        </form>

        <form className={styles.panel} onSubmit={(event) => submit(event, '/unit-materials', {
          unidadId: Number(configurationForm.unidadId),
          sectorId: Number(configurationForm.sectorId),
          materialId: Number(configurationForm.materialId),
          cantidadRequerida: Number(configurationForm.cantidadRequerida),
          valorNominal: configurationForm.valorNominal ? Number(configurationForm.valorNominal) : undefined,
          valorMinimo: configurationForm.valorMinimo ? Number(configurationForm.valorMinimo) : undefined,
        }, 'Material configurado para la unidad')}>
          <h2>Configurar material</h2>
          <label>Unidad<select value={configurationForm.unidadId} onChange={(event) => setConfigurationForm({ ...configurationForm, unidadId: event.target.value, sectorId: '' })} required><option value="">Seleccionar unidad</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.numero} - {unit.tipo}</option>)}</select></label>
          <label>Sector<select value={configurationForm.sectorId} onChange={(event) => setConfigurationForm({ ...configurationForm, sectorId: event.target.value })} required><option value="">Seleccionar sector</option>{visibleSectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.nombre}</option>)}</select></label>
          <label>Material<select value={configurationForm.materialId} onChange={(event) => setConfigurationForm({ ...configurationForm, materialId: event.target.value })} required><option value="">Seleccionar material</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.nombre}</option>)}</select></label>
          <div className={styles.inline}><label>Requerido<input type="number" min="0" step="0.01" value={configurationForm.cantidadRequerida} onChange={(event) => setConfigurationForm({ ...configurationForm, cantidadRequerida: event.target.value })} /></label><label>Nominal<input type="number" min="0" step="0.001" value={configurationForm.valorNominal} onChange={(event) => setConfigurationForm({ ...configurationForm, valorNominal: event.target.value })} /></label><label>Minimo<input type="number" min="0" step="0.001" value={configurationForm.valorMinimo} onChange={(event) => setConfigurationForm({ ...configurationForm, valorMinimo: event.target.value })} /></label></div>
          <button disabled={busy || units.length === 0 || sectors.length === 0 || materials.length === 0}>Configurar material</button>
        </form>
      </div>

      <div className={styles.tablePanel}>
        <h2>Configuraciones actuales</h2>
        {unitMaterials.length === 0 ? <p className={styles.empty}>Todavia no hay materiales asociados a unidades.</p> : <div className={styles.tableWrap}><table><thead><tr><th>Unidad</th><th>Sector</th><th>Material</th><th>Control</th><th>Requerido</th></tr></thead><tbody>{unitMaterials.map((configuration) => <tr key={configuration.id}><td>{configuration.unidad?.numero ?? configuration.unidadId}</td><td>{configuration.sector?.nombre ?? configuration.sectorId}</td><td>{configuration.material?.nombre ?? configuration.materialId}</td><td>{configuration.material?.tipoControl ?? '-'}</td><td>{configuration.cantidadRequerida}</td></tr>)}</tbody></table></div>}
      </div>
    </section>
  );
}
