import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async findAll(): Promise<Rol[]> {
    return this.rolRepository.find({
      relations: { rolPermisos: { permiso: true }, usuarioRoles: true },
      order: { id: 'ASC' },
    });
  }

  async findOneById(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOne({
      where: { id },
      relations: { rolPermisos: { permiso: true }, usuarioRoles: true },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    return rol;
  }

  async create(data: { codigo: string; nombre: string; descripcion?: string }): Promise<Rol> {
    const codigo = data.codigo?.trim();
    const nombre = data.nombre?.trim();

    if (!codigo || !nombre) {
      throw new BadRequestException('El código y el nombre del rol son obligatorios');
    }

    if (!/^[A-Z0-9_]+$/.test(codigo)) {
      throw new BadRequestException(
        'El código del rol solo puede contener letras mayúsculas, números y guiones bajos',
      );
    }

    const exists = await this.rolRepository.findOne({
      where: [{ codigo }, { nombre }],
    });

    if (exists) {
      throw new BadRequestException('Ya existe un rol con ese código o nombre');
    }

    const rol = this.rolRepository.create({
      codigo,
      nombre,
      descripcion: data.descripcion?.trim() ?? null,
      activo: true,
    });

    return this.rolRepository.save(rol);
  }
}
