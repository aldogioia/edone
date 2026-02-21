import {SummaryToolDto} from './tool-dto';

export interface ServiceDto {
  id: string;
  imgUrl?: string;
  name: string;
  price: number;
  tools: SummaryToolDto[];
}

export interface CreateServiceDto {
  name: string;
  price: number;
  tools: string[];
}

export interface UpdateServiceDto {
  id: string;
  name: string;
  price: number;
  tools: string[];
}
