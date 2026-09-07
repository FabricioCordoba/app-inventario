export const PERMISOS_SEED = [
  { codigo: 'USUARIOS_VER', nombre: 'Ver usuarios', modulo: 'usuarios' },
  { codigo: 'USUARIOS_CREAR', nombre: 'Crear usuarios', modulo: 'usuarios' },
  { codigo: 'USUARIOS_EDITAR', nombre: 'Editar usuarios', modulo: 'usuarios' },
  {
    codigo: 'USUARIOS_DESACTIVAR',
    nombre: 'Desactivar usuarios',
    modulo: 'usuarios',
  },
  { codigo: 'ROLES_VER', nombre: 'Ver roles', modulo: 'roles' },
  { codigo: 'ROLES_EDITAR', nombre: 'Editar roles', modulo: 'roles' },
  { codigo: 'PERMISOS_VER', nombre: 'Ver permisos', modulo: 'permisos' },
  { codigo: 'PERMISOS_EDITAR', nombre: 'Editar permisos', modulo: 'permisos' },
  { codigo: 'UNIDADES_VER', nombre: 'Ver unidades', modulo: 'unidades' },
  { codigo: 'UNIDADES_CREAR', nombre: 'Crear unidades', modulo: 'unidades' },
  { codigo: 'UNIDADES_EDITAR', nombre: 'Editar unidades', modulo: 'unidades' },
  {
    codigo: 'UNIDADES_DESACTIVAR',
    nombre: 'Desactivar unidades',
    modulo: 'unidades',
  },
  { codigo: 'SECTORES_VER', nombre: 'Ver sectores', modulo: 'sectores' },
  { codigo: 'SECTORES_CREAR', nombre: 'Crear sectores', modulo: 'sectores' },
  { codigo: 'SECTORES_EDITAR', nombre: 'Editar sectores', modulo: 'sectores' },
  {
    codigo: 'SECTORES_DESACTIVAR',
    nombre: 'Desactivar sectores',
    modulo: 'sectores',
  },
  { codigo: 'MATERIALES_VER', nombre: 'Ver materiales', modulo: 'materiales' },
  {
    codigo: 'MATERIALES_CREAR',
    nombre: 'Crear materiales',
    modulo: 'materiales',
  },
  {
    codigo: 'MATERIALES_EDITAR',
    nombre: 'Editar materiales',
    modulo: 'materiales',
  },
  {
    codigo: 'MATERIALES_DESACTIVAR',
    nombre: 'Desactivar materiales',
    modulo: 'materiales',
  },
  {
    codigo: 'UNIDAD_MATERIALES_VER',
    nombre: 'Ver configuración de materiales por unidad',
    modulo: 'unidad_materiales',
  },
  {
    codigo: 'UNIDAD_MATERIALES_EDITAR',
    nombre: 'Editar configuración de materiales por unidad',
    modulo: 'unidad_materiales',
  },
  {
    codigo: 'INVENTARIOS_VER',
    nombre: 'Ver inventarios',
    modulo: 'inventarios',
  },
  {
    codigo: 'INVENTARIOS_CREAR',
    nombre: 'Crear inventarios',
    modulo: 'inventarios',
  },
  {
    codigo: 'INVENTARIOS_EDITAR',
    nombre: 'Editar inventarios',
    modulo: 'inventarios',
  },
  {
    codigo: 'INVENTARIOS_CERRAR',
    nombre: 'Cerrar inventarios',
    modulo: 'inventarios',
  },
  { codigo: 'NOVEDADES_VER', nombre: 'Ver novedades', modulo: 'novedades' },
  {
    codigo: 'NOVEDADES_CREAR',
    nombre: 'Crear novedades',
    modulo: 'novedades',
  },
  {
    codigo: 'NOVEDADES_EDITAR',
    nombre: 'Editar novedades',
    modulo: 'novedades',
  },
  {
    codigo: 'NOVEDADES_RESOLVER',
    nombre: 'Resolver novedades',
    modulo: 'novedades',
  },
  { codigo: 'REPORTES_VER', nombre: 'Ver reportes', modulo: 'reportes' },
  {
    codigo: 'REPORTES_EXPORTAR',
    nombre: 'Exportar reportes',
    modulo: 'reportes',
  },
  { codigo: 'AUDITORIA_VER', nombre: 'Ver auditoría', modulo: 'auditoria' },
  { codigo: 'DASHBOARD_VER', nombre: 'Ver dashboard', modulo: 'dashboard' },
] as const;

export const ROLES_SEED = [
  {
    codigo: 'ADMINISTRADOR',
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
  },
  {
    codigo: 'INVENTARIOS',
    nombre: 'Inventarios',
    descripcion: 'Operación de inventarios',
  },
  {
    codigo: 'UNIDADES',
    nombre: 'Unidades',
    descripcion: 'Gestión de unidades, sectores y materiales',
  },
] as const;

export const JERARQUIAS_SEED = [
  { nombre: 'Comandante general', nivel: 14 },
  { nombre: 'Comandante mayor', nivel: 13 },
  { nombre: 'Comandante', nivel: 12 },
  { nombre: 'Subcomandante', nivel: 11 },
  { nombre: 'Oficial auxiliar de dotación', nivel: 10 },
  { nombre: 'Oficial auxiliar de escuadra', nivel: 9 },
  { nombre: 'Oficial auxiliar', nivel: 8 },
  { nombre: 'Ayudante mayor', nivel: 7 },
  { nombre: 'Ayudante principal', nivel: 6 },
  { nombre: 'Ayudante de primera', nivel: 5 },
  { nombre: 'Ayudante', nivel: 4 },
  { nombre: 'Subayudante', nivel: 3 },
  { nombre: 'Bombero', nivel: 2 },
  { nombre: 'Cadete', nivel: 1 },
] as const;

const ALL_PERMISSIONS = PERMISOS_SEED.map((p) => p.codigo);

const INVENTARIOS_PERMISSIONS = [
  'INVENTARIOS_VER',
  'INVENTARIOS_CREAR',
  'INVENTARIOS_EDITAR',
  'INVENTARIOS_CERRAR',
  'NOVEDADES_VER',
  'NOVEDADES_CREAR',
  'NOVEDADES_EDITAR',
  'NOVEDADES_RESOLVER',
  'REPORTES_VER',
  'REPORTES_EXPORTAR',
  'DASHBOARD_VER',
];

const UNIDADES_PERMISSIONS = [
  'UNIDADES_VER',
  'UNIDADES_CREAR',
  'UNIDADES_EDITAR',
  'UNIDADES_DESACTIVAR',
  'SECTORES_VER',
  'SECTORES_CREAR',
  'SECTORES_EDITAR',
  'SECTORES_DESACTIVAR',
  'MATERIALES_VER',
  'MATERIALES_CREAR',
  'MATERIALES_EDITAR',
  'MATERIALES_DESACTIVAR',
  'UNIDAD_MATERIALES_VER',
  'UNIDAD_MATERIALES_EDITAR',
  'INVENTARIOS_VER',
  'REPORTES_VER',
  'REPORTES_EXPORTAR',
  'DASHBOARD_VER',
];

export const ROL_PERMISOS_SEED: Record<string, readonly string[]> = {
  ADMINISTRADOR: ALL_PERMISSIONS,
  INVENTARIOS: INVENTARIOS_PERMISSIONS,
  UNIDADES: UNIDADES_PERMISSIONS,
};
