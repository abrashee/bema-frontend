import { of, throwError } from 'rxjs';

const mockHttp = {
  post: jest.fn(),
};

jest.mock('@angular/core', () => ({
  Injectable: () => (target: unknown) => target,
}));

jest.mock('@angular/common/http', () => ({
  HttpClient: class {},
}));

import { AuthService } from './auth-service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    mockHttp.post.mockReset();
  });

  it('persists access token, refresh token, and user profile after login', () => {
    mockHttp.post.mockReturnValue(
      of({
        timestamp: new Date().toISOString(),
        message: 'Login successful',
        data: {
          token: 'jwt-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'identity-user-123',
            email: 'jane@example.com',
            name: 'Jane Doe',
          },
        },
      })
    );

    const service = new AuthService(mockHttp as never);

    service.login({
      email: 'jane@example.com',
      password: 'password1',
    }).subscribe();

    expect(localStorage.getItem('bema_auth_token')).toBe('jwt-token');
    expect(localStorage.getItem('bema_refresh_token')).toBe('refresh-token');
    expect(JSON.parse(localStorage.getItem('bema_user') ?? '{}')).toEqual({
      id: 'identity-user-123',
      email: 'jane@example.com',
      name: 'Jane Doe',
    });
  });

  it('calls backend logout with both tokens and clears the session', () => {
    localStorage.setItem('bema_auth_token', 'jwt-token');
    localStorage.setItem('bema_refresh_token', 'refresh-token');
    localStorage.setItem(
      'bema_user',
      JSON.stringify({
        id: 'identity-user-123',
        email: 'jane@example.com',
        name: 'Jane Doe',
      })
    );

    mockHttp.post.mockReturnValue(
      of({
        timestamp: new Date().toISOString(),
        message: 'Logout successful',
        data: null,
      })
    );

    const service = new AuthService(mockHttp as never);

    service.logout().subscribe();

    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
      }
    );

    expect(localStorage.getItem('bema_auth_token')).toBeNull();
    expect(localStorage.getItem('bema_refresh_token')).toBeNull();
    expect(localStorage.getItem('bema_user')).toBeNull();
  });

  it('clears the local session when backend logout fails', () => {
    localStorage.setItem('bema_auth_token', 'jwt-token');
    localStorage.setItem('bema_refresh_token', 'refresh-token');
    localStorage.setItem(
      'bema_user',
      JSON.stringify({
        id: 'identity-user-123',
        email: 'jane@example.com',
        name: 'Jane Doe',
      })
    );

    mockHttp.post.mockReturnValue(
      throwError(() => new Error('Network failure'))
    );

    const service = new AuthService(mockHttp as never);

    service.logout().subscribe({
      error: () => undefined,
    });

    expect(localStorage.getItem('bema_auth_token')).toBeNull();
    expect(localStorage.getItem('bema_refresh_token')).toBeNull();
    expect(localStorage.getItem('bema_user')).toBeNull();
  });

  it('clears local state without a backend call when tokens are missing', () => {
    localStorage.setItem(
      'bema_user',
      JSON.stringify({
        id: 'identity-user-123',
        email: 'jane@example.com',
        name: 'Jane Doe',
      })
    );

    const service = new AuthService(mockHttp as never);

    service.logout().subscribe();

    expect(mockHttp.post).not.toHaveBeenCalled();
    expect(localStorage.getItem('bema_user')).toBeNull();
  });
});
