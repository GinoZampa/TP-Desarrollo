import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShippingCostsService } from './shipping-costs.service';
import { CreateShippingCostDto } from './dto/create-shipping-cost.dto';
import { UpdateShippingCostDto } from './dto/update-shipping-cost.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Shipping Costs')
@Controller('shipping-costs')
export class ShippingCostsController {
    constructor(private readonly shippingCostsService: ShippingCostsService) { }

    @Post()
    create(@Body() createDto: CreateShippingCostDto) {
        return this.shippingCostsService.create(createDto);
    }

    @Get()
    findAll() {
        return this.shippingCostsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.shippingCostsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateShippingCostDto) {
        return this.shippingCostsService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.shippingCostsService.remove(+id);
    }
}
