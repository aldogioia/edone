import { Component } from '@angular/core';

@Component({
  selector: 'app-rooms-page',
  standalone: false,
  templateUrl: './rooms-page.html',
  styleUrls: [
    './rooms-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css'
  ],
})
export class RoomsPage {
  isFormOpen = false;

  services = [
    { id: 1, name: 'Service 1' },
    { id: 2, name: 'Service 2' },
    { id: 3, name: 'Service 3' },
    { id: 4, name: 'Service 4' },
    { id: 5, name: 'Service 5' },
    { id: 6, name: 'Service 6' },
    { id: 7, name: 'Service 7' },
    { id: 8, name: 'Service 8' },
  ]

  items = [
    { id: 1, name: 'Room 1', services: [{ id: 1, name: 'Service 1'}] },
    { id: 2, name: 'Room 2', services: [{ id: 1, name: 'Service 1'}] },
    { id: 3, name: 'Room 3', services: [{ id: 1, name: 'Service 1'}] },
  ]
}
