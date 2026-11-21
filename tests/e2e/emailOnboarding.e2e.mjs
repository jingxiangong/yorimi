import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

function localUrl(value) {
  const url = new URL(value);
  assert.ok(['http:', 'https:'].includes(url.protocol));
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname), 'This test requires a local app and database.');
  return url.origin;
}

test('email login completes onboarding and opens Discover from the home page', { timeout: 90_000 }, async (context) => {
  const appUrl = localUrl(process.env.YORIMI_APP_URL || 'http://localhost:3000');
  const supabaseUrl = localUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.ok(serviceKey, 'Set the local SUPABASE_SERVICE_ROLE_KEY.');
  const service = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const email = `browser-${crypto.randomUUID()}@yorimi.local`;
  const password = `Local-${crypto.randomUUID()}-Onboarding!`;
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(error);
  const userId = data.user.id;
  context.after(async () => {
    const avatar = await service.storage.from('avatars').remove([`${userId}/avatar`]);
    const user = await service.auth.admin.deleteUser(userId);
    assert.ifError(avatar.error);
    assert.ifError(user.error);
  });

  const browser = await puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
  context.after(() => browser.close());
  const page = await browser.newPage();
  const waitForPath = (path) => page.waitForFunction(
    (expectedPath) => window.location.pathname === expectedPath, {}, path,
  );

  await page.goto(appUrl);
  await waitForPath('/welcome');
  await page.locator('button::-p-text(メールで続ける)').click();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await waitForPath('/onboarding/schedule');

  await page.goto(appUrl);
  await waitForPath('/onboarding/schedule');
  await page.locator('button::-p-text(スキップ)').click();
  await waitForPath('/onboarding/profile');
  await page.locator('input[placeholder="例：Mika"]').fill('Browser Smoke');
  await page.select('select:has(option[value="25-34"])', '25-34');
  await page.select('select:has(option[value="prefer_not_to_say"])', 'prefer_not_to_say');
  const avatarInput = await page.waitForSelector('input[type="file"]');
  await avatarInput.uploadFile(fileURLToPath(new URL('../../docs/images/readme/yorimi-cover.jpg', import.meta.url)));
  await page.locator('button[type="submit"]').click();
  await waitForPath('/discover');

  await page.goto(appUrl);
  await waitForPath('/discover');
});
