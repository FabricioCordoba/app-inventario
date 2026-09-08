import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Material } from '../materials/entities/material.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Novedad } from './entities/novedad.entity';
import { NoveltiesController } from './novelties.controller';
import { NoveltiesService } from './novelties.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Novedad, Inventario, Unidad, Sector, Material, Usuario]),
  ],
  controllers: [NoveltiesController],
  providers: [NoveltiesService],
  exports: [NoveltiesService, TypeOrmModule],
})
export class NoveltiesModule { }
