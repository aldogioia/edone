export class ToolDto {
  id: string;
  name: string;
  availability: number;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.availability = data.availability;
  }
}

export interface CreateToolDto {
  name: string;
  availability: number;
}

export interface UpdateToolDto {
  id: string;
  name: string;
  availability: number;
}

export interface SummaryToolDto {
  id: string;
  name: string;
}
