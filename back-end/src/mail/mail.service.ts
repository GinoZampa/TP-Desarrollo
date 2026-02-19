import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private apiKey: string;
  private senderEmail: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.senderEmail = this.configService.get<string>('MAIL_USER');
  }

  async sendVerificationCode(email: string, code: string, name: string): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        sender: { name: "Slicer's Shop", email: this.senderEmail },
        to: [{ email, name }],
        subject: "Verify your email - Slicer's Shop",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; color: #fff; border-radius: 12px;">
            <h2 style="color: #e94560; margin-bottom: 8px;">Welcome, ${name}!</h2>
            <p style="color: #ccc; margin-bottom: 24px;">Use the following code to verify your email and complete your registration:</p>
            <div style="background: #16213e; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e94560;">${code}</span>
            </div>
            <p style="color: #999; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }
  }
}
