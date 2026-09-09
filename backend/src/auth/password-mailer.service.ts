import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PasswordMailerService {
  private readonly logger = new Logger(PasswordMailerService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendResetLink(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl') ?? 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
    const host = this.configService.get<string>('mail.host');

    if (!host) {
      this.logger.warn(`MAIL_HOST no configurado. Enlace local de recuperación: ${resetUrl}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: this.configService.get<number>('mail.port') ?? 587,
      secure: this.configService.get<boolean>('mail.secure') ?? false,
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.password'),
      },
    });

    await transporter.sendMail({
      from: this.configService.get<string>('mail.from') ?? this.configService.get<string>('mail.user'),
      to: email,
      subject: 'Recuperación de contraseña - BV Barker Inventarios',
      text: `Solicitaste restablecer tu contraseña. Utiliza este enlace antes de que expire: ${resetUrl}`,
      html: `<p>Solicitaste restablecer tu contraseña.</p><p><a href="${resetUrl}">Restablecer contraseña</a></p><p>El enlace expira en 30 minutos y solo puede utilizarse una vez.</p>`,
    });
  }
}
