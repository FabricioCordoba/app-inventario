import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoInventario, EstadoNovedad } from '../common/enums';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Novedad } from '../novelties/entities/novedad.entity';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Unidad)
        private readonly unidadRepository: Repository<Unidad>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        @InjectRepository(Inventario)
        private readonly inventarioRepository: Repository<Inventario>,
        @InjectRepository(Novedad)
        private readonly novedadRepository: Repository<Novedad>,
    ) { }

    async getSummary() {
        const [totalUnidades, totalUsuarios, totalInventarios, totalNovedades, inventarios] =
            await Promise.all([
                this.unidadRepository.count(),
                this.usuarioRepository.count(),
                this.inventarioRepository.count(),
                this.novedadRepository.count(),
                this.inventarioRepository.find({ select: ['estado'] }),
            ]);

        return {
            totalUnidades,
            totalUsuarios,
            totalInventarios,
            totalNovedades,
            inventariosEnProceso: inventarios.filter(
                (inventario) => inventario.estado === EstadoInventario.EN_PROCESO,
            ).length,
            inventariosCerrados: inventarios.filter(
                (inventario) => inventario.estado === EstadoInventario.CERRADO,
            ).length,
            inventariosCancelados: inventarios.filter(
                (inventario) => inventario.estado === EstadoInventario.CANCELADO,
            ).length,
            novedadesPendientes: await this.novedadRepository.count({
                where: { estado: EstadoNovedad.PENDIENTE },
            }),
            novedadesResueltas: await this.novedadRepository.count({
                where: { estado: EstadoNovedad.RESUELTO },
            }),
        };
    }
}
