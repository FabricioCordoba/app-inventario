import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioParticipante } from './entities/inventario-participante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioParticipante])],
  exports: [TypeOrmModule],
})
export class InventoryParticipantsModule {}
