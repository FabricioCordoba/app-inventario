import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from '../../common/entities/timestamp.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('jerarquias')
export class Jerarquia extends TimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'smallint', unsigned: true, unique: true })
  nivel: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => Usuario, (usuario) => usuario.jerarquia)
  usuarios: Usuario[];
}
