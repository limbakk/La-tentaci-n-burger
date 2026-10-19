export interface ChallengeAttemptState {
  deviceToken: string;
  initialAttemptUsed: boolean;
  instagramExtraGranted: boolean;
  instagramExtraUsed: boolean;
  instagramHandle?: string;
  socialPlatform?: 'instagram' | 'tiktok';
  staffExtraGrantedCount: number;
  staffExtraUsedCount: number;
  lastMeasuredSeconds?: number;
  lastIsWon?: boolean;
  updatedAt: string;
}

export interface StopEvaluationResult {
  measuredSeconds: number;
  isWon: boolean;
  diff: number;
}

export function createInitialAttemptState(deviceToken: string): ChallengeAttemptState {
  return {
    deviceToken,
    initialAttemptUsed: false,
    instagramExtraGranted: false,
    instagramExtraUsed: false,
    staffExtraGrantedCount: 0,
    staffExtraUsedCount: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function getRemainingAttempts(state: ChallengeAttemptState): number {
  const initialRemaining = state.initialAttemptUsed ? 0 : 1;
  const igRemaining = state.instagramExtraGranted && !state.instagramExtraUsed ? 1 : 0;
  const staffRemaining = Math.max(0, state.staffExtraGrantedCount - state.staffExtraUsedCount);
  return initialRemaining + igRemaining + staffRemaining;
}

export function canStartAttempt(state: ChallengeAttemptState): boolean {
  return getRemainingAttempts(state) > 0;
}

export function consumeAttempt(
  state: ChallengeAttemptState,
  measuredSeconds: number,
  isWon: boolean
): ChallengeAttemptState {
  if (!canStartAttempt(state)) {
    return state;
  }

  const next: ChallengeAttemptState = {
    ...state,
    lastMeasuredSeconds: measuredSeconds,
    lastIsWon: isWon,
    updatedAt: new Date().toISOString(),
  };

  if (!next.initialAttemptUsed) {
    next.initialAttemptUsed = true;
  } else if (next.instagramExtraGranted && !next.instagramExtraUsed) {
    next.instagramExtraUsed = true;
  } else if (next.staffExtraUsedCount < next.staffExtraGrantedCount) {
    next.staffExtraUsedCount += 1;
  }

  return next;
}

export function validateInstagramHandle(rawHandle: string): string | null {
  const trimmed = rawHandle.trim();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  if (!/^@[a-zA-Z0-9._]{2,30}$/.test(normalized)) {
    return null;
  }
  return normalized;
}

export function grantInstagramExtraAttempt(
  state: ChallengeAttemptState,
  rawHandle: string,
  platform: 'instagram' | 'tiktok' = 'instagram'
): { ok: boolean; state: ChallengeAttemptState; error?: string } {
  if (state.instagramExtraGranted) {
    return {
      ok: false,
      state,
      error: 'El intento extra por publicación en redes sociales ya ha sido registrado en este dispositivo.',
    };
  }

  const validHandle = validateInstagramHandle(rawHandle);
  if (!validHandle) {
    return {
      ok: false,
      state,
      error: 'Introduce un @usuario válido (ej. @tu_usuario).',
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      instagramExtraGranted: true,
      instagramHandle: validHandle,
      socialPlatform: platform,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function grantStaffExtraAttempt(state: ChallengeAttemptState): ChallengeAttemptState {
  return {
    ...state,
    staffExtraGrantedCount: state.staffExtraGrantedCount + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function evaluateStopwatchStop(
  elapsedMs: number,
  targetSeconds = 10.0,
  toleranceSeconds = 0.0
): StopEvaluationResult {
  const totalCentis = Math.floor(elapsedMs / 10);
  const measuredSeconds = totalCentis / 100;
  const diff = Math.round(Math.abs(measuredSeconds - targetSeconds) * 100) / 100;
  const isWon = diff <= toleranceSeconds;

  return {
    measuredSeconds,
    isWon,
    diff,
  };
}

export function formatStopwatchDisplay(ms: number): string {
  const safeMs = Math.max(0, ms);
  const totalCentis = Math.floor(safeMs / 10);
  const totalSecs = Math.floor(totalCentis / 100);
  const centis = totalCentis % 100;
  const secs = totalSecs % 60;
  return `${String(secs).padStart(2, '0')}:${String(centis).padStart(2, '0')}`;
}
