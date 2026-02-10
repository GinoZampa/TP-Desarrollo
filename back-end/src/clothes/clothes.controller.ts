import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { CreateClotheDto } from './dto/create-clothe.dto';
import { UpdateClotheDto } from './dto/update-clothe.dto';
import { Clothe } from './entities/clothe.entity';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { Rol } from 'src/common/enums/rol.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('Clothes')
@Controller('clothes')
export class ClothesController {
  constructor(private readonly clothesService: ClothesService) { }

  @Auth(Rol.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create new clothing item' })
  @ApiResponse({ status: 201, description: 'Clothing item created successfully' })
  create(@Body() createClotheDto: CreateClotheDto): Promise<Clothe> {
    return this.clothesService.create(createClotheDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clothing items' })
  @ApiResponse({ status: 200, description: 'List of clothing items' })
  findAll(): Promise<Clothe[]> {
    return this.clothesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search clothing items by name' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchProducts(@Query('q') query: string) {
    return this.clothesService.searchByName(query);
  }

  @Get(':idCl')
  @ApiOperation({ summary: 'Get clothing item by ID' })
  @ApiParam({ name: 'idCl', description: 'Clothing item ID' })
  @ApiResponse({ status: 200, description: 'Clothing item found' })
  @ApiResponse({ status: 404, description: 'Clothing item not found' })
  findOne(@Param('idCl') idCl: number): Promise<Clothe> {
    return this.clothesService.findOne(idCl);
  }

  @Get('type/:typeCl')
  @ApiOperation({ summary: 'Get clothing items by category' })
  @ApiParam({ name: 'typeCl', description: 'Clothing category' })
  @ApiResponse({ status: 200, description: 'Clothing items from category' })
  findByCategory(@Param('typeCl') category: string): Promise<Clothe[]> {
    return this.clothesService.findByCategory(category);
  }

  @Auth(Rol.ADMIN)
  @ApiBearerAuth()
  @Patch(':idCl')
  @ApiOperation({ summary: 'Update clothing item' })
  @ApiParam({ name: 'idCl', description: 'Clothing item ID' })
  @ApiResponse({ status: 200, description: 'Clothing item updated' })
  update(
    @Param('idCl') idCl: number,
    @Body() updateClotheDto: UpdateClotheDto,
  ): Promise<Clothe> {
    return this.clothesService.update(+idCl, updateClotheDto);
  }

  @Auth(Rol.ADMIN)
  @ApiBearerAuth()
  @Put(':idCl/new-price')
  @ApiOperation({ summary: 'Update clothing item price' })
  @ApiParam({ name: 'idCl', description: 'Clothing item ID' })
  @ApiResponse({ status: 200, description: 'Price updated' })
  async updateProductPrice(@Param('idCl') id: number, @Body('price') price: number) {
    return await this.clothesService.updateProductPrice(id, price);
  }

  @Auth(Rol.ADMIN)
  @ApiBearerAuth()
  @Put(':idCl/add-stock')
  @ApiOperation({ summary: 'Update clothing item stock' })
  @ApiParam({ name: 'idCl', description: 'Clothing item ID' })
  @ApiResponse({ status: 200, description: 'Stock updated' })
  async updateProductStock(@Param('idCl') id: number, @Body('stock') stock: number) {
    return await this.clothesService.updateProductStock(id, stock);
  }

  @Auth(Rol.ADMIN)
  @ApiBearerAuth()
  @Patch(':idCl/deactivate')
  @ApiOperation({ summary: 'Deactivate clothing item' })
  @ApiParam({ name: 'idCl', description: 'Clothing item ID' })
  @ApiResponse({ status: 200, description: 'Clothing item deactivated' })
  async deactivateProduct(@Param('idCl') idCl: number) {
    return await this.clothesService.deactivateProduct(idCl);
  }

}
