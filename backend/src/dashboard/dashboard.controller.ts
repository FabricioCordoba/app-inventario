import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @RequirePermissions('DASHBOARD_VER')
    @Get('summary')
    getSummary() {
        return this.dashboardService.getSummary();
    }
}
