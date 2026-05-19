import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Toast } from '../../core/services/toast/toast';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.scss',
})
export class ToastHost {
  toastService = inject(Toast);
}
