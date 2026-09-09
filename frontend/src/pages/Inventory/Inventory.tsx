import { FormEvent, useEffect, useState } from 'react';
import styles from './Inventory.module.css';

type Unit = { id: number; numero: string; tipo: string };
type User = { id: number; nombre: string; apellido: string; jerarquia?: { nombre: string; nivel: number } };
type Inventory = { id: number; unidadId: number; responsableId: number; estado: string; fechaInicio: string };
type Instance = { id: number; identificador: string; numeroSerie: string | null; valorMedido: number | null; estado: string; observacion: string | null };
type Item = {
  id: number;
  sectorNombre: string;
  materialNombre: string;
  tipoControl: string;
  unidadMedida: string;
  cantidadRequerida: number | null;
  cantidadEncontrada: number | null;
  valorNominal: number | null;
  valorMedido: number | null;
  estado: string;
  observacion: string | null;
  instancias: Instance[];
};

type ItemDraft = { cantidadEncontrada: string; valorMedido: string; estado: string; observacion: string };

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` });

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options?.headers },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
    throw new Error(message ?? 'No se pudo completar la operación');
  }
  return payload as T;
}

export function InventoryPage() {
  const currentUser = JSON.parse(localStorage.getItem('auth_user') ?? 'null') as User | null;
  const [units, setUnits] = useState<Unit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [drafts, setDrafts] = useState<Record<number, ItemDraft>>({});
  const [unitId, setUnitId] = useState('');
  const [participantIds, setParticipantIds] = useState<number[]>(currentUser ? [currentUser.id] : []);
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([request<Unit[]>('/units?activo=true'), request<User[]>('/users?activo=true')])
      .then(([unitData, userData]) => {
        setUnits(unitData);
        setUsers(userData);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos'));
  }, []);

  const setItemsWithDrafts = (itemData: Item[]) => {
    setItems(itemData);
    setDrafts(Object.fromEntries(itemData.map((item) => [item.id, {
      cantidadEncontrada: item.cantidadEncontrada?.toString() ?? '',
      valorMedido: item.valorMedido?.toString() ?? '',
      estado: item.estado,
      observacion: item.observacion ?? '',
    }])));
  };

  const createInventory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const created = await request<Inventory>('/inventories', {
        method: 'POST',
        body: JSON.stringify({
          unidadId: Number(unitId),
          responsableId: currentUser?.id,
          participanteIds,
          observacionesGenerales: observations.trim() || undefined,
        }),
      });
      const generated = await request<Item[]>('/inventory-items/generate', {
        method: 'POST',
        body: JSON.stringify({ inventarioId: created.id }),
      });
      setInventory(created);
      setItemsWithDrafts(generated);
      setNotice('Inventario iniciado y materiales cargados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el inventario');
    } finally {
      setBusy(false);
    }
  };

  const updateDraft = (itemId: number, patch: Partial<ItemDraft>) => {
    setDrafts((current) => ({ ...current, [itemId]: { ...current[itemId], ...patch } }));
  };

  const saveItem = async (item: Item) => {
    const draft = drafts[item.id];
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const updated = await request<Item>(`/inventory-items/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          cantidadEncontrada: item.tipoControl === 'CANTIDAD' && draft.cantidadEncontrada !== '' ? Number(draft.cantidadEncontrada) : undefined,
          valorMedido: item.tipoControl !== 'CANTIDAD' && draft.valorMedido !== '' ? Number(draft.valorMedido) : undefined,
          estado: draft.estado,
          observacion: draft.observacion.trim() || null,
        }),
      });
      setItems((current) => current.map((currentItem) => currentItem.id === updated.id ? updated : currentItem));
      setNotice(`${item.materialNombre} actualizado.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el material');
    } finally {
      setBusy(false);
    }
  };

  const toggleParticipant = (id: number) => {
    if (id === currentUser?.id) return;
    setParticipantIds((current) => current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id]);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Operación de inventario</p>
          <h1>{inventory ? `Inventario #${inventory.id}` : 'Nuevo inventario'}</h1>
          <p className={styles.subtitle}>El responsable es {currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'el usuario actual'}.</p>
        </div>
        {inventory && <span className={styles.status}>{inventory.estado}</span>}
      </header>

      {error && <p className={styles.alert} role="alert">{error}</p>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}

      {!inventory ? (
        <form className={styles.startPanel} onSubmit={createInventory}>
          <h2>Preparar control</h2>
          <label>Unidad<select value={unitId} onChange={(event) => setUnitId(event.target.value)} required><option value="">Seleccionar unidad</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.numero} - {unit.tipo}</option>)}</select></label>
          <label>Observaciones generales<textarea value={observations} onChange={(event) => setObservations(event.target.value)} rows={3} /></label>
          <fieldset>
            <legend>Participantes</legend>
            {users.map((user) => <label className={styles.participant} key={user.id}><input type="checkbox" checked={participantIds.includes(user.id)} disabled={user.id === currentUser?.id} onChange={() => toggleParticipant(user.id)} /><span>{user.nombre} {user.apellido}</span><small>{user.jerarquia?.nombre ?? 'Sin jerarquía'}</small></label>)}
          </fieldset>
          <button className={styles.primaryButton} disabled={busy || !currentUser}>{busy ? 'Iniciando...' : 'Iniciar inventario'}</button>
        </form>
      ) : (
        <div className={styles.items}>
          <div className={styles.itemsHeader}><h2>Control de materiales</h2><span>{items.length} elementos</span></div>
          {items.length === 0 ? <p className={styles.empty}>No hay materiales configurados para esta unidad.</p> : items.map((item) => {
            const draft = drafts[item.id];
            return <article className={styles.item} key={item.id}>
              <div className={styles.itemTitle}><div><span className={styles.sector}>{item.sectorNombre}</span><h3>{item.materialNombre}</h3></div><strong className={styles.itemState}>{item.estado}</strong></div>
              <div className={styles.itemMeta}><span>Control: {item.tipoControl}</span>{item.cantidadRequerida !== null && <span>Requerido: {item.cantidadRequerida} {item.unidadMedida}</span>}{item.valorNominal !== null && <span>Nominal: {item.valorNominal} {item.unidadMedida}</span>}</div>
              <div className={styles.itemForm}>{item.tipoControl === 'CANTIDAD' ? <label>Encontrado<input type="number" min="0" step="0.01" value={draft?.cantidadEncontrada ?? ''} onChange={(event) => updateDraft(item.id, { cantidadEncontrada: event.target.value })} /></label> : <label>Medido ({item.unidadMedida})<input type="number" min="0" step="0.001" value={draft?.valorMedido ?? ''} onChange={(event) => updateDraft(item.id, { valorMedido: event.target.value })} /></label>}<label>Estado<select value={draft?.estado ?? item.estado} onChange={(event) => updateDraft(item.id, { estado: event.target.value })}><option value="OK">OK</option><option value="OBSERVACION">Observación</option><option value="FUERA_DE_SERVICIO">Fuera de servicio</option><option value="FALTANTE">Faltante</option><option value="MANTENIMIENTO">Mantenimiento</option></select></label></div>
              {item.instancias.length > 0 && <div className={styles.instances}>{item.instancias.map((instance) => <span key={instance.id}>{instance.identificador} · {instance.estado}</span>)}</div>}
              <label>Observación<textarea rows={2} value={draft?.observacion ?? ''} onChange={(event) => updateDraft(item.id, { observacion: event.target.value })} /></label>
              <button className={styles.secondaryButton} type="button" disabled={busy} onClick={() => void saveItem(item)}>Guardar material</button>
            </article>;
          })}
        </div>
      )}
    </section>
  );
}
