import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity()
export class ShippingCost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    provinceId: string;    // ID from GeoRef API (e.g., "06" for Buenos Aires)

    @Column()
    provinceName: string;  // Name from GeoRef API

    @Column({ type: 'real', default: 0 })
    cost: number;          // Shipping cost for this province

    @OneToMany(() => Shipment, (shipment) => shipment.shippingCost)
    shipments: Shipment[];
}
