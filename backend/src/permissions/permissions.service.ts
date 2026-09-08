import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Rol } from '../roles/entities/rol.entity';
import { Permiso } from './entities/permiso.entity';
import { RolPermiso } from './entities/rol-permiso.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
    @InjectRepository(RolPermiso)
    private readonly rolPermisoRepository: Repository<RolPermiso>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async findAll(): Promise<Permiso[]> {
    return this.permisoRepository.find({
      order: { modulo: 'ASC', nombre: 'ASC' },
    });
  }

  async assignPermissionsToRole(rolId: number, permisoIds: number[]): Promise<Rol> {
    const rol = await this.rolRepository.findOne({
      where: { id: rolId, activo: true },
      relations: { rolPermisos: true },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado o inactivo');
    }

    if (!Array.isArray(permisoIds)) {
      throw new BadRequestException('permisoIds debe ser un array');
    }

    const uniquePermisoIds = [...new Set(permisoIds)];

    if (uniquePermisoIds.length === 0) {
      await this.rolPermisoRepository.delete({ rolId });
      return this.rolRepository.findOneOrFail({
        where: { id: rolId },
        relations: { rolPermisos: { permiso: true } },
      });
    }

    const permisos = await this.permisoRepository.find({
      where: { id: In(uniquePermisoIds), activo: true },
    });

    if (permisos.length !== uniquePermisoIds.length) {
      throw new BadRequestException('Uno o más permisos no existen o están inactivos');
    }

    await this.rolPermisoRepository.delete({ rolId });

    await this.rolPermisoRepository.save(
      permisos.map((permiso) =>
        this.rolPermisoRepository.create({
          rolId: rol.id,
          permisoId: permiso.id,
        }),
      ),
    );

    return this.rolRepository.findOneOrFail({
      where: { id: rolId },
      relations: { rolPermisos: { permiso: true } },
    });
  }
}
