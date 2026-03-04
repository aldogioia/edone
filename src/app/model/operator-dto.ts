import {CreateOperatorServiceDto, OperatorServiceDto, UpdateOperatorServiceDto} from './operator-service-dto';

export interface OperatorDto {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;
  imgUrl?: string;
  bookingColor: string;
  operatorServices?: OperatorServiceDto[];
}

export interface SummaryOperatorDto {
  id: string;
  name: string;
  surname: string;
  bookingColor: string;
  imgUrl?: string;
}

export interface CreateOperatorDto {
  name: string;
  surname: string;
  phoneNumber: string;
  bookingColor: string;
  operatorServices?: CreateOperatorServiceDto[];
}

export interface UpdateOperatorDto {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;
  bookingColor: string;
  operatorServices?: UpdateOperatorServiceDto[];
}
