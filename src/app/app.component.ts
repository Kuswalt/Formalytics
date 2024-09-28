import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'formalytics';
  hideHeader: boolean = false;
  hideFooter: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.hideHeader = this.shouldHideHeader(event.urlAfterRedirects);
        this.hideFooter = this.shouldHideFooter(event.urlAfterRedirects);
      }
    });
  }

  shouldHideHeader(url: string): boolean {
    const hideHeaderRoutes = ['/login', '/register', '/thank-you', '/responsesurvey', '/responsesurvey'];
    return hideHeaderRoutes.some(route => url.startsWith(route));
  }

  shouldHideFooter(url: string): boolean {
    const hideFooterRoutes = ['/login', '/register', '/thank-you'];
    return hideFooterRoutes.some(route => url.startsWith(route));
  }
}
