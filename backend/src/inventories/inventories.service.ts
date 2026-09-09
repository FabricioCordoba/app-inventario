import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoInventario } from '../common/enums';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventario } from './entities/inventario.entity';
import { InventoryItemsService } from '../inventory-items/inventory-items.service';

@Injectable()
export class InventoriesService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
    @InjectRepository(Unidad)
    private readonly unidadRepository: Repository<Unidad>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly inventoryItemsService: InventoryItemsService,
  ) {}

  async findAll(
    unidadId?: number,
    responsableId?: number,
    estado?: EstadoInventario,
  ): Promise<Inventario[]> {
    return this.inventarioRepository.find({
      where: {
        ...(unidadId !== undefined ? { unidadId } : {}),
        ...(responsableId !== undefined ? { responsableId } : {}),
        ...(estado !== undefined ? { estado } : {}),
      },
      order: { fechaInicio: 'DESC', id: 'DESC' },
      relations: { unidad: true, responsable: true },
    });
  }

  async findOneById(id: number): Promise<Inventario> {
    const inventario = await this.inventarioRepository.findOne({
      where: { id },
      relations: { unidad: true, responsable: true },
    });

    if (!inventario) {
      throw new NotFoundException('Inventario no encontrado');
    }

    return inventario;
  }

  private async validateUnidadAndResponsible(
    unidadId: number,
    responsableId: number,
  ): Promise<void> {
    const unidad = await this.unidadRepository.findOne({ where: { id: unidadId } });
    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }

    const responsable = await this.usuarioRepository.findOne({
      where: { id: responsableId },
    });

    if (!responsable) {
      throw new NotFoundException('Responsable no encontrado');
    }

    if (!responsable.activo) {
      throw new BadRequestException(
        'No se puede asignar un responsable inactivo a un inventario',
      );
    }
  }

  async create(createDto: CreateInventoryDto): Promise<Inventario> {
    await this.validateUnidadAndResponsible(
      createDto.unidadId,
      createDto.responsableId,
    );

    const inventario = this.inventarioRepository.create({
      ...createDto,
      fechaInicio: createDto.fechaInicio
        ? new Date(createDto.fechaInicio)
        : new Date(),
      fechaCierre: null,
      estado: createDto.estado ?? EstadoInventario.EN_PROCESO,
    });

    return this.inventarioRepository.save(inventario);
  }

  async update(id: number, updateDto: UpdateInventoryDto): Promise<Inventario> {
    const inventario = await this.findOneById(id);

    if (updateDto.unidadId !== undefined || updateDto.responsableId !== undefined) {
      await this.validateUnidadAndResponsible(
        updateDto.unidadId ?? inventario.unidadId,
        updateDto.responsableId ?? inventario.responsableId,
      );
    }

    if (updateDto.fechaInicio !== undefined) {
      inventario.fechaInicio = new Date(updateDto.fechaInicio);
    }

    if (updateDto.fechaCierre !== undefined) {
      inventario.fechaCierre = updateDto.fechaCierre
        ? new Date(updateDto.fechaCierre)
        : null;
    }

    if (updateDto.estado !== undefined) {
      inventario.estado = updateDto.estado;
      if (
        updateDto.estado === EstadoInventario.CERRADO &&
        inventario.fechaCierre === null
      ) {
        inventario.fechaCierre = new Date();
      }
      if (
        updateDto.estado === EstadoInventario.EN_PROCESO &&
        inventario.fechaCierre !== null
      ) {
        inventario.fechaCierre = null;
      }
    }

    Object.assign(inventario, updateDto);
    await this.inventarioRepository.save(inventario);
    return this.findOneById(id);
  }

  async close(id: number): Promise<Inventario> {
    const inventario = await this.findOneById(id);

    if (inventario.estado !== EstadoInventario.EN_PROCESO) {
      throw new BadRequestException(
        'Solo se puede cerrar un inventario que esté en proceso',
      );
    }

    await this.inventoryItemsService.generateForInventory(id);

    inventario.estado = EstadoInventario.CERRADO;
    inventario.fechaCierre = new Date();
    await this.inventarioRepository.save(inventario);
    return this.findOneById(id);
  }

  async cancel(id: number): Promise<Inventario> {
    const inventario = await this.findOneById(id);

    if (inventario.estado === EstadoInventario.CERRADO) {
      throw new BadRequestException(
        'No se puede cancelar un inventario ya cerrado',
      );
    }

    inventario.estado = EstadoInventario.CANCELADO;
    inventario.fechaCierre = new Date();
    await this.inventarioRepository.save(inventario);
    return this.findOneById(id);
  }
}
