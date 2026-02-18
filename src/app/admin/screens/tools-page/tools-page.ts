import { Component } from '@angular/core';

@Component({
  selector: 'app-tools-page',
  standalone: false,
  templateUrl: './tools-page.html',
  styleUrls: [
    './tools-page.css',
    '../../../../../public/css/form.css',
    '../../../../../public/css/layout.css',
    '../../../../../public/css/typography.css'
  ],
})
export class ToolsPage {
  isFormOpen = false;

  items = [
    {id: '1', name: 'Hammer', availability: 10},
    {id: '2', name: 'Screwdriver', availability: 10},
    {id: '3', name: 'Screwdriver', availability: 10},
    {id: '4', name: 'Screwdriver', availability: 10},
    {id: '5', name: 'Screwdriver', availability: 10},
    {id: '6', name: 'Screwdriver', availability: 10},
    {id: '7', name: 'Screwdriver', availability: 10},
    {id: '8', name: 'Screwdriver', availability: 10},
    {id: '9', name: 'Screwdriver', availability: 10}
  ]
}
