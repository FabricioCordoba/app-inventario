import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoInventario, EstadoNovedad } from '../common/enums';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Novedad } from '../novelties/entities/novedad.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Inventario)
        private readonly inventarioRepository: Repository<Inventario>,
        @InjectRepository(Novedad)
        private readonly novedadRepository: Repository<Novedad>,
    ) { }

    async getSummary() {
        const [inventarios, novedades] = await Promise.all([
            this.inventarioRepository.find(),
            this.novedadRepository.find(),
        ]);

        return {
            inventariosTotales: inventarios.length,
            inventariosEnProceso: inventarios.filter(
                (item) => item.estado === EstadoInventario.EN_PROCESO,
            ).length,
            inventariosCerrados: inventarios.filter(
                (item) => item.estado === EstadoInventario.CERRADO,
            ).length,
            novedadesTotales: novedades.length,
            novedadesPendientes: novedades.filter(
                (item) => item.estado === EstadoNovedad.PENDIENTE,
            ).length,
            novedadesResueltas: novedades.filter(
                (item) => item.estado === EstadoNovedad.RESUELTO,
            ).length,
        };
    }
}
