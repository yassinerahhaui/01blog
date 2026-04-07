import { Component, input } from '@angular/core';
import { Post } from '../../core/models/post';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-post-card',
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {

  post = input.required<Post>();

}
