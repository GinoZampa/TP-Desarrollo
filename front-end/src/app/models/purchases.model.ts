import { User } from "./users.model";

export interface Purchase {
    idPur: number;
    date: Date;
    user: User;
}