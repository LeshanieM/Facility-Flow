import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateTime } from './dateTime.js';

test('formatDateTime renders ISO timestamps with a real date and time', () => {
  const formatted = formatDateTime('2026-04-20T05:30:00Z');

  assert.notEqual(formatted, 'N/A');
  assert.match(formatted, /\d{4}|\bApr\b|\bAM\b|\bPM\b/i);
});

test('formatDateTime does not fall back to misleading just-now text for missing values', () => {
  assert.equal(formatDateTime(null), 'N/A');
  assert.equal(formatDateTime('not-a-date'), 'N/A');
});
