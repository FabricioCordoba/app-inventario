import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Novedad } from './entities/novedad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad])],
  exports: [TypeOrmModule],
})
export class NoveltiesModule {}
