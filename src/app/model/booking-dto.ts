import { ServiceDto } from './service-dto';
import { SummaryOperatorDto } from './operator-dto';
import { SummaryCustomerDto } from './customer-dto';

export class BookingDto {
  id: string;
  date: string;
  time: string;
  end: string;
  service: ServiceDto;
  operators: SummaryOperatorDto[];
  room: string;
  customer: SummaryCustomerDto;

  constructor(data: any) {
    this.id = data.id;
    this.date = data.date;
    this.time = data.time;
    this.end = data.end;
    this.service = data.service;
    this.operators = data.operators;
    this.room = data.room;
    this.customer = data.customer;
  }
}

export interface CreateBookingDto {
  date: string;
  time: string;
  duration: number;
  service: string;
  operators: string[];
  customer: string;
}

export interface UpdateBookingDto {
  id: string;
  duration: number;
}
