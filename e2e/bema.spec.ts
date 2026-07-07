import { expect, test, type Page } from '@playwright/test';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

const authUser: AuthUser = {
  id: 'identity-user-123',
  email: 'jane@example.com',
  name: 'Jane Doe',
};

const authResponse = {
  timestamp: new Date().toISOString(),
  message: 'OK',
  data: {
    token: 'jwt-token',
    user: authUser,
  },
};

const now = new Date().toISOString();

async function mockApi(page: Page, options?: { loginError?: string }) {
  let policies = [
    {
      id: 1,
      identityId: authUser.id,
      type: 'CAR' as const,
      premium: 1200,
      startDate: now,
      endDate: now,
      description: 'Auto coverage',
      createdAt: now,
      updatedAt: now,
    },
  ];

  let claims = [
    {
      id: 10,
      status: 'PENDING',
      userId: authUser.id,
      amount: 2500,
      description: 'Windshield repair',
      policyId: '1',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await page.route('**/api/auth/login', async (route) => {
    if (options?.loginError) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          message: options.loginError,
          data: null,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authResponse),
    });
  });

  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(authResponse),
    });
  });

  await page.route('**/api/policies**', async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());

    if (method === 'GET' && url.pathname.endsWith('/api/policies')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          message: 'Policies retrieved successfully',
          data: policies,
        }),
      });
      return;
    }

    if (method === 'POST' && url.pathname.endsWith('/api/policies')) {
      const body = route.request().postDataJSON() as {
        type: string;
        premium: number;
        startDate: string;
        endDate: string;
      };

      const created = {
        id: 2,
        identityId: authUser.id,
        type: body.type,
        premium: body.premium,
        startDate: body.startDate,
        endDate: body.endDate,
        createdAt: now,
        updatedAt: now,
      };
      policies = [...policies, created];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          message: 'Policy created successfully',
          data: created,
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.route('**/api/claims**', async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());

    if (method === 'GET' && url.pathname.endsWith('/api/claims')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          message: 'Claims retrieved successfully',
          data: claims,
        }),
      });
      return;
    }

    if (method === 'POST' && url.pathname.endsWith('/api/claims')) {
      const body = route.request().postDataJSON() as {
        description: string;
        amount?: number;
        policyId?: string;
      };

      const created = {
        id: 11,
        status: 'PENDING',
        userId: authUser.id,
        amount: body.amount,
        description: body.description,
        policyId: body.policyId,
        createdAt: now,
        updatedAt: now,
      };
      claims = [...claims, created];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          message: 'Claim filed successfully',
          data: created,
        }),
      });
      return;
    }

    await route.continue();
  });
}

async function seedAuthenticatedSession(page: Page) {
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('bema_auth_token', token);
      localStorage.setItem('bema_user', JSON.stringify(user));
    },
    { token: authResponse.data.token, user: authUser }
  );
}

test('redirects unauthenticated users away from protected routes', async ({ page }) => {
  await mockApi(page);

  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

test('registers, logs in, and logs out cleanly', async ({ page }) => {
  await mockApi(page);

  await page.goto('/auth/register');
  await page.getByLabel('Full name').fill('Jane Doe');
  await page.getByLabel('Email address').fill('jane@example.com');
  await page.getByLabel('Password').fill('password1');
  await page.getByLabel('Confirm password').fill('password1');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

  await page.getByTitle('Sign out').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Protect What Matters with Confidence' })).toBeVisible();
});

test('shows login validation errors and keeps the user on the auth page', async ({ page }) => {
  await mockApi(page, { loginError: 'Invalid credentials' });

  await page.goto('/auth/login');
  await page.getByLabel('Email address').fill('jane@example.com');
  await page.getByLabel('Password').fill('password1');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login/);
});

test('creates policies and claims with authenticated state', async ({ page }) => {
  await mockApi(page);
  await seedAuthenticatedSession(page);

  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

  await page.getByRole('link', { name: 'New Policy' }).click();
  await page.getByLabel(/Policy Type/i).selectOption('CAR');
  await page.getByLabel(/Annual Premium/i).fill('1200');
  await page.getByLabel(/Start Date/i).fill('2026-01-01');
  await page.getByLabel(/End Date/i).fill('2026-12-31');
  await page.getByRole('button', { name: 'Create Policy' }).click();

  await expect(page).toHaveURL(/\/dashboard\/policies/);
  await expect(page.getByText('#2')).toBeVisible();

  await page.getByRole('link', { name: 'File Claim' }).click();
  await page.getByLabel(/Claim Description/i).fill('Glass damage after hailstorm');
  await page.getByLabel(/Related Policy/i).fill('2');
  await page.getByLabel(/Claim Amount/i).fill('2500');
  await page.getByRole('button', { name: 'Submit Claim' }).click();

  await expect(page).toHaveURL(/\/dashboard\/claim/);
  await expect(page.getByText('PENDING')).toBeVisible();
  await expect(page.getByText('Glass damage after hailstorm')).toBeVisible();
});
