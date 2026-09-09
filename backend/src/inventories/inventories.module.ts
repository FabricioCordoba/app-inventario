import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItemsModule } from '../inventory-items/inventory-items.module';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Inventario } from './entities/inventario.entity';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inventario, Unidad, Usuario]), InventoryItemsModule],
  controllers: [InventoriesController],
  providers: [InventoriesService],
  exports: [InventoriesService, TypeOrmModule],
})
export class InventoriesModule {}
