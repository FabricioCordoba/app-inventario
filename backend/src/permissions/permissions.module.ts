import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from './entities/permiso.entity';
import { RolPermiso } from './entities/rol-permiso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso, RolPermiso])],
  exports: [TypeOrmModule],
})
export class PermissionsModule {}
