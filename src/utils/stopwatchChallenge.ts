export const CHALLENGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export type SocialVerificationStatus = 'none' | 'pending_review' | 'approved';

export interface ChallengeAttemptState {
  deviceToken: string;
  initialAttemptUsed: boolean;
  instagramExtraGranted: boolean;
  instagramExtraUsed: boolean;
  instagramHandle?: string;
  socialPlatform?: 'instagram' | 'tiktok';
  socialPostUrl?: string;
  socialVerificationStatus?: SocialVerificationStatus;
  socialRequestedAt?: string;
  cooldownUntil?: string;
  cycleCount?: number;
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

export interface ValidatedSocialSubmission {
  handle: string;
  profileUrl: string;
  postUrl?: string;
}

const OFFICIAL_IG_HANDLES = new Set(['@latentacion.burger', 'latentacion.burger']);
const OFFICIAL_TT_HANDLES = new Set(['@latentacionburger_', 'latentacionburger_']);

export function createInitialAttemptState(
  deviceToken: string,
  nowMs: number = Date.now()
): ChallengeAttemptState {
  return {
    deviceToken,
    initialAttemptUsed: false,
    instagramExtraGranted: false,
    instagramExtraUsed: false,
    socialVerificationStatus: 'none',
    cycleCount: 1,
    staffExtraGrantedCount: 0,
    staffExtraUsedCount: 0,
    updatedAt: new Date(nowMs).toISOString(),
  };
}

export function isCooldownActive(
  state: ChallengeAttemptState,
  nowMs: number = Date.now()
): boolean {
  if (!state.cooldownUntil) return false;
  const untilMs = Date.parse(state.cooldownUntil);
  if (Number.isNaN(untilMs)) return false;
  return nowMs < untilMs;
}

export function getRemainingCooldownMs(
  state: ChallengeAttemptState,
  nowMs: number = Date.now()
): number {
  if (!state.cooldownUntil) return 0;
  const untilMs = Date.parse(state.cooldownUntil);
  if (Number.isNaN(untilMs)) return 0;
  return Math.max(0, untilMs - nowMs);
}

export function formatCooldownRemaining(remainingMs: number): string {
  if (remainingMs <= 0) return '0 h';
  const totalHours = Math.ceil(remainingMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0 && hours > 0) {
    return `${days} ${days === 1 ? 'día' : 'días'} y ${hours} h`;
  }
  if (days > 0) {
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }
  return `${Math.max(1, hours)} h`;
}

/**
 * Automatically resets the participant's cycle when the 7-day cooldown expires,
 * restoring 1 free attempt and re-enabling the extra-attempt request.
 */
export function refreshChallengeCycle(
  state: ChallengeAttemptState,
  nowMs: number = Date.now()
): ChallengeAttemptState {
  if (!state || typeof state !== 'object') {
    return createInitialAttemptState('unknown', nowMs);
  }

  if (state.cooldownUntil) {
    const untilMs = Date.parse(state.cooldownUntil);
    if (!Number.isNaN(untilMs) && nowMs >= untilMs) {
      return {
        ...state,
        initialAttemptUsed: false,
        instagramExtraGranted: false,
        instagramExtraUsed: false,
        instagramHandle: undefined,
        socialPlatform: undefined,
        socialPostUrl: undefined,
        socialVerificationStatus: 'none',
        socialRequestedAt: undefined,
        cooldownUntil: undefined,
        cycleCount: (state.cycleCount ?? 1) + 1,
        updatedAt: new Date(nowMs).toISOString(),
      };
    }
  }

  // Ensure legacy state where both opportunities were used has a cooldown timestamp
  if (
    state.initialAttemptUsed &&
    state.instagramExtraGranted &&
    state.instagramExtraUsed &&
    !state.cooldownUntil
  ) {
    const baseMs = state.updatedAt ? Date.parse(state.updatedAt) : nowMs;
    const startMs = Number.isNaN(baseMs) ? nowMs : baseMs;
    const untilMs = startMs + CHALLENGE_COOLDOWN_MS;
    if (nowMs >= untilMs) {
      return {
        ...state,
        initialAttemptUsed: false,
        instagramExtraGranted: false,
        instagramExtraUsed: false,
        instagramHandle: undefined,
        socialPlatform: undefined,
        socialPostUrl: undefined,
        socialVerificationStatus: 'none',
        socialRequestedAt: undefined,
        cooldownUntil: undefined,
        cycleCount: (state.cycleCount ?? 1) + 1,
        updatedAt: new Date(nowMs).toISOString(),
      };
    }
    return {
      ...state,
      cooldownUntil: new Date(untilMs).toISOString(),
    };
  }

  return state;
}

export function getRemainingAttempts(
  state: ChallengeAttemptState,
  nowMs: number = Date.now()
): number {
  const current = refreshChallengeCycle(state, nowMs);
  const staffRemaining = Math.max(0, current.staffExtraGrantedCount - current.staffExtraUsedCount);
  if (isCooldownActive(current, nowMs)) {
    return staffRemaining;
  }
  const initialRemaining = current.initialAttemptUsed ? 0 : 1;
  const igRemaining = current.instagramExtraGranted && !current.instagramExtraUsed ? 1 : 0;
  return initialRemaining + igRemaining + staffRemaining;
}

export function canStartAttempt(
  state: ChallengeAttemptState,
  nowMs: number = Date.now()
): boolean {
  return getRemainingAttempts(state, nowMs) > 0;
}

export function consumeAttempt(
  state: ChallengeAttemptState,
  measuredSeconds: number,
  isWon: boolean,
  nowMs: number = Date.now()
): ChallengeAttemptState {
  const current = refreshChallengeCycle(state, nowMs);
  if (!canStartAttempt(current, nowMs)) {
    return current;
  }

  const next: ChallengeAttemptState = {
    ...current,
    lastMeasuredSeconds: measuredSeconds,
    lastIsWon: isWon,
    updatedAt: new Date(nowMs).toISOString(),
  };

  if (!next.initialAttemptUsed) {
    next.initialAttemptUsed = true;
  } else if (next.instagramExtraGranted && !next.instagramExtraUsed) {
    next.instagramExtraUsed = true;
  } else if (next.staffExtraUsedCount < next.staffExtraGrantedCount) {
    next.staffExtraUsedCount += 1;
  }

  // When both cycle opportunities (free + 1 social extra) are consumed, lock for 7 days
  if (next.initialAttemptUsed && next.instagramExtraGranted && next.instagramExtraUsed) {
    next.cooldownUntil = new Date(nowMs + CHALLENGE_COOLDOWN_MS).toISOString();
  }

  return next;
}

/**
 * Validates a participant's Instagram or TikTok username or profile/post URL.
 * Rejects invalid handles, cross-platform URLs, and the restaurant's own official accounts.
 */
export function validateSocialSubmission(
  rawInput: string,
  platform: 'instagram' | 'tiktok' = 'instagram',
  rawPostUrl?: string
): { ok: true; data: ValidatedSocialSubmission } | { ok: false; error: string } {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: 'Introduce tu @usuario o el enlace a tu perfil/publicación pública.',
    };
  }

  let extractedHandle = '';
  let detectedPostUrl: string | undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      return {
        ok: false,
        error: 'El enlace introducido no tiene un formato válido.',
      };
    }

    const host = parsedUrl.hostname.toLowerCase();
    if (platform === 'instagram') {
      if (!host.endsWith('instagram.com')) {
        return {
          ok: false,
          error: 'Introduce un enlace o @usuario válido de Instagram (instagram.com).',
        };
      }
      const segments = parsedUrl.pathname.split('/').filter(Boolean);
      if (segments.length === 0) {
        return {
          ok: false,
          error: 'El enlace de Instagram debe incluir tu nombre de usuario o publicación.',
        };
      }
      if (segments[0] === 'p' || segments[0] === 'reel' || segments[0] === 'tv') {
        return {
          ok: false,
          error: 'Indica tu @usuario de Instagram en el campo principal (o la URL de tu perfil).',
        };
      }
      extractedHandle = segments[0].replace(/^@/, '');
      if (segments.length >= 3 && (segments[1] === 'p' || segments[1] === 'reel')) {
        detectedPostUrl = parsedUrl.toString();
      }
    } else {
      if (!host.endsWith('tiktok.com')) {
        return {
          ok: false,
          error: 'Introduce un enlace o @usuario válido de TikTok (tiktok.com).',
        };
      }
      const segments = parsedUrl.pathname.split('/').filter(Boolean);
      const userSeg = segments.find((s) => s.startsWith('@')) || segments[0];
      if (!userSeg || userSeg === 'video' || userSeg === 't') {
        return {
          ok: false,
          error: 'Indica tu @usuario de TikTok (ej. @tu_usuario o tiktok.com/@tu_usuario).',
        };
      }
      extractedHandle = userSeg.replace(/^@/, '');
      if (segments.includes('video')) {
        detectedPostUrl = parsedUrl.toString();
      }
    }
  } else {
    extractedHandle = trimmed.replace(/^@/, '');
  }

  if (!/^[a-zA-Z0-9._]{2,30}$/.test(extractedHandle)) {
    return {
      ok: false,
      error: 'Introduce un @usuario válido (entre 2 y 30 caracteres: letras, números, puntos o guiones bajos).',
    };
  }

  const normalizedHandle = `@${extractedHandle}`;
  const lowerHandle = normalizedHandle.toLowerCase();

  if (
    OFFICIAL_IG_HANDLES.has(lowerHandle) ||
    OFFICIAL_TT_HANDLES.has(lowerHandle)
  ) {
    return {
      ok: false,
      error: 'Debes introducir tu propia cuenta personal, no la cuenta oficial del restaurante.',
    };
  }

  if (rawPostUrl && rawPostUrl.trim() !== '') {
    try {
      const postParsed = new URL(rawPostUrl.trim());
      const postHost = postParsed.hostname.toLowerCase();
      if (platform === 'instagram' && !postHost.endsWith('instagram.com')) {
        return {
          ok: false,
          error: 'El enlace de la publicación debe pertenecer a instagram.com.',
        };
      }
      if (platform === 'tiktok' && !postHost.endsWith('tiktok.com')) {
        return {
          ok: false,
          error: 'El enlace de la publicación debe pertenecer a tiktok.com.',
        };
      }
      detectedPostUrl = postParsed.toString();
    } catch {
      return {
        ok: false,
        error: 'El enlace de la publicación no tiene un formato URL válido.',
      };
    }
  }

  const profileUrl =
    platform === 'tiktok'
      ? `https://www.tiktok.com/@${extractedHandle}`
      : `https://www.instagram.com/${extractedHandle}/`;

  return {
    ok: true,
    data: {
      handle: normalizedHandle,
      profileUrl,
      postUrl: detectedPostUrl,
    },
  };
}

