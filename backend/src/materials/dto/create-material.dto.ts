import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoControl, UnidadMedida } from '../../common/enums';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsEnum(TipoControl)
  tipoControl: TipoControl;

  @IsEnum(UnidadMedida)
  unidadMedida: UnidadMedida;

  @IsOptional()
  requiereInstancias?: boolean;
}
