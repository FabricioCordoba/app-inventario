import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EstadoInventario, EstadoMaterial, TipoControl } from '../common/enums';
import { Inventario } from '../inventories/entities/inventario.entity';
import { InventarioItemInstancia } from '../inventory-item-instances/entities/inventario-item-instancia.entity';
import { UnidadMaterial } from '../unit-materials/entities/unidad-material.entity';
import { InventarioItem } from './entities/inventario-item.entity';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryItemsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(InventarioItem)
    private readonly itemRepository: Repository<InventarioItem>,
    @InjectRepository(InventarioItemInstancia)
    private readonly itemInstanceRepository: Repository<InventarioItemInstancia>,
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
    @InjectRepository(UnidadMaterial)
    private readonly unidadMaterialRepository: Repository<UnidadMaterial>,
  ) {}

  async findAll(inventarioId: number): Promise<InventarioItem[]> {
    return this.itemRepository.find({
      where: { inventarioId },
      order: { sectorId: 'ASC', id: 'ASC' },
      relations: {
        material: true,
        sector: true,
        instancias: { unidadMaterialInstancia: true },
      },
    });
  }

  async findOneById(id: number): Promise<InventarioItem> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: {
        inventario: true,
        material: true,
        sector: true,
        instancias: { unidadMaterialInstancia: true },
      },
    });

    if (!item) {
      throw new NotFoundException('Ítem de inventario no encontrado');
    }

    return item;
  }

  async generateForInventory(inventarioId: number): Promise<InventarioItem[]> {
    return this.dataSource.transaction(async (manager) => {
      const inventario = await manager.getRepository(Inventario).findOne({
        where: { id: inventarioId },
      });

      if (!inventario) {
        throw new NotFoundException('Inventario no encontrado');
      }

      this.ensureInventoryOpen(inventario);

      const configurations = await manager.getRepository(UnidadMaterial).find({
        where: { unidadId: inventario.unidadId, activo: true },
        relations: { material: true, sector: true, instancias: true },
        order: { sectorId: 'ASC', id: 'ASC' },
      });

      const itemRepository = manager.getRepository(InventarioItem);
      const instanceRepository = manager.getRepository(InventarioItemInstancia);
      const existingItems = await itemRepository.find({
        where: { inventarioId },
      });
      const existingByConfiguration = new Map(
        existingItems
          .filter((item) => item.unidadMaterialId !== null)
          .map((item) => [item.unidadMaterialId as number, item]),
      );

      for (const configuration of configurations) {
        if (existingByConfiguration.has(configuration.id)) {
          continue;
        }

        const item = await itemRepository.save(
          itemRepository.create({
            inventarioId,
            unidadMaterialId: configuration.id,
            materialId: configuration.materialId,
            sectorId: configuration.sectorId,
            materialNombre: configuration.material.nombre,
            sectorNombre: configuration.sector.nombre,
            tipoControl: configuration.material.tipoControl,
            cantidadRequerida:
              configuration.material.tipoControl === TipoControl.CANTIDAD
                ? configuration.cantidadRequerida
                : null,
            cantidadEncontrada: null,
            valorNominal: configuration.valorNominal,
            valorMedido: null,
            valorMinimo: configuration.valorMinimo,
            unidadMedida: configuration.material.unidadMedida,
            estado: EstadoMaterial.FALTANTE,
            observacion: null,
          }),
        );

        if (configuration.instancias?.length) {
          await instanceRepository.save(
            configuration.instancias
              .filter((instance) => instance.activo)
              .map((instance) =>
                instanceRepository.create({
                  inventarioItemId: item.id,
                  unidadMaterialInstanciaId: instance.id,
                  identificador: instance.identificador,
                  numeroSerie: instance.numeroSerie,
                  valorMedido: null,
                  estado: EstadoMaterial.FALTANTE,
                  observacion: null,
                }),
              ),
          );
        }
      }

      return itemRepository.find({
        where: { inventarioId },
        order: { sectorId: 'ASC', id: 'ASC' },
        relations: {
          material: true,
          sector: true,
          instancias: { unidadMaterialInstancia: true },
        },
      });
    });
  }

  async update(id: number, updateDto: UpdateInventoryItemDto): Promise<InventarioItem> {
    const item = await this.findOneById(id);
    this.ensureInventoryOpen(item.inventario);

    if (updateDto.cantidadEncontrada !== undefined) {
      if (item.tipoControl !== TipoControl.CANTIDAD) {
        throw new BadRequestException(
          'Este material no se controla mediante cantidad',
        );
      }

      item.cantidadEncontrada = updateDto.cantidadEncontrada;
    }

    if (updateDto.valorMedido !== undefined) {
      if (item.tipoControl === TipoControl.CANTIDAD) {
        throw new BadRequestException(
          'Este material no requiere una medición de capacidad o presión',
        );
      }

      item.valorMedido = updateDto.valorMedido;
    }

    if (updateDto.observacion !== undefined) {
      item.observacion = updateDto.observacion?.trim() || null;
    }

    const calculatedState = this.calculateQuantityState(item);
    item.estado = calculatedState ?? updateDto.estado ?? item.estado;

    if (
      item.cantidadEncontrada !== null &&
      item.cantidadRequerida !== null &&
      item.cantidadEncontrada > item.cantidadRequerida &&
      !item.observacion
    ) {
      throw new BadRequestException(
        'La observación es obligatoria cuando la cantidad encontrada supera la requerida',
      );
    }

    if (
      item.estado !== EstadoMaterial.OK &&
      !item.observacion
    ) {
      throw new BadRequestException(
        'La observación es obligatoria para el estado seleccionado',
      );
    }

    await this.itemRepository.save(item);
    return this.findOneById(id);
  }

  private calculateQuantityState(item: InventarioItem): EstadoMaterial | null {
    if (
      item.tipoControl !== TipoControl.CANTIDAD ||
      item.cantidadEncontrada === null ||
      item.cantidadRequerida === null
    ) {
      return null;
    }

    if (item.cantidadEncontrada < item.cantidadRequerida) {
      return EstadoMaterial.FALTANTE;
    }

    if (item.cantidadEncontrada === item.cantidadRequerida) {
      return EstadoMaterial.OK;
    }

    return EstadoMaterial.OBSERVACION;
  }

  private ensureInventoryOpen(inventario: Inventario): void {
    if (inventario.estado !== EstadoInventario.EN_PROCESO) {
      throw new BadRequestException(
        'Solo se pueden modificar ítems de un inventario en proceso',
      );
    }
  }
}
