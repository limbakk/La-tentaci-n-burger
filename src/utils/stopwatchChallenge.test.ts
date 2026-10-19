import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialAttemptState,
  getRemainingAttempts,
  canStartAttempt,
  consumeAttempt,
  grantInstagramExtraAttempt,
  grantStaffExtraAttempt,
  evaluateStopwatchStop,
  formatStopwatchDisplay,
} from './stopwatchChallenge.ts';

test('initial state grants exactly 1 attempt and locks after consumption', () => {
  const initial = createInitialAttemptState('dev-123');
  assert.equal(getRemainingAttempts(initial), 1);
  assert.equal(canStartAttempt(initial), true);

  const afterFirst = consumeAttempt(initial, 9.84, false);
  assert.equal(getRemainingAttempts(afterFirst), 0);
  assert.equal(canStartAttempt(afterFirst), false);
  assert.equal(afterFirst.initialAttemptUsed, true);
});

test('instagram extra attempt grants 1 additional attempt once and validates handle', () => {
  let state = createInitialAttemptState('dev-456');
  state = consumeAttempt(state, 10.12, false);
  assert.equal(getRemainingAttempts(state), 0);

  const invalid = grantInstagramExtraAttempt(state, '!');
  assert.equal(invalid.ok, false);

  const granted = grantInstagramExtraAttempt(state, 'cliente_sevilla');
  assert.equal(granted.ok, true);
  assert.equal(granted.state.instagramHandle, '@cliente_sevilla');
  assert.equal(getRemainingAttempts(granted.state), 1);

  const duplicate = grantInstagramExtraAttempt(granted.state, 'otro_user');
  assert.equal(duplicate.ok, false);

  const afterUsed = consumeAttempt(granted.state, 10.0, true);
  assert.equal(getRemainingAttempts(afterUsed), 0);
  assert.equal(afterUsed.instagramExtraUsed, true);

  // Also verify TikTok platform option
  let stateTikTok = createInitialAttemptState('dev-tiktok');
  stateTikTok = consumeAttempt(stateTikTok, 9.95, false);
  const grantedTikTok = grantInstagramExtraAttempt(stateTikTok, '@tiktok_user', 'tiktok');
  assert.equal(grantedTikTok.ok, true);
  assert.equal(grantedTikTok.state.socialPlatform, 'tiktok');
  assert.equal(getRemainingAttempts(grantedTikTok.state), 1);
});

test('staff activation grants additional in-store attempts cleanly', () => {
  let state = createInitialAttemptState('dev-789');
  state = consumeAttempt(state, 9.5, false);
  assert.equal(getRemainingAttempts(state), 0);

  state = grantStaffExtraAttempt(state);
  assert.equal(getRemainingAttempts(state), 1);

  state = consumeAttempt(state, 10.0, true);
  assert.equal(getRemainingAttempts(state), 0);
});

test('evaluateStopwatchStop and formatStopwatchDisplay match exact 10.00s target', () => {
  assert.equal(formatStopwatchDisplay(10000), '10:00');
  const win = evaluateStopwatchStop(10004, 10.0, 0.0);
  assert.equal(win.measuredSeconds, 10.0);
  assert.equal(win.isWon, true);
  assert.equal(win.diff, 0);

  const miss = evaluateStopwatchStop(10010, 10.0, 0.0);
  assert.equal(miss.measuredSeconds, 10.01);
  assert.equal(miss.isWon, false);
  assert.equal(miss.diff, 0.01);
});
