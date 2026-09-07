import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jerarquia } from './entities/jerarquia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Jerarquia])],
  exports: [TypeOrmModule],
})
export class HierarchiesModule {}
