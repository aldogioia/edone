import {SummaryToolDto} from './tool-dto';

export class ServiceDto {
  id: string;
  imgUrl: string;
  name: string;
  price: number;
  tools: SummaryToolDto[];

  constructor(
    id: string,
    imgUrl: string,
    name: string,
    price: number,
    tools: SummaryToolDto[]
  ) {
    this.id = id;
    this.imgUrl = imgUrl;
    this.name = name;
    this.price = price;
    this.tools = tools;
  }
}
