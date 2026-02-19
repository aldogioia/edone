export class CustomerDto {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.surname = data.surname;
    this.phoneNumber = data.phoneNumber;
  }
}

export interface CreateCustomerWithoutPasswordDto {
  name: string;
  surname: string;
  phoneNumber: string;
  // Aggiungi altri campi se presenti nel DTO Java
}

export interface UpdateCustomerDto {
  id: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
}

// Interfaccia per la paginazione Spring Boot
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // numero pagina corrente
}
