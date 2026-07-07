// Src/app/features/auth/auth-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiGatewayUrl}/auth`;

  private TOKEN_KEY = 'bema_auth_token';
  private USER_KEY = 'bema_user';

  private currentUser$ = new BehaviorSubject<User | null>(this.loadUser());
  private authenticated$ = new BehaviorSubject<boolean>(!!this.getToken());

  constructor(private http: HttpClient) {}

  get user$() {
    return this.currentUser$.asObservable();
  }

  get isAuthenticated$() {
    return this.authenticated$.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUser$.value;
  }

  get isAuthenticated(): boolean {
    return this.authenticated$.value;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap(res => this.handleAuth(res)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap(res => this.handleAuth(res)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
    this.authenticated$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuth(response: AuthResponse): void {
    if (!response?.data) return;

    localStorage.setItem(this.TOKEN_KEY, response.data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));

    this.currentUser$.next(response.data.user);
    this.authenticated$.next(true);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      this.logout();
      return null;
    }
  }
}
