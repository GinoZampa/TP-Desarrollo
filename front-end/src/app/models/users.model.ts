import { Locality } from "./localities.model";
import { Purchase } from "./purchases.model";

export interface User {
  idUs: number;
  nameUs: string;
  lastNameUs: string;
  emailUs: string;
  phoneUs: string;
  addressUs: string;
  rol: 'admin' | 'user';
  locality: Locality;
  isActive: boolean;
  passwordUs?: string;
  purchases?: Purchase[];
}

export interface UserWithStats extends User {
  purchaseCount: number;
  lastPurchaseDate: string | null;
  pendingShipments: number;
}