import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { EstadoUnidad } from '../../common/enums';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  numero: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @Min(1900)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsString()
  dominio?: string;

  @IsEnum(EstadoUnidad)
  estado: EstadoUnidad;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
