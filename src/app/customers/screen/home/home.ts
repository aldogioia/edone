import {Component} from '@angular/core';
import {
  Appointment02Icon, GiftIcon,
  HoldPhoneIcon,
  NotificationBubbleIcon,
  SparklesFreeIcons,
  ZapIcon
} from '@hugeicons/core-free-icons';
import {IconSvgObject} from '@hugeicons/angular';

class Feature {
  icon: IconSvgObject
  title: string
  description: string

  constructor(icon: IconSvgObject, title: string, description: string) {
    this.icon = icon;
    this.title = title;
    this.description = description;
  }
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly SparklesFreeIcons = SparklesFreeIcons;
  protected readonly HoldPhoneIcon = HoldPhoneIcon;

  features: Feature[] = [
    new Feature(Appointment02Icon, "Prenotazioni Istantanee", "Gestisci i tuoi appuntamenti 24/7 con pochi tap"),
    new Feature(NotificationBubbleIcon, "Notifiche Smart", "Promemoria personalizzati e aggiornamenti in tempo reale"),
    new Feature(ZapIcon, "Fast Track", "Accesso prioritario ai nuovi trattamenti"),
    new Feature(GiftIcon, "Offerte VIP", "Promozioni esclusive riservate agli utenti dell'app"),
  ];
}
