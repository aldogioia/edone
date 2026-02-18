import { Component } from '@angular/core';

@Component({
  selector: 'app-customers-page',
  standalone: false,
  templateUrl: './customers-page.html',
  styleUrls: [
    './customers-page.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/typography.css'
  ],
})
export class CustomersPage {
  isFormOpen = false;

  items = [
    {id: '1', name: 'John', surname: 'Doe', phoneNumber: '123456789'},
    {id: '2', name: 'Jane', surname: 'Smith', phoneNumber: '987654321'},
  ]
}
