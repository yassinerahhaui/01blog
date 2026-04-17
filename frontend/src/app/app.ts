import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Theme } from './core/services/theme/theme';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private themeService = inject(Theme);

  username = signal('Admin');
  showNavbar = signal(true);

  constructor(private router: Router) {
    this.themeService.initTheme();

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const currentUrl = e.urlAfterRedirects;
        const isAuthPage = currentUrl.includes('/login') || currentUrl.includes('/register');
        this.showNavbar.set(!isAuthPage);
      }
    })
  }
}
