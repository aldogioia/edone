export class CustomerDto {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;
  birthDate: Date;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.surname = data.surname;
    this.phoneNumber = data.phoneNumber;
    this.birthDate = data.birthDate
  }
}

export interface CreateCustomerWithoutPasswordDto {
  name: string;
  surname: string;
  phoneNumber: string;
  birthDate: Date;
}

export interface UpdateCustomerDto {
  id: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  birthDate?: Date;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface SummaryCustomerDto {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;
}
