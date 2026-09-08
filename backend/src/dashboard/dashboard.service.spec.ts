import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventario } from '../inventories/entities/inventario.entity';
import { Novedad } from '../novelties/entities/novedad.entity';
import { Unidad } from '../units/entities/unidad.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
    let service: DashboardService;

    const inventarioRepo = {
        count: jest.fn(),
        find: jest.fn(),
    };
    const unidadRepo = { count: jest.fn() };
    const usuarioRepo = { count: jest.fn() };
    const novedadRepo = { count: jest.fn() };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                DashboardService,
                { provide: getRepositoryToken(Inventario), useValue: inventarioRepo },
                { provide: getRepositoryToken(Unidad), useValue: unidadRepo },
                { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
                { provide: getRepositoryToken(Novedad), useValue: novedadRepo },
            ],
        }).compile();

        service = moduleRef.get<DashboardService>(DashboardService);
        jest.clearAllMocks();
    });

    it('should return aggregate dashboard metrics', async () => {
        unidadRepo.count.mockResolvedValue(12);
        usuarioRepo.count.mockResolvedValue(30);
        inventarioRepo.count.mockResolvedValue(8);
        novedadRepo.count.mockResolvedValue(5);
        inventarioRepo.find.mockResolvedValue([
            { estado: 'EN_PROCESO' },
            { estado: 'CERRADO' },
            { estado: 'EN_PROCESO' },
        ]);

        const result = await service.getSummary();

        expect(result.totalUnidades).toBe(12);
        expect(result.totalUsuarios).toBe(30);
        expect(result.totalInventarios).toBe(8);
        expect(result.totalNovedades).toBe(5);
        expect(result.inventariosEnProceso).toBe(2);
        expect(result.inventariosCerrados).toBe(1);
    });
});
