export interface Clothe {
    idCl: number;
    nameCl: string;
    description: string;
    size: string;
    typeCl: string;
    stock: number;
    price: number;
    image: string;
    isActive: boolean;
}

// Item en el carrito = Clothe + cantidad seleccionada
export interface Clothes extends Clothe {
    quantity: number;
}
