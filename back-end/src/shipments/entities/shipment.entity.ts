import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Purchase } from 'src/purchases/entities/purchase.entity';
import { ShippingCost } from 'src/shipping-costs/entities/shipping-cost.entity';

export enum STATUS {
  PENDING = 'Pending',
  SENT = 'Sent',
  DELIVERED = 'Delivered',
}

@Entity()
export class Shipment {

  @PrimaryGeneratedColumn('increment')
  idSh: number;

  @Column({ type: 'timestamp', name: 'dateShipmentOut' })
  dateSh: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: STATUS.PENDING,
  })
  status: STATUS;

  @ManyToOne(() => ShippingCost, { eager: true, nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'shippingCostId' })
  shippingCost: ShippingCost | null;

  @OneToMany(() => Purchase, (purchase) => purchase.shipment)
  purchases: Purchase[];
}
