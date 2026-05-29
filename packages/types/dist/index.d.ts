export type OrderStatus = 'planned' | 'scheduled' | 'in_progress' | 'completed';
export interface ProductionOrder {
    id: string;
    reference: string;
    product: string;
    quantity: number;
    startDate: string;
    endDate: string;
    status: OrderStatus;
    createdAt: string;
}
export interface CreateProductionOrderDto {
    reference: string;
    product: string;
    quantity: number;
    startDate: string;
    endDate: string;
    status?: OrderStatus;
}
export interface UpdateProductionOrderDto {
    reference?: string;
    product?: string;
    quantity?: number;
    startDate?: string;
    endDate?: string;
    status?: OrderStatus;
}
export interface RescheduleResult {
    rescheduled: number;
    orders: ProductionOrder[];
}
