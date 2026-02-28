import {Component, input} from '@angular/core';

@Component({
  selector: 'app-service',
  standalone: false,
  templateUrl: './service.html',
  styleUrls:[
    './service.css',
    '../../../../../public/css/typography-landing.css'
  ],
})
export class Service {
  name = input.required<string>();
  price = input.required<string>();
  duration = input.required<string>();
  imgUrl = input.required<string>();
}
