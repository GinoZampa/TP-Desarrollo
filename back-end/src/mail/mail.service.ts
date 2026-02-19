import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    dns.setDefaultResultOrder('ipv4first');
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      }
    });
  }

  async sendVerificationCode(email: string, code: string, name: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Slicer's Shop" <${this.configService.get<string>('MAIL_USER')}>`,
      to: email,
      subject: 'Verify your email - Slicer\'s Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; color: #fff; border-radius: 12px;">
          <h2 style="color: #e94560; margin-bottom: 8px;">Welcome, ${name}!</h2>
          <p style="color: #ccc; margin-bottom: 24px;">Use the following code to verify your email and complete your registration:</p>
          <div style="background: #16213e; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e94560;">${code}</span>
          </div>
          <p style="color: #999; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  }
}
