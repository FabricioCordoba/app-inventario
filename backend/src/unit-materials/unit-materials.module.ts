import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadMaterial } from './entities/unidad-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMaterial])],
  exports: [TypeOrmModule],
})
export class UnitMaterialsModule {}
