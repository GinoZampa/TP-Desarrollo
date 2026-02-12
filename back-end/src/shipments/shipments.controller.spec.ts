import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Shipment, STATUS } from './entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

describe('ShipmentsController', () => {
    let controller: ShipmentsController;
    let service: ShipmentsService;

    const mockShipment: Shipment = {
        idSh: 1,
        dateSh: new Date(),
        status: STATUS.PENDING,
        locality: { idLo: 1 } as any,
        purchases: []
    };

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShipmentsController],
            providers: [
                {
                    provide: ShipmentsService,
                    useValue: mockService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ShipmentsController>(ShipmentsController);
        service = module.get<ShipmentsService>(ShipmentsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const createDto: CreateShipmentDto = {
                dateSh: new Date(),
                idLocality: 1,
                status: STATUS.PENDING,
            };
            mockService.create.mockResolvedValue(mockShipment);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockShipment);
            expect(mockService.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            mockService.findAll.mockResolvedValue([mockShipment]);

            const result = await controller.findAll();

            expect(result).toEqual([mockShipment]);
            expect(mockService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should call service.findOne with parsed ID', async () => {
            const idSh = 1;
            mockService.findOne.mockResolvedValue(mockShipment);

            const result = await controller.findOne(idSh);

            expect(result).toEqual(mockShipment);
            expect(mockService.findOne).toHaveBeenCalledWith(idSh);
        });
    });

    describe('update', () => {
        it('should call service.update with parsed ID', async () => {
            const idSh = 1;
            const updateDto: UpdateShipmentDto = { status: STATUS.DELIVERED };
            mockService.update.mockResolvedValue({ ...mockShipment, ...updateDto });

            const result = await controller.update(idSh, updateDto);

            expect(result).toEqual({ ...mockShipment, ...updateDto });
            expect(mockService.update).toHaveBeenCalledWith(idSh, updateDto);
        });
    });

    describe('remove', () => {
        it('should call service.remove with parsed ID', async () => {
            const idSh = 1;
            mockService.remove.mockResolvedValue(undefined);

            await controller.remove(idSh);

            expect(mockService.remove).toHaveBeenCalledWith(idSh);
        });
    });
});
