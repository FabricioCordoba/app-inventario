import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermissions('USUARIOS_VER')
  @Get()
  findAll(@Query('activo') activoParam?: string) {
    const activo = activoParam === undefined ? undefined : activoParam === 'true';
    return this.usersService.findAll(activo);
  }

  @RequirePermissions('USUARIOS_VER')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @RequirePermissions('USUARIOS_CREAR')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @RequirePermissions('USUARIOS_DESACTIVAR')
  @Patch(':id/active')
  toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return this.usersService.setActive(id, activo);
  }
}
