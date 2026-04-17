import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PostCard } from './post-card';
import { Auth } from '../../core/services/auth/auth';
import { Posts } from '../../core/services/posts/posts';

describe('PostCard', () => {
  let component: PostCard;
  let fixture: ComponentFixture<PostCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCard],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: { currentUser: () => null },
        },
        {
          provide: Posts,
          useValue: {
            getPostComments: () => of({ data: [], status: 'success', errors: null }),
            addComment: () => of({ data: {}, status: 'success', errors: null }),
            toggleLike: () => of({ data: {}, status: 'success', errors: null }),
            reportPost: () => of({ data: {}, status: 'success', errors: null }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('post', {
      id: '1',
      title: 'Test Post',
      content: 'Body',
      mediaUrl: '',
      mediaType: 'EMPTY',
      userId: '2',
      commentsCount: 0,
      likesCount: 0,
      isLikedByMe: false,
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
