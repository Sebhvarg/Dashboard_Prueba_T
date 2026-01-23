import { Client } from "./client.model";

export type StateOrder = 'Pending' | 'Approved' | 'Rejected';

export interface Order {
    id?: number;
    clientId: number;
    client?: Client;
    orderDate?: string;
    totalAmount: number;
    status: StateOrder;
    description: string;
    cantidad: number;
}
