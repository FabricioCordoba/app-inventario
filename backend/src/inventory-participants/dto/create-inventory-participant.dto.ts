import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInventoryParticipantDto {
    @IsInt()
    @IsNotEmpty()
    inventarioId: number;

    @IsInt()
    @IsNotEmpty()
    usuarioId: number;

    @IsOptional()
    @IsBoolean()
    esResponsable?: boolean;
}
