import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'theme-mode';
  mode = signal<ThemeMode>('light');

  initTheme() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTheme = localStorage.getItem(this.storageKey) as ThemeMode | null;
    const preferredTheme =
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolvedTheme = savedTheme ?? preferredTheme;

    this.setTheme(resolvedTheme);
  }

  toggleTheme() {
    this.setTheme(this.mode() === 'light' ? 'dark' : 'light');
  }

  private setTheme(theme: ThemeMode) {
    this.mode.set(theme);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }
}
