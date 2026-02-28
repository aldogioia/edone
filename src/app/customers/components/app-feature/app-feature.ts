import {Component, Input} from '@angular/core';
import {IconSvgObject} from '@hugeicons/angular';

@Component({
  selector: 'app-app-feature',
  standalone: false,
  templateUrl: './app-feature.html',
  styleUrls:[
    './app-feature.css',
    '../../../../../public/css/typography-landing.css'
  ],
})
export class AppFeature {
  @Input({required:true}) icon!: IconSvgObject
  @Input({required:true}) title!: string;
  @Input({required:true}) description!: string;
}
