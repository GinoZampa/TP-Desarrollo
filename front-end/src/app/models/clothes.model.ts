import { Purchase } from "./purchases.model";
import { User } from "./users.model";

export interface Cloth {
    idCl: number;
    nameCl: string;
    description: string;
    size: string;
    typeCl: string;
    stock: number;
    price: number;
    image: string;
    purchase: Purchase;
    user: User;
}

export interface Clothes {
    idCl: number;
    nameCl: string;
    description: string;
    size: string;
    typeCl: string;
    stock: number;
    price: number;
    image: string;
    quantity: number;
}


