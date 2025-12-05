import {Component, input} from '@angular/core';

@Component({
  selector: 'app-rating',
  standalone: false,
  templateUrl: './rating.html',
  styleUrls: ['./rating.css'],
})
export class Rating {
  rating = input.required<number>();
  text = input.required<string>();
  name = input.required<string>();

  get stars() {
    return Array.from({ length: this.rating() });
    // todo gestire le mezze stelle
  }
}
