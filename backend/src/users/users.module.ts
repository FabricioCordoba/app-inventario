import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jerarquia } from '../hierarchies/entities/jerarquia.entity';
import { Rol } from '../roles/entities/rol.entity';
import { UsuarioRol } from '../roles/entities/usuario-rol.entity';
import { UsersController } from './users.controller';
import { Usuario } from './entities/usuario.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Jerarquia, Rol, UsuarioRol])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
