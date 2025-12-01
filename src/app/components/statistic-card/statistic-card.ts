import {Component, input} from '@angular/core';

@Component({
  selector: 'app-statistic-card',
  standalone: false,
  templateUrl: './statistic-card.html',
  styleUrl: './statistic-card.css',
})
export class StatisticCard {
  name = input.required<string>();
  value = input.required<string>();

}
