import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-blocked',
  template: `
    <section class="blocked-shell">
      <article class="blocked-card">
        <div class="blocked-icon" aria-hidden="true">
          <i class="fa-solid fa-ban"></i>
        </div>

        <h1>Account Blocked</h1>
        <p>
          Your account has been blocked by the moderation team.
          You can sign in, but you cannot access data or perform actions while blocked.
        </p>

        <button type="button" class="btn btn-danger px-4 py-2 fw-semibold" (click)="logoutAndBackToLogin()">
          Back to Login
        </button>
      </article>
    </section>
  `,
  styles: `
    .blocked-shell {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 2rem 1rem;
      background: radial-gradient(circle at 20% 20%, rgba(255, 221, 225, 0.55), transparent 40%),
        radial-gradient(circle at 80% 0%, rgba(255, 183, 197, 0.35), transparent 45%),
        #f9fafb;
    }

    .blocked-card {
      width: min(560px, 100%);
      text-align: center;
      background: #ffffff;
      border: 1px solid #f3d5d9;
      border-radius: 1rem;
      padding: 2.25rem 1.5rem;
      box-shadow: 0 18px 45px rgba(17, 24, 39, 0.08);
    }

    .blocked-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      margin: 0 auto 1rem;
      display: grid;
      place-items: center;
      font-size: 1.8rem;
      color: #b42318;
      background: #fee4e2;
    }

    h1 {
      margin-bottom: 0.75rem;
      color: #111827;
    }

    p {
      margin: 0 auto 1.5rem;
      color: #4b5563;
      max-width: 44ch;
    }
  `,
})
export class Blocked {
  private authService = inject(Auth);
  private router = inject(Router);

  logoutAndBackToLogin() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
