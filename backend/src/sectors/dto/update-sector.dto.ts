import { IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateSectorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Min(0)
  @Max(999)
  orden?: number;

  @IsOptional()
  activo?: boolean;
}
