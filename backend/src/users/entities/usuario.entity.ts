import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { Jerarquia } from '../../hierarchies/entities/jerarquia.entity';
import { UsuarioRol } from '../../roles/entities/usuario-rol.entity';
import { Inventario } from '../../inventories/entities/inventario.entity';
import { InventarioParticipante } from '../../inventory-participants/entities/inventario-participante.entity';
import { Novedad } from '../../novelties/entities/novedad.entity';
import { Auditoria } from '../../audit/entities/auditoria.entity';

@Entity('usuarios')
export class Usuario extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ name: 'jerarquia_id', type: 'bigint', unsigned: true })
  jerarquiaId: number;

  @ManyToOne(() => Jerarquia, (jerarquia) => jerarquia.usuarios, {
    nullable: false,
  })
  @JoinColumn({ name: 'jerarquia_id' })
  jerarquia: Jerarquia;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({
    name: 'ultimo_acceso',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  ultimoAcceso: Date | null;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles: UsuarioRol[];

  @OneToMany(() => Inventario, (inventario) => inventario.responsable)
  inventariosResponsable: Inventario[];

  @OneToMany(
    () => InventarioParticipante,
    (participante) => participante.usuario,
  )
  participacionesInventario: InventarioParticipante[];

  @OneToMany(() => Novedad, (novedad) => novedad.registradoPor)
  novedadesRegistradas: Novedad[];

  @OneToMany(() => Novedad, (novedad) => novedad.resueltoPor)
  novedadesResueltas: Novedad[];

  @OneToMany(() => Auditoria, (auditoria) => auditoria.usuario)
  auditorias: Auditoria[];
}
