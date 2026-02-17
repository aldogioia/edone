import { Component } from '@angular/core';

@Component({
  selector: 'app-customers-page',
  standalone: false,
  templateUrl: './customers-page.html',
  styleUrls: [
    './customers-page.css',
    '../../../../../public/css/list.css'
  ],
})
export class CustomersPage {
  items = [
    {id: '1', name: 'John', surname: 'Doe', phoneNumber: '123456789'},
    {id: '2', name: 'Jane', surname: 'Smith', phoneNumber: '987654321'},
  ]
}
