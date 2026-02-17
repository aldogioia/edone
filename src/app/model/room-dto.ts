import {SummaryServiceDto} from './summary/summary-service-dto';

export interface RoomDto {
  id: string;
  name: string;
  services: SummaryServiceDto[];
}
