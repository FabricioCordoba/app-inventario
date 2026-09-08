import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { EstadoUnidad } from '../../common/enums';

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  numero?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

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

  @IsOptional()
  @IsEnum(EstadoUnidad)
  estado?: EstadoUnidad;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  activo?: boolean;
}
