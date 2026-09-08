import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unidad } from './entities/unidad.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unidad)
    private readonly unidadRepository: Repository<Unidad>,
  ) {}

  async findAll(activo?: boolean): Promise<Unidad[]> {
    return this.unidadRepository.find({
      where: activo === undefined ? {} : { activo },
      order: { id: 'ASC' },
      relations: { sectores: true },
    });
  }

  async findOneById(id: number): Promise<Unidad> {
    const unidad = await this.unidadRepository.findOne({
      where: { id },
      relations: { sectores: true },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    return unidad;
  }

  async create(createUnitDto: CreateUnitDto): Promise<Unidad> {
    const numero = createUnitDto.numero.trim();
    const exists = await this.unidadRepository.findOne({
      where: { numero },
    });

    if (exists) {
      throw new BadRequestException('Ya existe una unidad con ese número');
    }

    const unidad = this.unidadRepository.create({
      ...createUnitDto,
      numero,
      activo: true,
    });

    return this.unidadRepository.save(unidad);
  }

  async update(id: number, updateUnitDto: UpdateUnitDto): Promise<Unidad> {
    const unidad = await this.findOneById(id);

    if (updateUnitDto.numero !== undefined) {
      const numero = updateUnitDto.numero.trim();
      const existing = await this.unidadRepository.findOne({
        where: { numero },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Ya existe una unidad con ese número');
      }

      unidad.numero = numero;
    }

    Object.assign(unidad, updateUnitDto);
    await this.unidadRepository.save(unidad);
    return this.findOneById(id);
  }

  async setActive(id: number, activo: boolean): Promise<Unidad> {
    const unidad = await this.findOneById(id);
    unidad.activo = activo;
    await this.unidadRepository.save(unidad);
    return this.findOneById(id);
  }
}
