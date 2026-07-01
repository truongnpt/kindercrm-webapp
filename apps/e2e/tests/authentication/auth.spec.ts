import { expect, test } from '@playwright/test';

import { AuthPageObject } from './auth.po';

test.describe('Auth flow', () => {
  test.describe.configure({ mode: 'serial' });

  let email: string;

  test('will sign-up and redirect to the home page', async ({ page }) => {
    const auth = new AuthPageObject(page);
    await auth.goToSignUp();

    email = auth.createRandomEmail();

    console.log(`Signing up with email ${email} ...`);

    const signUp = auth.signUp({
      email,
      password: 'password',
      repeatPassword: 'password',
    });

    const response = page.waitForResponse((resp) => {
      return resp.url().includes('auth');
    });

    await Promise.all([signUp, response]);

    await auth.visitConfirmEmailLink(email);

    await page.waitForURL(/\/app(\/onboarding)?$/);
  });

  test('will sign-in with the correct credentials', async ({ page }) => {
    const auth = new AuthPageObject(page);
    await auth.goToSignIn();

    console.log(`Signing in with email ${email} ...`);

    await auth.signIn({
      email,
      password: 'password',
    });

    await page.waitForURL(/\/app(\/onboarding)?$/);

    expect(page.url()).toMatch(/\/app(\/onboarding)?$/);

    await auth.signOut();

    expect(page.url()).toContain('/');
  });
});

test.describe('Auth routes', () => {
  test('will redirect authenticated users away from sign-in', async ({
    page,
  }) => {
    const auth = new AuthPageObject(page);
    await auth.goToSignUp();

    const email = auth.createRandomEmail();

    await auth.signUp({
      email,
      password: 'password',
      repeatPassword: 'password',
    });

    await auth.visitConfirmEmailLink(email);
    await page.waitForURL(/\/app(\/onboarding)?$/);

    await page.goto('/auth/sign-in');

    await page.waitForURL(/\/app(\/onboarding)?$/);
  });
});
