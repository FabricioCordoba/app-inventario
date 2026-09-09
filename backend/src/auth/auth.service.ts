import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Usuario } from '../users/entities/usuario.entity';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PasswordMailerService } from './password-mailer.service';
import { AuthUser, LoginResponse } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly passwordMailerService: PasswordMailerService,
  ) {}

  private mapAuthUser(user: Usuario): AuthUser {
    const roles = Array.from(
      new Set(
        (user.usuarioRoles ?? [])
          .map((usuarioRol) => usuarioRol.rol?.codigo)
          .filter((codigo): codigo is string => Boolean(codigo)),
      ),
    );

    const permisos = Array.from(
      new Set(
        (user.usuarioRoles ?? [])
          .flatMap((usuarioRol) => usuarioRol.rol?.rolPermisos ?? [])
          .map((rolPermiso) => rolPermiso.permiso?.codigo)
          .filter((codigo): codigo is string => Boolean(codigo)),
      ),
    );

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      jerarquia: {
        id: user.jerarquia.id,
        nombre: user.jerarquia.nombre,
        nivel: user.jerarquia.nivel,
      },
      roles,
      permisos,
    };
  }

  async validateActiveUser(id: number): Promise<AuthUser | null> {
    const user = await this.usersService.findByIdForAuth(id);
    if (!user) {
      return null;
    }

    return this.mapAuthUser(user);
  }

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return;
    }

    await this.passwordResetTokenRepository.update(
      { usuarioId: user.id, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.passwordResetTokenRepository.save(
      this.passwordResetTokenRepository.create({
        usuarioId: user.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    );

    await this.passwordMailerService.sendResetLink(user.email, token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!resetToken) {
      throw new BadRequestException('El enlace de recuperación no es válido o expiró');
    }

    await this.usersService.updatePassword(resetToken.usuarioId, dto.password);
    resetToken.usedAt = new Date();
    await this.passwordResetTokenRepository.save(resetToken);
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const authUser = this.mapAuthUser(user);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      type: 'access',
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
      },
      {
        expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d') as any,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: authUser,
    };
  }
}
