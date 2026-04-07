import { Component, inject, OnInit, signal } from '@angular/core';
import { Slider } from '../../components/slider/slider';
import { UserCard } from '../../components/user-card/user-card';
import { Posts } from '../../core/services/posts/posts';
import { Post } from '../../core/models/post';
import { PostCard } from '../../components/post-card/post-card';

@Component({
  selector: 'app-home',
  imports: [Slider,UserCard, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  private postService = inject(Posts);
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.postService.getAll().subscribe({
      next: (response)=> {
        if (response.status == "success") {
          this.posts.set(response.data);
          console.log(this.posts());

        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      }
    })
  }
}
