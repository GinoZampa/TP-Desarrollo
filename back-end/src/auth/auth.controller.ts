import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Logindto } from './dto/login.dto';
import { VerifyEmailDto, ResendCodeDto } from './dto/verify-email.dto';
import { AuthGuard } from './guard/auth.guard';
import { Request } from 'express';
import { Roles } from './decorators/roles.decorators';
import { RolesGuard } from './guard/roles.guard';
import { Rol } from '../common/enums/rol.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: {
    emailUs: string;
    rol: string[];
    idUs: number;
  };
}
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register new user (sends verification code)' })
  @ApiResponse({ status: 201, description: 'Verification code sent to email' })
  @ApiResponse({ status: 400, description: 'Invalid data or user exists' })
  @UsePipes(new ValidationPipe({ transform: true }))
  register(
    @Body()
    registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with code to complete registration' })
  @ApiResponse({ status: 201, description: 'Email verified, account created' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @UsePipes(new ValidationPipe({ transform: true }))
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.emailUs, verifyEmailDto.code);
  }

  @Post('resend-code')
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiResponse({ status: 201, description: 'Code resent' })
  @ApiResponse({ status: 400, description: 'No pending registration' })
  @UsePipes(new ValidationPipe({ transform: true }))
  resendCode(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.resendCode(resendCodeDto.emailUs);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body()
    loginDto: Logindto,
  ) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Roles(Rol.ADMIN, Rol.USER)
  @UseGuards(AuthGuard, RolesGuard)
  profile(@ActiveUser() user: UserActiveInterface) {
    return this.authService.profile(user);
  }
}
