import { of } from 'rxjs';

const mockHttp = {
  post: jest.fn(),
};

jest.mock('@angular/core', () => ({
  inject: jest.fn(() => mockHttp),
  Injectable: () => (target: unknown) => target,
}));

jest.mock('@angular/common/http', () => ({
  HttpClient: class {},
}));

import { PolicyService } from './policy-service';

describe('PolicyService', () => {
  beforeEach(() => {
    localStorage.clear();
    mockHttp.post.mockReset();
  });

  it('creates policies without sending client-side identity headers', () => {
    mockHttp.post.mockReturnValue(of({}));

    const service = new PolicyService();

    service.createPolicy({
      type: 'CAR',
      premium: 1200,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    }).subscribe();

    expect(mockHttp.post).toHaveBeenCalledWith(
      'http://localhost:8080/api/policies',
      {
        type: 'CAR',
        premium: 1200,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      }
    );
  });
});
