import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Post } from '../../core/models/post';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';


@Component({
  selector: 'app-post-card',
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard implements OnInit {
  ngOnInit(): void {
    console.log(this.currentUser() , "*****************************************");

  }
  authService = inject(Auth);
  currentUser = signal(this.authService.currentUser());
  post = input.required<Post>();

}
