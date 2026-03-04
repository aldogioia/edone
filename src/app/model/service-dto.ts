import {SummaryToolDto} from './tool-dto';

export interface ServiceDto {
  id: string;
  imgUrl?: string;
  name: string;
  price: number;
  multiOperator: boolean;
  persistenceDuration: number;
  tools: SummaryToolDto[];
}

export interface CreateServiceDto {
  name: string;
  price: number;
  multiOperator: boolean;
  persistenceDuration: number;
  tools: string[];
}

export interface UpdateServiceDto {
  id: string;
  name: string;
  price: number;
  persistenceDuration: number;
  multiOperator: boolean;
  tools: string[];
}

export interface SummaryServiceDto {
  id: string;
  name: string;
}
