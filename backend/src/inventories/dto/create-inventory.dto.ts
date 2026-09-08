import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoInventario } from '../../common/enums';

export class CreateInventoryDto {
  @IsInt()
  @IsNotEmpty()
  unidadId: number;

  @IsInt()
  @IsNotEmpty()
  responsableId: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsEnum(EstadoInventario)
  estado?: EstadoInventario;

  @IsOptional()
  @IsString()
  observacionesGenerales?: string;
}
