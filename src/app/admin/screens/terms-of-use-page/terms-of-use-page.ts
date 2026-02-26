import { Component } from '@angular/core';
import {Environment} from '../../../utils/environment';

@Component({
  selector: 'app-terms-of-use-page',
  standalone: false,
  templateUrl: './terms-of-use-page.html',
  styleUrls: [
    './terms-of-use-page.css',
    '../../../../../public/css/terms&policy.css',
    '../../../../../public/css/typography.css',
    '../../../../../public/css/form.css'
  ],
})
export class TermsOfUsePage {

  protected readonly Environment = Environment;

  scrollToTop(): void {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    });
  }
}
