import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Check,
  Instagram,
  AlertCircle,
  ExternalLink,
  KeyRound,
  X,
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';
import {
  type ChallengeAttemptState,
  createInitialAttemptState,
  refreshChallengeCycle,
  isCooldownActive,
  getRemainingCooldownMs,
  formatCooldownRemaining,
  getRemainingAttempts,
  canStartAttempt,
  consumeAttempt,
  requestSocialExtraAttempt,
  evaluateStopwatchStop,
  formatStopwatchDisplay,
} from '../utils/stopwatchChallenge';

const TOKEN_STORAGE_KEY = 'la_tentacion_challenge_token';
const STATE_STORAGE_KEY = 'la_tentacion_challenge_state_v1';
const COOKIE_NAME = 'ltb_challenge_token';

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieToken(token: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=31536000; SameSite=Lax`;
}

function getOrCreateDeviceToken(): string {
  if (typeof window === 'undefined') return 'server-render';
  const fromCookie = getCookieToken();
  const fromStorage = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  const token =
    fromStorage ||
    fromCookie ||
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore storage errors
  }
  setCookieToken(token);
  return token;
}

function loadLocalAttemptState(token: string): ChallengeAttemptState {
  if (typeof window === 'undefined') return createInitialAttemptState(token);
  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChallengeAttemptState;
      if (parsed && typeof parsed === 'object' && typeof parsed.initialAttemptUsed === 'boolean') {
        return refreshChallengeCycle({ ...parsed, deviceToken: token });
      }
    }
  } catch {
    // ignore parse errors
  }
  return createInitialAttemptState(token);
}

function saveLocalAttemptState(state: ChallengeAttemptState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
    window.localStorage.setItem(TOKEN_STORAGE_KEY, state.deviceToken);
  } catch {
    // ignore storage errors
  }
  setCookieToken(state.deviceToken);
}

export const PromotionsSection: React.FC = () => {
  const challengeConfig = RESTAURANT_INFO.stopwatchChallenge;

  const [deviceToken] = useState<string>(() => getOrCreateDeviceToken());
  const [attemptState, setAttemptState] = useState<ChallengeAttemptState>(() =>
    loadLocalAttemptState(getOrCreateDeviceToken())
  );

  // Stopwatch state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [challengeResult, setChallengeResult] = useState<{
    measuredSeconds: number;
    isWon: boolean;
    diff: number;
  } | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Remote Instagram / TikTok manual validation state (inside rules dropdown)
  const [socialPlatform, setSocialPlatform] = useState<'instagram' | 'tiktok' | null>(null);
  const [igHandleInput, setIgHandleInput] = useState('');
  const [igConfirmShared, setIgConfirmShared] = useState(false);
  const [igFeedback, setIgFeedback] = useState<{
    type: 'error' | 'success' | 'pending';
    message: string;
  } | null>(null);
  const [isSubmittingIg, setIsSubmittingIg] = useState(false);
  const [resetAfterUsedNotice, setResetAfterUsedNotice] = useState(false);

  // Private staff authorization modal state (never exposes controls publicly without secret code)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffCodeInput, setStaffCodeInput] = useState('');
  const [staffFeedback, setStaffFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const prizeCardRef = useRef<HTMLDivElement | null>(null);
  const staffTapCountRef = useRef<number>(0);
  const staffTapTimeoutRef = useRef<number | null>(null);

  const handleSecretStaffTap = () => {
    staffTapCountRef.current += 1;
    if (staffTapTimeoutRef.current) {
      window.clearTimeout(staffTapTimeoutRef.current);
    }
    if (staffTapCountRef.current >= 3) {
      staffTapCountRef.current = 0;
      setStaffFeedback(null);
      setIsStaffModalOpen(true);
      return;
    }
    staffTapTimeoutRef.current = window.setTimeout(() => {
      staffTapCountRef.current = 0;
    }, 1200);
  };

  // Support private URL parameter (?staff=1) or keyboard shortcut (Alt+S) for staff in-store activation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('staff') === '1') {
      setIsStaffModalOpen(true);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setStaffFeedback(null);
        setIsStaffModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync attempt state with backend on mount
  useEffect(() => {
    let isMounted = true;
    const localState = loadLocalAttemptState(deviceToken);

    fetch(`/api/challenge/state?token=${encodeURIComponent(deviceToken)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.state) return;
        const serverState = refreshChallengeCycle(data.state as ChallengeAttemptState);
        const merged = refreshChallengeCycle({
          ...serverState,
          initialAttemptUsed: serverState.initialAttemptUsed || localState.initialAttemptUsed,
          instagramExtraGranted: serverState.instagramExtraGranted || localState.instagramExtraGranted,
          instagramExtraUsed: serverState.instagramExtraUsed || localState.instagramExtraUsed,
          instagramHandle: serverState.instagramHandle || localState.instagramHandle,
          socialPlatform: serverState.socialPlatform || localState.socialPlatform,
          socialPostUrl: serverState.socialPostUrl || localState.socialPostUrl,
          socialVerificationStatus:
            serverState.socialVerificationStatus === 'approved' || localState.socialVerificationStatus === 'approved'
              ? 'approved'
              : serverState.socialVerificationStatus === 'pending_review' || localState.socialVerificationStatus === 'pending_review'
                ? 'pending_review'
                : 'none',
          cooldownUntil: serverState.cooldownUntil || localState.cooldownUntil,
          staffExtraGrantedCount: Math.max(
            serverState.staffExtraGrantedCount,
            localState.staffExtraGrantedCount
          ),
          staffExtraUsedCount: Math.max(
            serverState.staffExtraUsedCount,
            localState.staffExtraUsedCount
          ),
        });
        setAttemptState(merged);
        saveLocalAttemptState(merged);

        // If local had already consumed an attempt that server didn't know, sync to server
        if (localState.initialAttemptUsed && !serverState.initialAttemptUsed) {
          fetch('/api/challenge/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: merged.deviceToken,
              measuredSeconds: localState.lastMeasuredSeconds ?? 0,
              isWon: Boolean(localState.lastIsWon),
            }),
          }).catch(() => {});
        }
      })
      .catch(() => {
        // Fallback to local state if offline
      });

    return () => {
      isMounted = false;
    };
  }, [deviceToken]);

  // High-precision requestAnimationFrame loop
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTime;
      const tick = (now: number) => {
        setElapsedTime(now - startTimeRef.current);
        rafRef.current = window.requestAnimationFrame(tick);
      };
      rafRef.current = window.requestAnimationFrame(tick);
    } else if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isRunning]);

  const remainingAttempts = getRemainingAttempts(attemptState);
  const canPlay = canStartAttempt(attemptState);

  const handleStart = () => {
    if (!canPlay) return;
    setElapsedTime(0);
    setChallengeResult(null);
    setIsRunning(true);
  };

  const handleStop = () => {
    if (!isRunning) return;
    setIsRunning(false);
    const finalElapsed = performance.now() - startTimeRef.current;
    setElapsedTime(finalElapsed);

    const evaluation = evaluateStopwatchStop(
      finalElapsed,
      challengeConfig.targetSeconds,
      challengeConfig.toleranceSeconds
    );
    setChallengeResult(evaluation);

    const nextState = consumeAttempt(attemptState, evaluation.measuredSeconds, evaluation.isWon);
    setAttemptState(nextState);
    saveLocalAttemptState(nextState);

    fetch('/api/challenge/consume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: nextState.deviceToken,
        measuredSeconds: evaluation.measuredSeconds,
        isWon: evaluation.isWon,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.state) {
          setAttemptState(data.state);
          saveLocalAttemptState(data.state);
        }
      })
      .catch(() => {});
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setChallengeResult(null);
    if (attemptState.initialAttemptUsed && !canStartAttempt(attemptState)) {
      setResetAfterUsedNotice(true);
    }
    setIsRulesOpen(true);
    window.setTimeout(() => {
      prizeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleInstagramExtraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIgFeedback(null);
    const activePlatform = socialPlatform || 'instagram';

    if (!igConfirmShared) {
      setIgFeedback({
        type: 'error',
        message:
          activePlatform === 'tiktok'
            ? 'Confirma que has publicado y etiquetado a @Latentacionburger_ en TikTok antes de solicitar el intento.'
            : 'Confirma que has compartido y etiquetado a @Latentacion.burger en Instagram antes de solicitar el intento.',
      });
      return;
    }

    setIsSubmittingIg(true);
    try {
      const response = await fetch('/api/challenge/instagram-extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: attemptState.deviceToken,
          instagramHandle: igHandleInput,
          platform: activePlatform,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setIgFeedback({
          type: 'error',
          message: data.error || 'No se pudo registrar el intento extra.',
        });
      } else if (data.state) {
        const nextState = refreshChallengeCycle(data.state as ChallengeAttemptState);
        setAttemptState(nextState);
        saveLocalAttemptState(nextState);
        setResetAfterUsedNotice(false);
        const platformLabel = activePlatform === 'tiktok' ? 'TikTok' : 'Instagram';
        if (nextState.instagramExtraGranted || data.verificationStatus === 'approved') {
          setIgFeedback({
            type: 'success',
            message: `Intento extra habilitado tras verificación en ${platformLabel} para ${nextState.instagramHandle} (máximo 1 intento adicional por ciclo de 7 días).`,
          });
        } else {
          setIgFeedback({
            type: 'pending',
            message: `Solicitud registrada en ${platformLabel} para ${nextState.instagramHandle}: pendiente de revisión manual por el restaurante antes de habilitar el intento adicional.`,
          });
        }
      }
    } catch {
      const fallback = requestSocialExtraAttempt(attemptState, igHandleInput, activePlatform, {
        autoVerified: false,
      });
      if (!fallback.ok) {
        setIgFeedback({
          type: 'error',
          message: fallback.error || 'Usuario no válido.',
        });
      } else {
        setAttemptState(fallback.state);
        saveLocalAttemptState(fallback.state);
        setResetAfterUsedNotice(false);
        const platformLabel = activePlatform === 'tiktok' ? 'TikTok' : 'Instagram';
        setIgFeedback({
          type: 'pending',
          message: `Solicitud registrada en ${platformLabel} para ${fallback.state.instagramHandle}: pendiente de revisión manual por el restaurante antes de habilitar el intento adicional.`,
        });
      }
    } finally {
      setIsSubmittingIg(false);
    }
  };

  const handleStaffUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffFeedback(null);
    if (!staffCodeInput.trim()) {
      setStaffFeedback({ type: 'error', message: 'Introduce el código privado del personal.' });
      return;
    }

    setIsSubmittingStaff(true);
    try {
      const response = await fetch('/api/challenge/staff-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: attemptState.deviceToken,
          staffCode: staffCodeInput.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStaffFeedback({
          type: 'error',
          message: data.error || 'Código de autorización de personal no válido.',
        });
      } else if (data.state) {
        const nextState = refreshChallengeCycle(data.state as ChallengeAttemptState);
        setAttemptState(nextState);
        saveLocalAttemptState(nextState);
        setStaffCodeInput('');
        setStaffFeedback({
          type: 'success',
          message: 'Intento adicional autorizado correctamente por el restaurante.',
        });
        setTimeout(() => {
          setIsStaffModalOpen(false);
          setStaffFeedback(null);
        }, 900);
      }
    } catch {
      setStaffFeedback({
        type: 'error',
        message: 'No se pudo conectar con el servidor de verificación.',
      });
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const inCooldown = isCooldownActive(attemptState);
  const cooldownText = inCooldown ? formatCooldownRemaining(getRemainingCooldownMs(attemptState)) : '';
  const isPendingSocialReview =
    attemptState.socialVerificationStatus === 'pending_review' && !attemptState.instagramExtraGranted;

  return (
    <section id="promociones" className="pt-2 pb-10 sm:pt-4 sm:pb-14 bg-transparent relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 relative z-10">
        {/* ========================================================= */}
        {/* 1. PREMIUM 3D METALLIC FRAME & STOPWATCH SIMULATOR        */}
        {/* ========================================================= */}
        <div className="embossed-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center max-w-lg mx-auto w-full">

          {/* Heading inside challenge frame:
              Title: “RETO DEL CRONÓMETRO: ¡PÁRALO EN 10 SEGUNDOS Y GANA!”
              Keep “CRONÓMETRO” white and “GANA!” in the established solid brand red.
          */}
          <div className="mb-5 text-center">
            <h2 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white embossed-text-3d leading-none">
              RETO DEL CRONÓMETRO:
            </h2>
            <p className="font-display text-lg sm:text-2xl font-bold uppercase tracking-wide text-white mt-2 embossed-text-3d">
              ¡PÁRALO EN 10 SEGUNDOS Y <span className="text-red-600 [text-shadow:none]">GANA!</span>
            </p>
          </div>

          {/* Digital display initially showing "00:00" */}
          <div className="font-mono text-5xl sm:text-7xl font-bold tracking-widest bg-black border border-white/10 px-6 py-5 rounded-2xl shadow-[inset_0_2px_14px_rgba(0,0,0,0.98)] tabular-nums mb-3 text-red-600 w-full flex items-center justify-center select-none">
            {formatStopwatchDisplay(elapsedTime)}
          </div>

          {/* Attempt Status & €25 Minimum Local Consumption Condition (visible before playing) */}
          <div className="w-full flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-400 mb-4 px-1">
            <span
              onClick={handleSecretStaffTap}
              className="font-mono select-none"
            >
              Intentos disponibles: <strong className={remainingAttempts > 0 ? 'text-emerald-400' : 'text-red-400'}>{remainingAttempts}</strong>
            </span>
            <span className="text-[11px] text-amber-300/90 font-medium">
              Consumo mínimo de 25 € en el local
            </span>
          </div>

          {/* Evaluated Result Banner */}
          {challengeResult && (
            <div
              className={`w-full p-4 rounded-xl text-xs mb-5 border ${
                challengeResult.isWon
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/50'
                  : 'bg-[#181822] border-white/10 text-zinc-300'
              }`}
            >
              {challengeResult.isWon ? (
                <div>
                  <div className="font-bold text-sm text-emerald-400 mb-1">
                    🎯 ¡ENHORABUENA! Tiempo conseguido: {challengeResult.measuredSeconds.toFixed(2)}s
                  </div>
                  <p className="text-[11px] text-emerald-300/90 leading-tight">
                    ¡Has clavado los 10 segundos! Premio: una hamburguesa gratis. Consumo mínimo de 25 € en el local.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-zinc-200 mb-1">
                    Tiempo registrado: {challengeResult.measuredSeconds.toFixed(2)}s
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Diferencia de {challengeResult.diff.toFixed(2)}s respecto a 10,00s.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Lockout Notice when no attempts remain */}
          {!isRunning && !canPlay && (
            <div
              data-testid="challenge-lockout-notice"
              className="w-full p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 text-[11px] text-zinc-300 mb-4 text-left leading-relaxed"
            >
              {inCooldown ? (
                <>
                  <span className="font-bold text-amber-400 block mb-0.5">
                    Ciclo completado · Próximo intento en {cooldownText}
                  </span>
                  <span>
                    Has utilizado tus 2 oportunidades de esta semana (intento gratuito + intento extra). Transcurridos 7 días se restaurará automáticamente 1 intento gratuito y la solicitud de intento extra.
                  </span>
                </>
              ) : isPendingSocialReview ? (
                <>
                  <span className="font-bold text-amber-400 block mb-0.5">
                    Solicitud pendiente de revisión manual ({attemptState.instagramHandle})
                  </span>
                  <span>
                    Tu solicitud en {attemptState.socialPlatform === 'tiktok' ? 'TikTok' : 'Instagram'} ha quedado registrada. El intento adicional se habilitará tras la verificación manual de la publicación por el restaurante.
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold text-red-400 block mb-0.5">
                    Has agotado tu intento disponible.
                  </span>
                  <span>
                    {resetAfterUsedNotice
                      ? '¿Quieres otro intento? Consíguelo compartiendo en Instagram o en TikTok (ver sección desplegada más abajo).'
                      : 'Pulsa REINICIAR o haz clic en la tarjeta inferior para ver cómo conseguir un intento adicional en Instagram o TikTok.'}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-3 w-full">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                disabled={!canPlay}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 text-white ${
                  canPlay
                    ? 'embossed-btn-red cursor-pointer'
                    : 'bg-zinc-800/80 border border-zinc-700/60 text-zinc-500 cursor-not-allowed opacity-75'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{canPlay ? 'EMPEZAR' : 'INTENTO AGOTADO'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStop}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-lg shadow-amber-950/60 transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>PARAR</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reiniciar pantalla del cronómetro"
              className="embossed-btn-dark px-4 py-3.5 text-zinc-300 hover:text-white rounded-xl cursor-pointer shrink-0 inline-flex items-center gap-1.5 font-bold uppercase text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REINICIAR</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. ENTIRE PRIZE & CHALLENGE RULES CARD IS CLICKABLE       */}
        {/* ========================================================= */}
        <div
          ref={prizeCardRef}
          role="button"
          tabIndex={0}
          aria-expanded={isRulesOpen}
          aria-label="Consigue tu burger gratis - Una hamburguesa gratis ¡Aquí o en el restaurante! Consultar reglas del reto"
          onClick={() => setIsRulesOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsRulesOpen((prev) => !prev);
            }
          }}
          className="embossed-card rounded-2xl p-6 sm:p-7 relative overflow-hidden cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white/25 transition-all"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block">
                  Consigue tu burger gratis
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-white embossed-text-3d leading-tight">
                  UNA HAMBURGUESA GRATIS
                </h3>
                <span className="font-display text-base sm:text-lg font-bold uppercase text-white tracking-wide block">
                  ¡AQUÍ O EN EL RESTAURANTE!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-semibold">
                Consumo mínimo de 25 € en el local
              </div>
              <span
                aria-hidden="true"
                className="w-8 h-8 rounded-lg bg-[#161622] border border-white/15 text-zinc-200 font-mono font-bold text-sm flex items-center justify-center transition-all"
              >
                ?
              </span>
            </div>
          </div>

          {/* Collapsible Rules Dropdown integrated directly inside the clickable Prize Card */}
          {isRulesOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="mt-5 pt-5 border-t border-white/10 space-y-4 cursor-default select-text text-left"
            >
              <div className="space-y-2.5 bg-[#0d0d14] p-4 rounded-xl border border-white/10">
                {challengeConfig.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Un intento inicial gratuito y máximo un intento adicional cada 7 días mediante Instagram o TikTok.</span>
                </div>
              </div>

              {/* Collapsible Instagram/TikTok Extra-Attempt Section */}
              <div className="p-4 rounded-xl bg-[#13131d] border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-red-400 shrink-0" />
                  <strong className="text-xs text-white">
                    Cómo conseguir un intento adicional
                  </strong>
                </div>

                {inCooldown ? (
                  <div
                    data-testid="social-status-cooldown"
                    className="p-3 rounded-lg bg-zinc-900/80 border border-amber-700/40 text-[11px] text-zinc-200 leading-relaxed"
                  >
                    Has agotado el intento gratuito y el intento extra de este ciclo. El sistema se reiniciará automáticamente en <strong>{cooldownText}</strong> (ciclo de 7 días), restaurando 1 intento gratuito y 1 nueva solicitud en redes sociales.
                  </div>
                ) : attemptState.instagramExtraGranted ? (
                  <div
                    data-testid="social-status-approved"
                    className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/15 text-[11px] text-zinc-200"
                  >
                    ✓ Intento extra verificado mediante{' '}
                    {attemptState.socialPlatform === 'tiktok'
                      ? 'TikTok'
                      : 'Instagram'}{' '}
                    para <strong>{attemptState.instagramHandle}</strong>{' '}
                    ({attemptState.instagramExtraUsed ? 'ya utilizado en este ciclo' : 'disponible para jugar'}).
                  </div>
                ) : isPendingSocialReview ? (
                  <div
                    data-testid="social-status-pending"
                    className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/50 text-[11px] text-amber-200 leading-relaxed"
                  >
                    ⏳ <strong>Pendiente de revisión manual:</strong> Solicitud registrada para{' '}
                    <strong>{attemptState.instagramHandle}</strong> en{' '}
                    {attemptState.socialPlatform === 'tiktok' ? 'TikTok' : 'Instagram'}. El intento adicional se activará una vez verificada la publicación (máximo 1 solicitud cada 7 días entre ambas plataformas).
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Collapsed view: ONLY the two clear options */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        aria-expanded={socialPlatform === 'instagram'}
                        onClick={() =>
                          setSocialPlatform((prev) => (prev === 'instagram' ? null : 'instagram'))
                        }
                        className={`px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                          socialPlatform === 'instagram'
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-[#0d0d14] border-white/15 text-zinc-200 hover:text-white'
                        }`}
                      >
                        Comparte en Instagram
                      </button>
                      <button
                        type="button"
                        aria-expanded={socialPlatform === 'tiktok'}
                        onClick={() =>
                          setSocialPlatform((prev) => (prev === 'tiktok' ? null : 'tiktok'))
                        }
                        className={`px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                          socialPlatform === 'tiktok'
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-[#0d0d14] border-white/15 text-zinc-200 hover:text-white'
                        }`}
                      >
                        Comparte en TikTok
                      </button>
                    </div>

                    {/* Expanded content with detailed explanation, official profile links, and request controls */}
                    {socialPlatform && (
                      <form
                        onSubmit={handleInstagramExtraSubmit}
                        className="pt-3 border-t border-white/10 space-y-3"
                      >
                        <div className="text-xs text-zinc-300 leading-relaxed space-y-1.5">
                          <div className="font-bold text-red-400">
                            {socialPlatform === 'tiktok'
                              ? 'Verificación mediante TikTok'
                              : 'Verificación mediante Instagram'}
                          </div>
                          {socialPlatform === 'instagram' ? (
                            <p>
                              Publica contenido sobre La Tentación Burger en Instagram y etiqueta o menciona a{' '}
                              <a
                                href={RESTAURANT_INFO.social.instagram.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 underline font-medium"
                              >
                                {RESTAURANT_INFO.social.instagram.handle}
                              </a>{' '}
                              para activar tu intento adicional (máximo 1 intento extra cada 7 días entre ambas plataformas).
                            </p>
                          ) : (
                            <p>
                              Publica un vídeo sobre La Tentación Burger en TikTok y etiqueta o menciona a{' '}
                              <a
                                href={RESTAURANT_INFO.social.tiktok.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 underline font-medium"
                              >
                                {RESTAURANT_INFO.social.tiktok.handle}
                              </a>{' '}
                              para activar tu intento adicional (máximo 1 intento extra cada 7 días entre ambas plataformas).
                            </p>
                          )}
                          <p className="text-[11px] text-zinc-400">
                            Tras publicar y etiquetar la cuenta oficial, introduce tu @usuario o el enlace a tu perfil/publicación para su verificación.
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={
                              socialPlatform === 'tiktok'
                                ? RESTAURANT_INFO.social.tiktok.url
                                : RESTAURANT_INFO.social.instagram.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="embossed-btn-dark px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-zinc-200 hover:text-white inline-flex items-center gap-1.5"
                          >
                            <span>
                              {socialPlatform === 'tiktok'
                                ? 'Abrir TikTok oficial'
                                : 'Abrir Instagram oficial'}
                            </span>
                            <ExternalLink className="w-3 h-3 text-red-400" />
                          </a>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={igHandleInput}
                            onChange={(e) => setIgHandleInput(e.target.value)}
                            placeholder={
                              socialPlatform === 'tiktok'
                                ? 'Tu @usuario o URL de TikTok'
                                : 'Tu @usuario o URL de Instagram'
                            }
                            aria-label="Tu usuario de red social"
                            className="flex-1 px-3 py-2 bg-[#0d0d14] border border-white/15 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                          />
                          <button
                            type="submit"
                            disabled={isSubmittingIg}
                            className="embossed-btn-red px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white cursor-pointer shrink-0"
                          >
                            {isSubmittingIg ? 'Verificando...' : 'Solicitar intento extra'}
                          </button>
                        </div>

                        <label className="flex items-start gap-2 text-[11px] text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={igConfirmShared}
                            onChange={(e) => setIgConfirmShared(e.target.checked)}
                            className="mt-0.5 rounded border-zinc-600 text-red-600 focus:ring-red-600"
                          />
                          <span>
                            {socialPlatform === 'tiktok'
                              ? `Confirmo que he publicado contenido en TikTok mencionando a ${RESTAURANT_INFO.social.tiktok.handle} para su verificación.`
                              : `Confirmo que he compartido contenido en Instagram etiquetando a ${RESTAURANT_INFO.social.instagram.handle} para su verificación.`}
                          </span>
                        </label>
                      </form>
                    )}
                  </div>
                )}

                {igFeedback && (
                  <div
                    className={`p-2.5 rounded-lg text-[11px] ${
                      igFeedback.type === 'error'
                        ? 'bg-red-950/40 border border-red-700/50 text-red-300'
                        : igFeedback.type === 'pending'
                          ? 'bg-amber-950/40 border border-amber-700/50 text-amber-200'
                          : 'bg-emerald-950/40 border border-emerald-700/50 text-emerald-300'
                    }`}
                  >
                    {igFeedback.message}
                  </div>
                )}
              </div>

              {/* Technical limitation disclosure on attempt control */}
              <div className="text-[11px] text-zinc-400 flex items-start gap-2 leading-relaxed pt-2 border-t border-white/5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Control de intentos y ciclo de 7 días:</strong> Se permite 1 intento inicial gratuito y un máximo de 1 intento adicional cada 7 días entre Instagram y TikTok combinadas. Sin verificación automática de API oficial sobre publicaciones de terceros, las solicitudes quedan en estado pendiente de revisión manual por el restaurante antes de conceder el intento extra. Una vez consumidos ambos intentos, el ciclo se renueva automáticamente a los 7 días.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Private Staff Authorization Modal (Requires server-validated secret staff code) */}
      {isStaffModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="staff-auth-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="embossed-card w-full max-w-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-red-500" />
                <h3 id="staff-auth-title" className="font-display text-lg font-bold uppercase text-white">
                  Autorización de Personal en Sala
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                aria-label="Cerrar autorización de personal"
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Uso exclusivo para el personal de La Tentación Burger. Introduce la clave privada para aprobar la verificación de la publicación o habilitar un intento adicional en este dispositivo.
            </p>

            <form onSubmit={handleStaffUnlockSubmit} className="space-y-3">
              <div>
                <label htmlFor="staff-secret-code" className="block text-[11px] font-bold uppercase text-zinc-300 mb-1">
                  Clave de autorización
                </label>
                <input
                  id="staff-secret-code"
                  type="password"
                  value={staffCodeInput}
                  onChange={(e) => setStaffCodeInput(e.target.value)}
                  placeholder="Clave del personal..."
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 bg-[#0b0b10] border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {staffFeedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs ${
                    staffFeedback.type === 'error'
                      ? 'bg-red-950/50 border border-red-700/60 text-red-300'
                      : 'bg-emerald-950/50 border border-emerald-700/60 text-emerald-300'
                  }`}
                >
                  {staffFeedback.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="embossed-btn-dark px-4 py-2 rounded-lg text-xs font-bold uppercase text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStaff}
                  className="embossed-btn-red px-4 py-2 rounded-lg text-xs font-bold uppercase text-white cursor-pointer"
                >
                  {isSubmittingStaff ? 'Verificando...' : 'Habilitar intento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
