import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsService } from './shipments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipment, STATUS } from './entities/shipment.entity';
import { Locality } from '../localities/entities/locality.entity';
import { Repository } from 'typeorm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

describe('ShipmentsService', () => {
    let service: ShipmentsService;
    let shipmentRepository: Repository<Shipment>;
    let localityRepository: Repository<Locality>;

    const mockLocality: Locality = {
        idLo: 1,
        nameLo: 'Test Locality',
        postalCode: 1234,
        cost: 100,
        user: [],
        shipment: [],
        isActive: true,
    };

    const mockShipment: Shipment = {
        idSh: 1,
        dateSh: new Date(),
        status: STATUS.PENDING,
        locality: mockLocality,
        purchases: [],
    };

    const mockShipmentRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockLocalityRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShipmentsService,
                {
                    provide: getRepositoryToken(Shipment),
                    useValue: mockShipmentRepository,
                },
                {
                    provide: getRepositoryToken(Locality),
                    useValue: mockLocalityRepository,
                },
            ],
        }).compile();

        service = module.get<ShipmentsService>(ShipmentsService);
        shipmentRepository = module.get<Repository<Shipment>>(getRepositoryToken(Shipment));
        localityRepository = module.get<Repository<Locality>>(getRepositoryToken(Locality));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create and save a shipment', async () => {
            const createDto: CreateShipmentDto = {
                dateSh: new Date(),
                idLocality: 1,
                status: STATUS.PENDING,
            };

            mockLocalityRepository.findOne.mockResolvedValue(mockLocality);
            mockShipmentRepository.create.mockReturnValue(mockShipment);
            mockShipmentRepository.save.mockResolvedValue(mockShipment);

            const result = await service.create(createDto);

            expect(result).toEqual(mockShipment);
            expect(mockLocalityRepository.findOne).toHaveBeenCalledWith({ where: { idLo: createDto.idLocality } });
            expect(mockShipmentRepository.create).toHaveBeenCalledWith({
                dateSh: createDto.dateSh,
                locality: mockLocality,
                status: createDto.status,
            });
            expect(mockShipmentRepository.save).toHaveBeenCalledWith(mockShipment);
        });

        it('should throw Error if locality not found', async () => {
            const createDto: CreateShipmentDto = {
                dateSh: new Date(),
                idLocality: 999,
                status: STATUS.PENDING,
            };

            mockLocalityRepository.findOne.mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow('Locality not found');
            expect(mockShipmentRepository.create).not.toHaveBeenCalled();
            expect(mockShipmentRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return an array of shipments', async () => {
            mockShipmentRepository.find.mockResolvedValue([mockShipment]);

            const result = await service.findAll();

            expect(result).toEqual([mockShipment]);
            expect(mockShipmentRepository.find).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a shipment by ID', async () => {
            const idSh = 1;
            mockShipmentRepository.findOne.mockResolvedValue(mockShipment);

            const result = await service.findOne(idSh);

            expect(result).toEqual(mockShipment);
            expect(mockShipmentRepository.findOne).toHaveBeenCalledWith({ where: { idSh } });
        });
    });

    describe('update', () => {
        it('should update and return the shipment', async () => {
            const idSh = 1;
            const updateDto: UpdateShipmentDto = { status: STATUS.DELIVERED };
            const updatedShipment = { ...mockShipment, ...updateDto };

            mockShipmentRepository.update.mockResolvedValue({ affected: 1 });
            mockShipmentRepository.findOne.mockResolvedValue(updatedShipment);

            const result = await service.update(idSh, updateDto);

            expect(result).toEqual(updatedShipment);
            expect(mockShipmentRepository.update).toHaveBeenCalledWith(idSh, updateDto);
        });
    });

    describe('remove', () => {
        it('should remove the shipment', async () => {
            const idSh = 1;
            mockShipmentRepository.delete.mockResolvedValue({ affected: 1 });

            await service.remove(idSh);

            expect(mockShipmentRepository.delete).toHaveBeenCalledWith(idSh);
        });
    });
});
