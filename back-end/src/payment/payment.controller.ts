import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { User } from 'src/users/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { Rol } from 'src/common/enums/rol.enum';
import { PaymentItemDto } from './dto/payment-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {

    constructor(private readonly paymentService: PaymentService) { }

    @Auth(Rol.USER)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: 'Create MercadoPago payment preference' })
    @ApiResponse({ status: 201, description: 'Payment preference created, returns init_point' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    async createPayment(@Body() data: { items: PaymentItemDto[], user: User }) {
        return this.paymentService.createPayment(data.items, data.user);
    }
}