export function validateInstagramHandle(rawHandle: string): string | null {
  const res = validateSocialSubmission(rawHandle, 'instagram');
  return res.ok ? res.data.handle : null;
}

/**
 * Registers a social verification request for the 1 extra attempt per cycle.
 * Both Instagram and TikTok combined can never grant more than 1 extra attempt per 7-day cycle.
 * When `autoVerified` is false (no official API verification of the public post/tag),
 * the request is marked `pending_review` and does NOT grant the attempt credit until approved.
 */
export function requestSocialExtraAttempt(
  state: ChallengeAttemptState,
  rawInput: string,
  platform: 'instagram' | 'tiktok' = 'instagram',
  options?: {
    postUrl?: string;
    autoVerified?: boolean;
    nowMs?: number;
  }
): {
  ok: boolean;
  status?: SocialVerificationStatus;
  state: ChallengeAttemptState;
  error?: string;
} {
  const nowMs = options?.nowMs ?? Date.now();
  const current = refreshChallengeCycle(state, nowMs);

  if (isCooldownActive(current, nowMs)) {
    const remainingText = formatCooldownRemaining(getRemainingCooldownMs(current, nowMs));
    return {
      ok: false,
      state: current,
      error: `Has agotado tus oportunidades de este ciclo. Podrás volver a participar en ${remainingText}.`,
    };
  }

  if (!current.initialAttemptUsed) {
    return {
      ok: false,
      state: current,
      error: 'Primero utiliza tu intento gratuito disponible antes de solicitar el intento extra.',
    };
  }

  if (
    current.instagramExtraGranted ||
    current.socialVerificationStatus === 'approved' ||
    current.socialVerificationStatus === 'pending_review'
  ) {
    return {
      ok: false,
      state: current,
      error:
        current.socialVerificationStatus === 'pending_review'
          ? 'Ya tienes una solicitud de intento extra pendiente de revisión manual por el restaurante en este ciclo.'
          : 'El intento extra por redes sociales ya ha sido concedido en este ciclo (máximo 1 entre Instagram y TikTok).',
    };
  }

  const validation = validateSocialSubmission(rawInput, platform, options?.postUrl);
  if (!validation.ok) {
    return {
      ok: false,
      state: current,
      error: validation.error,
    };
  }

  const autoVerified = Boolean(options?.autoVerified);
  const nextStatus: SocialVerificationStatus = autoVerified ? 'approved' : 'pending_review';

  return {
    ok: true,
    status: nextStatus,
    state: {
      ...current,
      instagramExtraGranted: autoVerified,
      instagramHandle: validation.data.handle,
      socialPlatform: platform,
      socialPostUrl: validation.data.postUrl,
      socialVerificationStatus: nextStatus,
      socialRequestedAt: new Date(nowMs).toISOString(),
      updatedAt: new Date(nowMs).toISOString(),
    },
  };
}

