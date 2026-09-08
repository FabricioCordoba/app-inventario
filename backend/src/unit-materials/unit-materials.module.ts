import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from '../materials/entities/material.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { Unidad } from '../units/entities/unidad.entity';
import { UnidadMaterial } from './entities/unidad-material.entity';
import { UnitMaterialsController } from './unit-materials.controller';
import { UnitMaterialsService } from './unit-materials.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMaterial, Unidad, Material, Sector])],
  controllers: [UnitMaterialsController],
  providers: [UnitMaterialsService],
  exports: [UnitMaterialsService, TypeOrmModule],
})
export class UnitMaterialsModule {}
