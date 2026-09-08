import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @RequirePermissions('ROLES_VER')
    @Get()
    findAll() {
        return this.rolesService.findAll();
    }

    @RequirePermissions('ROLES_VER')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOneById(id);
    }

    @RequirePermissions('ROLES_EDITAR')
    @Post()
    create(@Body() body: { codigo: string; nombre: string; descripcion?: string }) {
        return this.rolesService.create(body);
    }

    @RequirePermissions('ROLES_EDITAR')
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { codigo?: string; nombre?: string; descripcion?: string },
    ) {
        return this.rolesService.update(id, body);
    }

    @RequirePermissions('ROLES_EDITAR')
    @Patch(':id/active')
    setActive(
        @Param('id', ParseIntPipe) id: number,
        @Body('activo') activo: boolean,
    ) {
        return this.rolesService.setActive(id, activo);
    }
}
