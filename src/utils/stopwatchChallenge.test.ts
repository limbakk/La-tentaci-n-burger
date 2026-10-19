import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHALLENGE_COOLDOWN_MS,
  createInitialAttemptState,
  getRemainingAttempts,
  canStartAttempt,
  consumeAttempt,
  validateSocialSubmission,
  requestSocialExtraAttempt,
  approveSocialExtraAttempt,
  grantInstagramExtraAttempt,
  grantStaffExtraAttempt,
  isCooldownActive,
  refreshChallengeCycle,
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
  assert.equal(isCooldownActive(afterFirst), false);
});

test('pending manual review does not grant credit until approved, and blocks second platform in same cycle', () => {
  const t0 = 1_700_000_000_000;
  let state = createInitialAttemptState('dev-pending', t0);
  state = consumeAttempt(state, 9.91, false, t0 + 1000);
  assert.equal(getRemainingAttempts(state, t0 + 1000), 0);

  // Submit Instagram handle when automatic verification is unavailable -> pending_review
  const reqRes = requestSocialExtraAttempt(state, 'https://www.instagram.com/burger_fan_sevilla/', 'instagram', {
    autoVerified: false,
    nowMs: t0 + 2000,
  });
  assert.equal(reqRes.ok, true);
  assert.equal(reqRes.status, 'pending_review');
  assert.equal(reqRes.state.instagramHandle, '@burger_fan_sevilla');
  // Credit is NOT granted while pending manual review
  assert.equal(reqRes.state.instagramExtraGranted, false);
  assert.equal(getRemainingAttempts(reqRes.state, t0 + 2000), 0);

  // Attempting to request again via TikTok in the same cycle is rejected
  const duplicateTikTok = requestSocialExtraAttempt(reqRes.state, '@otro_usuario', 'tiktok', {
    autoVerified: false,
    nowMs: t0 + 3000,
  });
  assert.equal(duplicateTikTok.ok, false);

  // Restaurant staff approves the manual review -> 1 extra attempt granted
  const approved = approveSocialExtraAttempt(reqRes.state, t0 + 4000);
  assert.equal(approved.ok, true);
  assert.equal(approved.state.instagramExtraGranted, true);
  assert.equal(approved.state.socialVerificationStatus, 'approved');
  assert.equal(getRemainingAttempts(approved.state, t0 + 4000), 1);
});

test('consuming both opportunities triggers 7-day cooldown and restores cycle after expiry', () => {
  const t0 = 1_700_000_000_000;
  let state = createInitialAttemptState('dev-cooldown', t0);

  // 1. Use free attempt
  state = consumeAttempt(state, 10.15, false, t0 + 1000);
  assert.equal(isCooldownActive(state, t0 + 1000), false);

  // 2. Request and approve 1 extra attempt
  const reqRes = requestSocialExtraAttempt(state, '@sevilla_smash', 'tiktok', {
    autoVerified: false,
    nowMs: t0 + 2000,
  });
  state = approveSocialExtraAttempt(reqRes.state, t0 + 3000).state;
  assert.equal(getRemainingAttempts(state, t0 + 3000), 1);

  // 3. Consume the extra attempt -> triggers 7-day cooldown
  const usedExtraAt = t0 + 5000;
  state = consumeAttempt(state, 9.98, false, usedExtraAt);
  assert.equal(getRemainingAttempts(state, usedExtraAt), 0);
  assert.equal(isCooldownActive(state, usedExtraAt), true);
  assert.ok(state.cooldownUntil);

  // 4. 6 days later: still blocked by 7-day cooldown
  const sixDaysLater = usedExtraAt + 6 * 24 * 60 * 60 * 1000;
  assert.equal(isCooldownActive(state, sixDaysLater), true);
  assert.equal(getRemainingAttempts(state, sixDaysLater), 0);
  const blockedReq = requestSocialExtraAttempt(state, '@nuevo_intento', 'instagram', {
    nowMs: sixDaysLater,
  });
  assert.equal(blockedReq.ok, false);

  // 5. After 7 days expire: 1 free attempt is restored and extra-attempt request is re-enabled
  const afterSevenDays = usedExtraAt + CHALLENGE_COOLDOWN_MS + 1000;
  const refreshed = refreshChallengeCycle(state, afterSevenDays);
  assert.equal(isCooldownActive(refreshed, afterSevenDays), false);
  assert.equal(refreshed.initialAttemptUsed, false);
  assert.equal(refreshed.instagramExtraGranted, false);
  assert.equal(refreshed.instagramExtraUsed, false);
  assert.equal(refreshed.socialVerificationStatus, 'none');
  assert.equal(getRemainingAttempts(refreshed, afterSevenDays), 1);
});

test('validateSocialSubmission rejects official restaurant profiles and wrong domains', () => {
  assert.equal(validateSocialSubmission('@Latentacion.burger', 'instagram').ok, false);
  assert.equal(validateSocialSubmission('https://www.instagram.com/Latentacion.burger/', 'instagram').ok, false);
  assert.equal(validateSocialSubmission('@Latentacionburger_', 'tiktok').ok, false);
  assert.equal(validateSocialSubmission('https://www.tiktok.com/@Latentacionburger_', 'tiktok').ok, false);
  assert.equal(validateSocialSubmission('https://www.tiktok.com/@user123', 'instagram').ok, false);

  const validIg = validateSocialSubmission('https://www.instagram.com/cliente_real/', 'instagram');
  assert.equal(validIg.ok, true);
  if (validIg.ok) {
    assert.equal(validIg.data.handle, '@cliente_real');
  }
});

test('instagram extra attempt helper and staff activation work cleanly', () => {
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

  let stateStaff = createInitialAttemptState('dev-789');
  stateStaff = consumeAttempt(stateStaff, 9.5, false);
  stateStaff = grantStaffExtraAttempt(stateStaff);
  assert.equal(getRemainingAttempts(stateStaff), 1);
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
