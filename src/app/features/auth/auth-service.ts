// Src/app/features/auth/auth-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, finalize, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiGatewayUrl}/auth`;

  private readonly TOKEN_KEY = 'bema_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'bema_refresh_token';
  private readonly USER_KEY = 'bema_user';

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
      .pipe(tap(response => this.handleAuth(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap(response => this.handleAuth(response)));
  }

  logout(): Observable<void> {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      this.clearSession();
      return new Observable<void>(subscriber => {
        subscriber.next();
        subscriber.complete();
      });
    }

    return this.http
      .post<ApiResponse<null>>(`${this.apiUrl}/logout`, {
        accessToken,
        refreshToken,
      })
      .pipe(
        map(() => undefined),
        finalize(() => this.clearSession())
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private handleAuth(response: AuthResponse): void {
    if (!response?.data) {
      return;
    }

    localStorage.setItem(this.TOKEN_KEY, response.data.token);
    localStorage.setItem(
      this.REFRESH_TOKEN_KEY,
      response.data.refreshToken
    );
    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(response.data.user)
    );

    this.currentUser$.next(response.data.user);
    this.authenticated$.next(true);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
    this.authenticated$.next(false);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}
