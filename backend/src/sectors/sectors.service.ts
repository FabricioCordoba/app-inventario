import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unidad } from '../units/entities/unidad.entity';
import { Sector } from './entities/sector.entity';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(Unidad)
    private readonly unidadRepository: Repository<Unidad>,
  ) {}

  async findAll(unitId?: number, activo?: boolean): Promise<Sector[]> {
    return this.sectorRepository.find({
      where: {
        ...(unitId !== undefined ? { unidadId: unitId } : {}),
        ...(activo === undefined ? {} : { activo }),
      },
      order: { unidadId: 'ASC', orden: 'ASC', id: 'ASC' },
    });
  }

  async findOneById(id: number): Promise<Sector> {
    const sector = await this.sectorRepository.findOne({
      where: { id },
      relations: { unidad: true },
    });

    if (!sector) {
      throw new NotFoundException('Sector no encontrado');
    }

    return sector;
  }

  async create(createSectorDto: CreateSectorDto): Promise<Sector> {
    const unidad = await this.unidadRepository.findOne({
      where: { id: createSectorDto.unidadId },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    const nombre = createSectorDto.nombre.trim();
    const existing = await this.sectorRepository.findOne({
      where: { unidadId: unidad.id, nombre },
    });

    if (existing) {
      throw new BadRequestException('Ya existe ese nombre de sector en la unidad');
    }

    const sector = this.sectorRepository.create({
      ...createSectorDto,
      nombre,
      activo: true,
      orden: createSectorDto.orden ?? 0,
    });

    return this.sectorRepository.save(sector);
  }

  async update(id: number, updateSectorDto: UpdateSectorDto): Promise<Sector> {
    const sector = await this.findOneById(id);

    if (updateSectorDto.nombre !== undefined) {
      const nombre = updateSectorDto.nombre.trim();
      const existing = await this.sectorRepository.findOne({
        where: { unidadId: sector.unidadId, nombre },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Ya existe ese nombre de sector en la unidad');
      }

      sector.nombre = nombre;
    }

    Object.assign(sector, updateSectorDto);
    await this.sectorRepository.save(sector);
    return this.findOneById(id);
  }

  async setActive(id: number, activo: boolean): Promise<Sector> {
    const sector = await this.findOneById(id);
    sector.activo = activo;
    await this.sectorRepository.save(sector);
    return this.findOneById(id);
  }
}
