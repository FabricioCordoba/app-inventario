import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioItemInstancia } from './entities/inventario-item-instancia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioItemInstancia])],
  exports: [TypeOrmModule],
})
export class InventoryItemInstancesModule {}
