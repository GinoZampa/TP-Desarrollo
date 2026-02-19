import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { Logindto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt/dist';
import { MailService } from '../mail/mail.service';

interface PendingRegistration {
  dto: RegisterDto;
  code: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  private pendingRegistrations = new Map<string, PendingRegistration>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.findOneByEmail(registerDto.emailUs);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    // Hash password before storing
    const hashedPassword = await bcryptjs.hash(registerDto.passwordUs, 10);
    registerDto.passwordUs = hashedPassword;

    // Generate verification code
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store pending registration in memory
    this.pendingRegistrations.set(registerDto.emailUs, {
      dto: registerDto,
      code,
      expiresAt,
    });

    // Send verification email
    await this.mailService.sendVerificationCode(
      registerDto.emailUs,
      code,
      registerDto.nameUs,
    );

    return { emailUs: registerDto.emailUs, message: 'Verification code sent' };
  }

  async verifyEmail(emailUs: string, code: string) {
    const pending = this.pendingRegistrations.get(emailUs);

    if (!pending) {
      throw new BadRequestException('No pending registration for this email');
    }

    if (new Date() > pending.expiresAt) {
      this.pendingRegistrations.delete(emailUs);
      throw new BadRequestException('Verification code expired');
    }

    if (pending.code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Code is correct — create user in DB
    await this.usersService.create(pending.dto);
    this.pendingRegistrations.delete(emailUs);

    return { message: 'Email verified successfully' };
  }

  async resendCode(emailUs: string) {
    const pending = this.pendingRegistrations.get(emailUs);

    if (!pending) {
      throw new BadRequestException('No pending registration for this email');
    }

    // Generate new code
    const code = this.generateCode();
    pending.code = code;
    pending.expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.mailService.sendVerificationCode(
      emailUs,
      code,
      pending.dto.nameUs,
    );

    return { message: 'Verification code resent' };
  }

  async login({ emailUs, passwordUs }: Logindto) {
    const user = await this.usersService.findOneByEmail(emailUs);
    if (!user) {
      throw new UnauthorizedException('Email incorrecto');
    }

    const isPasswordValid = await bcryptjs.compare(passwordUs, user.passwordUs);
    if (!isPasswordValid) {
      console.log('Contraseña incorrecta');
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = { user: user };
    const token = this.jwtService.sign(payload);

    return { token, emailUs };
  }

  async profile({ emailUs, rol }: { emailUs: string; rol: string[] }) {
    return await this.usersService.findOneByEmail(emailUs);
  }
}
