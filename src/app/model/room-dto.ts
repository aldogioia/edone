import {SummaryServiceDto} from './summary/summary-service-dto';

export interface RoomDto {
  id: string;
  name: string;
  services: SummaryServiceDto[];
}

export interface CreateRoomDto {
  name: string;
  services: string[];
}

export interface UpdateRoomDto {
  id: string;
  name: string;
  services: string[];
}
