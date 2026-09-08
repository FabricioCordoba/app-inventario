import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Novedad } from '../novelties/entities/novedad.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
    imports: [TypeOrmModule.forFeature([Inventario, Novedad])],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService, TypeOrmModule],
})
export class ReportsModule { }
