import { spawnSync } from 'node:child_process';

const url = new URL(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321');
if (!['http:', 'https:'].includes(url.protocol) || !['127.0.0.1', 'localhost'].includes(url.hostname)) {
  throw new Error('Integration tests require a loopback Supabase URL.');
}

const requiredKeys = ['SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_JWT_SECRET'];
const missingKeys = requiredKeys.filter((name) => !process.env[name]);
if (missingKeys.length) {
  throw new Error(`Set local Supabase test variables: ${missingKeys.join(', ')}`);
}

const suites = [
  'CONNECTION_LIFECYCLE',
  'DISCOVER',
  'EVENT_COMPANION',
  'EVENT_IMPORT',
  'EVENT_RECOMMENDATION',
  'FIXED_PLAN_SNAPSHOT',
  'INVITATION',
  'PUBLIC_PLACES',
  'SUGGESTED_PLACE',
];
const flags = Object.fromEntries(suites.map((suite) => [`RUN_SUPABASE_${suite}_INTEGRATION`, '1']));
const result = spawnSync(
  process.execPath,
  ['--test', '--test-concurrency=1', 'tests/**/*.integration.test.mjs'],
  {
    env: { ...process.env, ...flags, SUPABASE_URL: url.toString() },
    stdio: 'inherit',
  },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
