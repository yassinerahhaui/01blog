import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { Admin } from '../../core/services/admin/admin';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: Admin,
          useValue: {
            getUsers: () => of({ status: 'success', data: [], errors: null }),
            getPosts: () => of({ status: 'success', data: [], errors: null }),
            getReports: () => of({ status: 'success', data: [], errors: null }),
            updateUserAccess: () => of({ status: 'success', data: null, errors: null }),
            deleteUser: () => of(void 0),
            deletePost: () => of(void 0),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
