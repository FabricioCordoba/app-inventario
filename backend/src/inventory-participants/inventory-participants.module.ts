import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { InventarioParticipante } from './entities/inventario-participante.entity';
import { InventoryParticipantsController } from './inventory-participants.controller';
import { InventoryParticipantsService } from './inventory-participants.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioParticipante, Inventario, Usuario])],
  controllers: [InventoryParticipantsController],
  providers: [InventoryParticipantsService],
  exports: [InventoryParticipantsService, TypeOrmModule],
})
export class InventoryParticipantsModule { }
