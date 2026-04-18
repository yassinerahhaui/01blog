import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';

import { Popup } from '../../core/services/popup/popup';

@Component({
  selector: 'app-popup-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-host.html',
  styleUrl: './popup-host.scss',
})
export class PopupHost {
  popup = inject(Popup);

  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    const state = this.popup.state();
    if (!state) {
      return;
    }

    this.popup.onCancel();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.popup.onCancel();
    }
  }
}
