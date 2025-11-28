import {Component, input} from '@angular/core';

@Component({
  selector: 'app-service',
  standalone: false,
  templateUrl: './service.html',
  styleUrl: './service.css',
})
export class Service {
  name = input.required<string>();
  description = input.required<string>();
  price = input.required<string>();
  duration = input.required<string>();
  imgUrl = input.required<string>();
}
