import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Novedad } from '../novelties/entities/novedad.entity';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [TypeOrmModule.forFeature([Unidad, Usuario, Inventario, Novedad])],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService, TypeOrmModule],
})
export class DashboardModule { }
