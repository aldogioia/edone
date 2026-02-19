import {CreateOperatorServiceDto, OperatorServiceDto, UpdateOperatorServiceDto} from './operator-service-dto';

export interface OperatorDto {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;
  imgUrl?: string;
  operatorServices?: OperatorServiceDto[];
}

export interface SummaryOperatorDto {
  id: string;
  name: string;
  surname: string;
  imgUrl?: string;
}

export interface CreateOperatorDto {
  name: string;
  surname: string;
  phoneNumber: string;
  operatorServices?: CreateOperatorServiceDto[];
}

export interface UpdateOperatorDto {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;
  operatorServices?: UpdateOperatorServiceDto[];
}
