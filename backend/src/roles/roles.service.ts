import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>,
    ) { }

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

        if (codigo.length > 50 || nombre.length > 100) {
            throw new BadRequestException('El código y el nombre exceden la longitud permitida');
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

    async update(id: number, data: { codigo?: string; nombre?: string; descripcion?: string }): Promise<Rol> {
        const rol = await this.findOneById(id);

        if (data.codigo !== undefined) {
            const codigo = data.codigo.trim();
            if (!codigo) {
                throw new BadRequestException('El código del rol es obligatorio');
            }
            if (!/^[A-Z0-9_]+$/.test(codigo)) {
                throw new BadRequestException(
                    'El código del rol solo puede contener letras mayúsculas, números y guiones bajos',
                );
            }
            if (codigo.length > 50) {
                throw new BadRequestException('El código del rol excede la longitud permitida');
            }

            const existing = await this.rolRepository.findOne({ where: { codigo } });
            if (existing && existing.id !== id) {
                throw new BadRequestException('Ya existe un rol con ese código');
            }
            rol.codigo = codigo;
        }

        if (data.nombre !== undefined) {
            const nombre = data.nombre.trim();
            if (!nombre) {
                throw new BadRequestException('El nombre del rol es obligatorio');
            }
            if (nombre.length > 100) {
                throw new BadRequestException('El nombre del rol excede la longitud permitida');
            }

            const existing = await this.rolRepository.findOne({ where: { nombre } });
            if (existing && existing.id !== id) {
                throw new BadRequestException('Ya existe un rol con ese nombre');
            }
            rol.nombre = nombre;
        }

        if (data.descripcion !== undefined) {
            rol.descripcion = data.descripcion?.trim() ? data.descripcion.trim() : null;
        }

        await this.rolRepository.save(rol);
        return this.findOneById(id);
    }

    async setActive(id: number, activo: boolean): Promise<Rol> {
        const rol = await this.findOneById(id);
        rol.activo = Boolean(activo);
        await this.rolRepository.save(rol);
        return this.findOneById(id);
    }
}
