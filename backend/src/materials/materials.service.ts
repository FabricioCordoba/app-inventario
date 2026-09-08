import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async findAll(activo?: boolean): Promise<Material[]> {
    return this.materialRepository.find({
      where: activo === undefined ? {} : { activo },
      order: { nombre: 'ASC' },
    });
  }

  async findOneById(id: number): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    return material;
  }

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    const nombre = createMaterialDto.nombre.trim();
    const exists = await this.materialRepository.findOne({
      where: { nombre },
    });

    if (exists) {
      throw new BadRequestException('Ya existe un material con ese nombre');
    }

    const material = this.materialRepository.create({
      ...createMaterialDto,
      nombre,
      activo: true,
      requiereInstancias: !!createMaterialDto.requiereInstancias,
    });

    return this.materialRepository.save(material);
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findOneById(id);

    if (updateMaterialDto.nombre !== undefined) {
      const nombre = updateMaterialDto.nombre.trim();
      const existing = await this.materialRepository.findOne({
        where: { nombre },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Ya existe un material con ese nombre');
      }

      material.nombre = nombre;
    }

    Object.assign(material, updateMaterialDto);
    await this.materialRepository.save(material);
    return this.findOneById(id);
  }

  async setActive(id: number, activo: boolean): Promise<Material> {
    const material = await this.findOneById(id);
    material.activo = activo;
    await this.materialRepository.save(material);
    return this.findOneById(id);
  }
}
