import { Jerarquia } from '../../hierarchies/entities/jerarquia.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { Rol } from '../../roles/entities/rol.entity';
import { UsuarioRol } from '../../roles/entities/usuario-rol.entity';
import { Permiso } from '../../permissions/entities/permiso.entity';
import { RolPermiso } from '../../permissions/entities/rol-permiso.entity';
import { Unidad } from '../../units/entities/unidad.entity';
import { Sector } from '../../sectors/entities/sector.entity';
import { Material } from '../../materials/entities/material.entity';
import { UnidadMaterial } from '../../unit-materials/entities/unidad-material.entity';
import { UnidadMaterialInstancia } from '../../unit-material-instances/entities/unidad-material-instancia.entity';
import { Inventario } from '../../inventories/entities/inventario.entity';
import { InventarioParticipante } from '../../inventory-participants/entities/inventario-participante.entity';
import { InventarioItem } from '../../inventory-items/entities/inventario-item.entity';
import { InventarioItemInstancia } from '../../inventory-item-instances/entities/inventario-item-instancia.entity';
import { Novedad } from '../../novelties/entities/novedad.entity';
import { Auditoria } from '../../audit/entities/auditoria.entity';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity';

export const entities = [
  Jerarquia,
  Usuario,
  Rol,
  UsuarioRol,
  Permiso,
  RolPermiso,
  Unidad,
  Sector,
  Material,
  UnidadMaterial,
  UnidadMaterialInstancia,
  Inventario,
  InventarioParticipante,
  InventarioItem,
  InventarioItemInstancia,
  Novedad,
  Auditoria,
  PasswordResetToken,
];
