import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unidad } from './entities/unidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unidad])],
  exports: [TypeOrmModule],
})
export class UnitsModule {}
