import { config } from 'dotenv';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import {
  JERARQUIAS_SEED,
  PERMISOS_SEED,
  ROLES_SEED,
  ROL_PERMISOS_SEED,
} from './seed-data';
import { Jerarquia } from '../../hierarchies/entities/jerarquia.entity';
import { Permiso } from '../../permissions/entities/permiso.entity';
import { Rol } from '../../roles/entities/rol.entity';
import { RolPermiso } from '../../permissions/entities/rol-permiso.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { UsuarioRol } from '../../roles/entities/usuario-rol.entity';

config({ path: join(__dirname, '../../../.env') });

async function runSeed(): Promise<void> {
  await dataSource.initialize();

  const jerarquiaRepo = dataSource.getRepository(Jerarquia);
  const permisoRepo = dataSource.getRepository(Permiso);
  const rolRepo = dataSource.getRepository(Rol);
  const rolPermisoRepo = dataSource.getRepository(RolPermiso);
  const usuarioRepo = dataSource.getRepository(Usuario);
  const usuarioRolRepo = dataSource.getRepository(UsuarioRol);

  for (const item of JERARQUIAS_SEED) {
    const exists = await jerarquiaRepo.findOne({ where: { nivel: item.nivel } });
    if (!exists) {
      await jerarquiaRepo.save(jerarquiaRepo.create({ ...item, activo: true }));
    }
  }

  for (const item of PERMISOS_SEED) {
    const exists = await permisoRepo.findOne({ where: { codigo: item.codigo } });
    if (!exists) {
      await permisoRepo.save(
        permisoRepo.create({ ...item, descripcion: null, activo: true }),
      );
    }
  }

  for (const item of ROLES_SEED) {
    const exists = await rolRepo.findOne({ where: { codigo: item.codigo } });
    if (!exists) {
      await rolRepo.save(rolRepo.create({ ...item, activo: true }));
    }
  }

  const permisos = await permisoRepo.find();
  const permisoByCodigo = new Map(permisos.map((p) => [p.codigo, p]));
  const roles = await rolRepo.find();
  const rolByCodigo = new Map(roles.map((r) => [r.codigo, r]));

  for (const [rolCodigo, permisosCodigos] of Object.entries(ROL_PERMISOS_SEED)) {
    const rol = rolByCodigo.get(rolCodigo);
    if (!rol) continue;

    for (const permisoCodigo of permisosCodigos) {
      const permiso = permisoByCodigo.get(permisoCodigo);
      if (!permiso) continue;

      const exists = await rolPermisoRepo.findOne({
        where: { rolId: rol.id, permisoId: permiso.id },
      });

      if (!exists) {
        await rolPermisoRepo.save(
          rolPermisoRepo.create({ rolId: rol.id, permisoId: permiso.id }),
        );
      }
    }
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@bvbarker.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  let admin = await usuarioRepo.findOne({ where: { email: adminEmail } });

  if (!admin) {
    const jerarquia = await jerarquiaRepo.findOne({
      where: { nombre: 'Comandante general' },
    });

    if (!jerarquia) {
      throw new Error('No se encontró la jerarquía Comandante general');
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    admin = await usuarioRepo.save(
      usuarioRepo.create({
        nombre: 'Administrador',
        apellido: 'Sistema',
        jerarquiaId: jerarquia.id,
        email: adminEmail,
        passwordHash,
        activo: true,
      }),
    );
  } else if (!(await bcrypt.compare(adminPassword, admin.passwordHash))) {
    admin.passwordHash = await bcrypt.hash(adminPassword, 12);
    admin.activo = true;
    await usuarioRepo.save(admin);
  }

  const rolAdmin = rolByCodigo.get('ADMINISTRADOR');
  if (rolAdmin) {
    const hasRole = await usuarioRolRepo.findOne({
      where: { usuarioId: admin.id, rolId: rolAdmin.id },
    });

    if (!hasRole) {
      await usuarioRolRepo.save(
        usuarioRolRepo.create({ usuarioId: admin.id, rolId: rolAdmin.id }),
      );
    }
  }

  await dataSource.destroy();
  console.log('Seed completado correctamente.');
}

runSeed().catch((error: unknown) => {
  console.error('Error ejecutando seed:', error);
  process.exit(1);
});
