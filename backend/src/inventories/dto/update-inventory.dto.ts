import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EstadoInventario } from '../../common/enums';

export class UpdateInventoryDto {
  @IsOptional()
  @IsInt()
  unidadId?: number;

  @IsOptional()
  @IsInt()
  responsableId?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaCierre?: string;

  @IsOptional()
  @IsEnum(EstadoInventario)
  estado?: EstadoInventario;

  @IsOptional()
  @IsString()
  observacionesGenerales?: string;
}
