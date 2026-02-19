export interface OperatorServiceDto {
  id: string;
  operatorId: string;
  serviceId: string;
  duration: number;
}

export interface CreateOperatorServiceDto {
  serviceId: string;
  duration: number;
}

export interface UpdateOperatorServiceDto {
  operatorId: string;
  serviceId: string;
  duration: number;
}
