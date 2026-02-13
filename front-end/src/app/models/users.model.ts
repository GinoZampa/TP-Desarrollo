import { Locality } from "./localities.model";

export interface User {
    idUs: number;
    nameUs: string;
    lastNameUs: string;
    emailUs: string;
    dni: string;
    phoneUs: string;
    addressUs: string;
    locality: Locality;
    role: string;
}