import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioItem } from './entities/inventario-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioItem])],
  exports: [TypeOrmModule],
})
export class InventoryItemsModule {}
