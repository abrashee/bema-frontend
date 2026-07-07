import { of } from 'rxjs';

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

  it('persists tokens and user profile after login', () => {
    mockHttp.post.mockReturnValue(
      of({
        timestamp: new Date().toISOString(),
        message: 'Login successful',
        data: {
          token: 'jwt-token',
          user: {
            id: 'identity-user-123',
            email: 'jane@example.com',
            name: 'Jane Doe',
          },
        },
      })
    );

    const service = new AuthService(mockHttp as never);

    service.login({ email: 'jane@example.com', password: 'password1' }).subscribe();

    expect(localStorage.getItem('bema_auth_token')).toBe('jwt-token');
    expect(JSON.parse(localStorage.getItem('bema_user') ?? '{}')).toEqual({
      id: 'identity-user-123',
      email: 'jane@example.com',
      name: 'Jane Doe',
    });
  });

  it('clears stored session data on logout', () => {
    localStorage.setItem('bema_auth_token', 'jwt-token');
    localStorage.setItem(
      'bema_user',
      JSON.stringify({ id: 'identity-user-123', email: 'jane@example.com', name: 'Jane Doe' })
    );

    const service = new AuthService(mockHttp as never);
    service.logout();

    expect(localStorage.getItem('bema_auth_token')).toBeNull();
    expect(localStorage.getItem('bema_user')).toBeNull();
  });
});
