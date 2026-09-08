import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @RequirePermissions('PERMISOS_VER')
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @RequirePermissions('PERMISOS_EDITAR')
  @Patch('roles/:rolId')
  assignPermissions(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Body('permisoIds') permisoIds: number[],
  ) {
    return this.permissionsService.assignPermissionsToRole(rolId, permisoIds);
  }
}
