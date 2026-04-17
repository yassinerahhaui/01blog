import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { UserInfoCard } from './user-info-card';
import { Auth } from '../../core/services/auth/auth';
import { Profile } from '../../core/services/profile/profile';

describe('UserInfoCard', () => {
  let component: UserInfoCard;
  let fixture: ComponentFixture<UserInfoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfoCard],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: { currentUser: () => null },
        },
        {
          provide: Profile,
          useValue: {
            getUserInfo: () =>
              of({
                data: {
                  id: '1',
                  fullName: 'Test User',
                  username: 'tester',
                  email: 'tester@example.com',
                  avatarUrl: null,
                  role: 'USER',
                  access: 'ENABLED',
                  followersCount: 0,
                  followingCount: 0,
                  isFollowedByMe: false,
                },
                status: 'success',
                errors: null,
              }),
            toggleFollow: () => of({ data: true, status: 'success', errors: null }),
            getFollowers: () => of({ data: [], status: 'success', errors: null }),
            getFollowing: () => of({ data: [], status: 'success', errors: null }),
            reportUser: () => of({ data: {}, status: 'success', errors: null }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserInfoCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('userId', '1');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
