import { test, expect } from '@playwright/test';
import crypto from 'crypto';

/**
 * Utility to sign a JWT with HS256 using the backend's secret.
 * This allows the test to authenticate as a real user in the backend.
 */
function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const part1 = encode(header);
  const part2 = encode(payload);

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${part1}.${part2}`)
    .digest('base64url');

  return `${part1}.${part2}.${signature}`;
}

// Secret found in backend/src/main/resources/application.yml
const JWT_SECRET =
  '3dbdeb3482a58802f5fdc7bb412cbd8dec633a96aa805a31c3e2607a1159b001';

test.describe('Notifications page (E2E with Backend)', () => {
 
  const TEST_USER = {
    email: 'leshlaptop32@gmail.com',
    id: '69cf0ca4582d9e0f295041e1', 
    name: 'LESH',
    role: 'USER',
  };

  test.beforeEach(async ({ page }) => {
    const token = signJwt(
      {
        sub: TEST_USER.email,
        id: TEST_USER.id,
        name: TEST_USER.name,
        role: TEST_USER.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      },
      JWT_SECRET,
    );

    await page.addInitScript((t) => {
      window.localStorage.setItem('token', t);
    }, token);

    // We do NOT mock /api/notifications here.
    // The app will call the real backend via the Vite proxy.
  });

  test('renders real notifications from backend and marks them as read', async ({
    page,
  }) => {
    // 1. Visit the page
    await page.goto('/notifications');

    // 2. Ensure we have at least one notification by calling the backend's test endpoint
    // We do this via the page context so it uses the token in localStorage
    await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/test', {
        headers: { Authorization: `Bearer ${token}` },
      });
    });

    // 3. Reload to see the new notification
    await page.reload();

    // 4. Verify the notification appears (the test endpoint uses "Test Notification")
    const testNotification = page.getByText(/Test Notification/i).first();
    await expect(testNotification).toBeVisible();

    // 5. Test filtering to 'Unread'
    await page.getByRole('button', { name: 'Unread' }).click();
    await expect(testNotification).toBeVisible();

    // 6. Test 'Mark as read'
    const initialCount = await page.getByTitle('Mark as read').count();
    
    const unreadRow = page
      .locator('div.p-6.flex.gap-4', { hasText: /Test Notification/i })
      .first();
    const markReadButton = unreadRow.getByTitle('Mark as read');

    await unreadRow.hover();
    await expect(markReadButton).toBeVisible();
    await markReadButton.click();

    // 7. Verify the count decreased (disappears from 'Unread' list)
    await expect(page.getByTitle('Mark as read')).toHaveCount(initialCount - 1);
  });

  test('shows real empty state when no notifications exist', async ({
    page,
  }) => {
   
    await page.goto('/notifications');
    await expect(
      page.getByRole('heading', { name: 'Notifications' }),
    ).toBeVisible();
  });
});
