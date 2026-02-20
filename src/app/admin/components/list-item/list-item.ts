import {Component, input} from '@angular/core';
import {IconSvgObject} from '@hugeicons/angular';

@Component({
  selector: 'app-list-item',
  standalone: false,
  templateUrl: './list-item.html',
  styleUrls: [
    './list-item.css',
    '../../../../../public/css/typography.css'
  ],
})
export class ListItem {
  title = input.required<string>();
  icon = input<IconSvgObject>();
  imageUrl = input<string>();
}
