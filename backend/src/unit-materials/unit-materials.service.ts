import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../materials/entities/material.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { Unidad } from '../units/entities/unidad.entity';
import { CreateUnitMaterialDto } from './dto/create-unit-material.dto';
import { UpdateUnitMaterialDto } from './dto/update-unit-material.dto';
import { UnidadMaterial } from './entities/unidad-material.entity';

@Injectable()
export class UnitMaterialsService {
  constructor(
    @InjectRepository(UnidadMaterial)
    private readonly unidadMaterialRepository: Repository<UnidadMaterial>,
    @InjectRepository(Unidad)
    private readonly unidadRepository: Repository<Unidad>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
  ) {}

  async findAll(
    unitId?: number,
    sectorId?: number,
    materialId?: number,
    activo?: boolean,
  ): Promise<UnidadMaterial[]> {
    return this.unidadMaterialRepository.find({
      where: {
        ...(unitId !== undefined ? { unidadId: unitId } : {}),
        ...(sectorId !== undefined ? { sectorId } : {}),
        ...(materialId !== undefined ? { materialId } : {}),
        ...(activo === undefined ? {} : { activo }),
      },
      order: { id: 'ASC' },
      relations: {
        unidad: true,
        material: true,
        sector: true,
      },
    });
  }

  async findOneById(id: number): Promise<UnidadMaterial> {
    const item = await this.unidadMaterialRepository.findOne({
      where: { id },
      relations: {
        unidad: true,
        material: true,
        sector: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Configuración de material por unidad no encontrada');
    }

    return item;
  }

  async create(createDto: CreateUnitMaterialDto): Promise<UnidadMaterial> {
    const unidad = await this.unidadRepository.findOne({
      where: { id: createDto.unidadId },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    const material = await this.materialRepository.findOne({
      where: { id: createDto.materialId },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    const sector = await this.sectorRepository.findOne({
      where: {
        id: createDto.sectorId,
        unidadId: createDto.unidadId,
      },
    });

    if (!sector) {
      throw new NotFoundException('El sector no pertenece a la unidad seleccionada');
    }

    const existing = await this.unidadMaterialRepository.findOne({
      where: {
        unidadId: createDto.unidadId,
        materialId: createDto.materialId,
        sectorId: createDto.sectorId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Ya existe una configuración para ese material en la unidad y sector',
      );
    }

    const entity = this.unidadMaterialRepository.create({
      ...createDto,
      cantidadRequerida: createDto.cantidadRequerida ?? 0,
      activo: createDto.activo ?? true,
    });

    return this.unidadMaterialRepository.save(entity);
  }

  async update(id: number, updateDto: UpdateUnitMaterialDto): Promise<UnidadMaterial> {
    const current = await this.findOneById(id);

    if (updateDto.materialId !== undefined) {
      const material = await this.materialRepository.findOne({
        where: { id: updateDto.materialId },
      });

      if (!material) {
        throw new NotFoundException('Material no encontrado');
      }
    }

    if (updateDto.sectorId !== undefined) {
      const sector = await this.sectorRepository.findOne({
        where: {
          id: updateDto.sectorId,
          unidadId: current.unidadId,
        },
      });

      if (!sector) {
        throw new NotFoundException('El sector no pertenece a la unidad actual');
      }
    }

    const duplicate = await this.unidadMaterialRepository.findOne({
      where: {
        unidadId: current.unidadId,
        materialId: updateDto.materialId ?? current.materialId,
        sectorId: updateDto.sectorId ?? current.sectorId,
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException(
        'Ya existe una configuración para ese material en la unidad y sector',
      );
    }

    Object.assign(current, updateDto);
    await this.unidadMaterialRepository.save(current);

    return this.findOneById(id);
  }

  async setActive(id: number, activo: boolean): Promise<UnidadMaterial> {
    const item = await this.findOneById(id);
    item.activo = activo;
    await this.unidadMaterialRepository.save(item);
    return this.findOneById(id);
  }
}
