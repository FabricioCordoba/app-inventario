import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioItemInstancia } from '../inventory-item-instances/entities/inventario-item-instancia.entity';
import { Inventario } from '../inventories/entities/inventario.entity';
import { UnidadMaterial } from '../unit-materials/entities/unidad-material.entity';
import { InventarioItem } from './entities/inventario-item.entity';
import { InventoryItemsController } from './inventory-items.controller';
import { InventoryItemsService } from './inventory-items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventarioItem,
      InventarioItemInstancia,
      Inventario,
      UnidadMaterial,
    ]),
  ],
  controllers: [InventoryItemsController],
  providers: [InventoryItemsService],
  exports: [InventoryItemsService, TypeOrmModule],
})
export class InventoryItemsModule {}
