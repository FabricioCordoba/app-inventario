import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @RequirePermissions('REPORTES_VER')
    @Get('summary')
    getSummary() {
        return this.reportsService.getSummary();
    }
}
