import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoNovedad } from '../common/enums';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Material } from '../materials/entities/material.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { CreateNoveltyDto } from './dto/create-novelty.dto';
import { UpdateNoveltyDto } from './dto/update-novelty.dto';
import { Novedad } from './entities/novedad.entity';

@Injectable()
export class NoveltiesService {
    constructor(
        @InjectRepository(Novedad)
        private readonly novedadRepository: Repository<Novedad>,
        @InjectRepository(Inventario)
        private readonly inventarioRepository: Repository<Inventario>,
        @InjectRepository(Unidad)
        private readonly unidadRepository: Repository<Unidad>,
        @InjectRepository(Sector)
        private readonly sectorRepository: Repository<Sector>,
        @InjectRepository(Material)
        private readonly materialRepository: Repository<Material>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) { }

    async findAll(
        inventarioId?: number,
        unidadId?: number,
        estado?: EstadoNovedad,
    ): Promise<Novedad[]> {
        return this.novedadRepository.find({
            where: {
                ...(inventarioId !== undefined ? { inventarioId } : {}),
                ...(unidadId !== undefined ? { unidadId } : {}),
                ...(estado !== undefined ? { estado } : {}),
            },
            order: { fechaRegistro: 'DESC', id: 'DESC' },
            relations: {
                inventario: true,
                unidad: true,
                sector: true,
                material: true,
                registradoPor: true,
                resueltoPor: true,
            },
        });
    }

    async findOneById(id: number): Promise<Novedad> {
        const novedad = await this.novedadRepository.findOne({
            where: { id },
            relations: {
                inventario: true,
                unidad: true,
                sector: true,
                material: true,
                registradoPor: true,
                resueltoPor: true,
            },
        });

        if (!novedad) {
            throw new NotFoundException('Novedad no encontrada');
        }

        return novedad;
    }

    private async validateReferenceData(
        unidadId: number,
        sectorId?: number,
        materialId?: number,
        inventarioId?: number,
    ): Promise<void> {
        const unidad = await this.unidadRepository.findOne({ where: { id: unidadId } });
        if (!unidad) {
            throw new NotFoundException('Unidad no encontrada');
        }

        if (sectorId !== undefined && sectorId !== null) {
            const sector = await this.sectorRepository.findOne({
                where: { id: sectorId, unidadId },
            });

            if (!sector) {
                throw new BadRequestException('El sector no pertenece a la unidad indicada');
            }
        }

        if (materialId !== undefined && materialId !== null) {
            const material = await this.materialRepository.findOne({
                where: { id: materialId, activo: true },
            });

            if (!material) {
                throw new NotFoundException('Material no encontrado o inactivo');
            }
        }

        if (inventarioId !== undefined && inventarioId !== null) {
            const inventario = await this.inventarioRepository.findOne({
                where: { id: inventarioId },
            });

            if (!inventario) {
                throw new NotFoundException('Inventario no encontrado');
            }

            if (inventario.unidadId !== unidadId) {
                throw new BadRequestException(
                    'El inventario no corresponde a la unidad de la novedad',
                );
            }
        }
    }

    async create(createDto: CreateNoveltyDto): Promise<Novedad> {
        if (!createDto.registradoPorId || createDto.registradoPorId <= 0) {
            throw new BadRequestException('Debe indicar un usuario responsable de la novedad');
        }

        const usuario = await this.usuarioRepository.findOne({
            where: { id: createDto.registradoPorId },
        });

        if (!usuario) {
            throw new NotFoundException('Usuario registrador no encontrado');
        }

        if (!usuario.activo) {
            throw new BadRequestException('El usuario registrador debe estar activo');
        }

        await this.validateReferenceData(
            createDto.unidadId,
            createDto.sectorId,
            createDto.materialId,
            createDto.inventarioId,
        );

        const novedad = this.novedadRepository.create({
            ...createDto,
            estado: EstadoNovedad.PENDIENTE,
            fechaRegistro: new Date(),
            fechaResolucion: null,
            observacionResolucion: null,
            resueltoPorId: null,
        });

        return this.novedadRepository.save(novedad);
    }

    async update(id: number, updateDto: UpdateNoveltyDto): Promise<Novedad> {
        const novedad = await this.findOneById(id);

        if (updateDto.unidadId !== undefined) {
            novedad.unidadId = updateDto.unidadId;
        }

        if (updateDto.inventarioId !== undefined) {
            novedad.inventarioId = updateDto.inventarioId;
        }

        if (updateDto.sectorId !== undefined) {
            novedad.sectorId = updateDto.sectorId;
        }

        if (updateDto.materialId !== undefined) {
            novedad.materialId = updateDto.materialId;
        }

        if (updateDto.descripcion !== undefined) {
            novedad.descripcion = updateDto.descripcion.trim();
        }

        await this.validateReferenceData(
            novedad.unidadId,
            novedad.sectorId ?? undefined,
            novedad.materialId ?? undefined,
            novedad.inventarioId ?? undefined,
        );

        await this.novedadRepository.save(novedad);
        return this.findOneById(id);
    }

    async resolve(
        id: number,
        resueltoPorId: number,
        observacionResolucion?: string,
    ): Promise<Novedad> {
        if (!resueltoPorId || resueltoPorId <= 0) {
            throw new BadRequestException('Debe indicar un usuario resolutor válido');
        }

        const novedad = await this.findOneById(id);

        const usuario = await this.usuarioRepository.findOne({
            where: { id: resueltoPorId },
        });

        if (!usuario) {
            throw new NotFoundException('Usuario resolutor no encontrado');
        }

        if (!usuario.activo) {
            throw new BadRequestException('El usuario resolutor debe estar activo');
        }

        novedad.estado = EstadoNovedad.RESUELTO;
        novedad.resueltoPorId = usuario.id;
        novedad.fechaResolucion = new Date();
        novedad.observacionResolucion = observacionResolucion?.trim() ?? null;

        await this.novedadRepository.save(novedad);
        return this.findOneById(id);
    }
}
