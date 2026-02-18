import { Locality } from './localities.model';

export interface Shipment {
    idSh: number;
    dateSh: Date;
    status: 'Pending' | 'Sent' | 'Delivered';
    locality: Locality;
}
