import { Component, signal } from '@angular/core';
import {SparklesFreeIcons} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('website');
  protected readonly SparklesFreeIcons = SparklesFreeIcons;
}
