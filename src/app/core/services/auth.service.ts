import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject } from 'rxjs';
import { User, LoginCredentials, AuthResponse } from '../models/user.model';

const API_URL = 'http://localhost:3000';
const TOKEN_KEY = 'budget_tracker_token';
const USER_KEY = 'budget_tracker_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<User> {
    // json-server doesn't have real auth, so we query users by email
    // and check the password ourselves. This is MOCK auth only.
    return this.http.get<User[]>(`${API_URL}/users?email=${credentials.email}`).pipe(
      map((users) => {
        const user = users[0];
        if (!user || user.password !== credentials.password) {
          throw new Error('Invalid email or password');
        }
        return user;
      }),
      tap((user) => this.setSession(user))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(user: User): void {
    // Fake JWT — in a real app this comes from the backend
    const fakeToken = btoa(`${user.email}:${Date.now()}`);
    localStorage.setItem(TOKEN_KEY, fakeToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