/**
 * Approves a pending manual review request (or grants the 1 cycle social extra attempt if not yet granted).
 */
export function approveSocialExtraAttempt(
  state: ChallengeAttemptState,
  nowMs: number = Date.now()
): { ok: boolean; state: ChallengeAttemptState; error?: string } {
  const current = refreshChallengeCycle(state, nowMs);
  if (isCooldownActive(current, nowMs)) {
    return {
      ok: false,
      state: current,
      error: 'El participante se encuentra en el periodo de bloqueo de 7 días.',
    };
  }
  if (current.instagramExtraGranted && current.instagramExtraUsed) {
    return {
      ok: false,
      state: current,
      error: 'El intento extra de este ciclo ya fue utilizado.',
    };
  }
  return {
    ok: true,
    state: {
      ...current,
      instagramExtraGranted: true,
      socialVerificationStatus: 'approved',
      updatedAt: new Date(nowMs).toISOString(),
    },
  };
}

/**
 * Legacy helper maintained for compatibility; when autoVerified is true (default in pure unit helper
 * or after approval), grants the 1 extra attempt per cycle.
 */
export function grantInstagramExtraAttempt(
  state: ChallengeAttemptState,
  rawHandle: string,
  platform: 'instagram' | 'tiktok' = 'instagram',
  autoVerified: boolean = true,
  nowMs: number = Date.now()
): { ok: boolean; state: ChallengeAttemptState; error?: string } {
  const current = refreshChallengeCycle(state, nowMs);
  const baseState = current.initialAttemptUsed
    ? current
    : { ...current, initialAttemptUsed: true };
  return requestSocialExtraAttempt(baseState, rawHandle, platform, {
    autoVerified,
    nowMs,
  });
}

export function grantStaffExtraAttempt(
  state: ChallengeAttemptState,
  nowMs: number = Date.now()
): ChallengeAttemptState {
  const current = refreshChallengeCycle(state, nowMs);
  // If there is a pending social review and the social extra hasn't been granted yet,
  // approve the social verification first so it counts toward the 2-opportunity cycle.
  if (
    current.socialVerificationStatus === 'pending_review' &&
    !current.instagramExtraGranted
  ) {
    return {
      ...current,
      instagramExtraGranted: true,
      socialVerificationStatus: 'approved',
      updatedAt: new Date(nowMs).toISOString(),
    };
  }
  return {
    ...current,
    staffExtraGrantedCount: current.staffExtraGrantedCount + 1,
    updatedAt: new Date(nowMs).toISOString(),
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
