import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadMaterialInstancia } from './entities/unidad-material-instancia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMaterialInstancia])],
  exports: [TypeOrmModule],
})
export class UnitMaterialInstancesModule {}
