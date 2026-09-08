import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unidad } from '../units/entities/unidad.entity';
import { Sector } from './entities/sector.entity';
import { SectorsController } from './sectors.controller';
import { SectorsService } from './sectors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sector, Unidad])],
  controllers: [SectorsController],
  providers: [SectorsService],
  exports: [SectorsService, TypeOrmModule],
})
export class SectorsModule {}
