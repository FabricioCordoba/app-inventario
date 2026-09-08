import { IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSectorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Min(0)
  @Max(999)
  orden?: number;

  @IsNotEmpty()
  unidadId: number;
}
