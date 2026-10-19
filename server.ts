import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  type ChallengeAttemptState,
  createInitialAttemptState,
  refreshChallengeCycle,
  isCooldownActive,
  consumeAttempt,
  validateSocialSubmission,
  requestSocialExtraAttempt,
  grantStaffExtraAttempt,
} from './src/utils/stopwatchChallenge';

dotenv.config();

const PORT = 3000;
const STORE_PATH = path.resolve(process.cwd(), '.challenge-attempts.json');
const STAFF_CODE = process.env.STAFF_CHALLENGE_CODE || 'TENTACION-LOCAL-2026';
const inFlightSocialRequests = new Set<string>();

interface StoredRecords {
  byToken: Record<string, ChallengeAttemptState>;
  byFingerprint: Record<string, string>; // maps IP+UA fingerprint -> deviceToken
}

function loadStore(): StoredRecords {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.byToken && parsed.byFingerprint) {
        return parsed as StoredRecords;
      }
    }
  } catch (err) {
    console.warn('Could not read challenge store:', err);
  }
  return { byToken: {}, byFingerprint: {} };
}

function saveStore(store: StoredRecords): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save challenge store:', err);
  }
}

function getClientFingerprint(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown-ip';
  const ua = req.headers['user-agent'] || 'unknown-ua';
  return crypto.createHash('sha256').update(`${ip}::${ua}`).digest('hex').slice(0, 32);
}

function resolveAttemptState(req: express.Request, clientToken?: string): {
  store: StoredRecords;
  token: string;
  fingerprint: string;
  state: ChallengeAttemptState;
} {
  const store = loadStore();
  const fingerprint = getClientFingerprint(req);
  const existingTokenByFp = store.byFingerprint[fingerprint];

  // Prefer known server record for either the supplied token or the device fingerprint
  let resolvedToken = clientToken && store.byToken[clientToken] ? clientToken : existingTokenByFp || clientToken;
  if (!resolvedToken) {
    resolvedToken = crypto.randomUUID();
  }

  let state = store.byToken[resolvedToken];
  // If fingerprint already consumed an attempt under another token, merge stricter state
  if (existingTokenByFp && store.byToken[existingTokenByFp] && existingTokenByFp !== resolvedToken) {
    const fpState = refreshChallengeCycle(store.byToken[existingTokenByFp]);
    if (!state) {
      state = { ...fpState, deviceToken: resolvedToken };
    } else {
      state = refreshChallengeCycle(state);
      state = {
        ...state,
        initialAttemptUsed: state.initialAttemptUsed || fpState.initialAttemptUsed,
        instagramExtraGranted: state.instagramExtraGranted || fpState.instagramExtraGranted,
        instagramExtraUsed: state.instagramExtraUsed || fpState.instagramExtraUsed,
        instagramHandle: state.instagramHandle || fpState.instagramHandle,
        socialPlatform: state.socialPlatform || fpState.socialPlatform,
        socialPostUrl: state.socialPostUrl || fpState.socialPostUrl,
        socialVerificationStatus:
          state.socialVerificationStatus === 'approved' || fpState.socialVerificationStatus === 'approved'
            ? 'approved'
            : state.socialVerificationStatus === 'pending_review' || fpState.socialVerificationStatus === 'pending_review'
              ? 'pending_review'
              : 'none',
        cooldownUntil: state.cooldownUntil || fpState.cooldownUntil,
        staffExtraGrantedCount: Math.max(state.staffExtraGrantedCount, fpState.staffExtraGrantedCount),
        staffExtraUsedCount: Math.max(state.staffExtraUsedCount, fpState.staffExtraUsedCount),
      };
    }
  }

  if (!state) {
    state = createInitialAttemptState(resolvedToken);
  } else {
    state = refreshChallengeCycle(state);
  }

  store.byToken[resolvedToken] = state;
  store.byFingerprint[fingerprint] = resolvedToken;
  saveStore(store);

  return { store, token: resolvedToken, fingerprint, state };
}

/**
 * Checks account existence and public post mention where technically possible.
 * Never fabricates verification: only returns `autoVerified: true` if an official API
 * or publicly readable post metadata explicitly confirms the post and restaurant tag.
 */
async function checkSocialAccountAndPost(
  profileUrl: string,
  postUrl: string | undefined,
  platform: 'instagram' | 'tiktok'
): Promise<{ accountNotFound: boolean; autoVerified: boolean }> {
  const targetMention = platform === 'tiktok' ? 'latentacionburger_' : 'latentacion.burger';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const urlToCheck = postUrl || profileUrl;
    const res = await fetch(urlToCheck, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LaTentacionBurgerVerifier/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (res.status === 404) {
      return { accountNotFound: true, autoVerified: false };
    }

    // Only if a specific post URL was provided and publicly exposes metadata with the tag
    if (postUrl && res.ok) {
      const html = (await res.text()).slice(0, 120_000).toLowerCase();
      const hasOfficialApiToken = Boolean(
        platform === 'instagram'
          ? process.env.INSTAGRAM_GRAPH_API_TOKEN
          : process.env.TIKTOK_RESEARCH_API_TOKEN
      );
      if (hasOfficialApiToken && html.includes(targetMention)) {
        return { accountNotFound: false, autoVerified: true };
      }
    }
    return { accountNotFound: false, autoVerified: false };
  } catch {
    // Network/platform block: fall back to pending manual restaurant review
    return { accountNotFound: false, autoVerified: false };
  } finally {
    clearTimeout(timeout);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Get current attempt state for device
  app.get('/api/challenge/state', (req, res) => {
    const clientToken = typeof req.query.token === 'string' ? req.query.token : undefined;
    const { state } = resolveAttemptState(req, clientToken);
    res.json({ state });
  });

  // 2. Consume an attempt when stopwatch stops
  app.post('/api/challenge/consume', (req, res) => {
    const { token, measuredSeconds, isWon } = req.body || {};
    const { store, token: resolvedToken, fingerprint, state } = resolveAttemptState(req, token);
    const updated = consumeAttempt(
      state,
      typeof measuredSeconds === 'number' ? measuredSeconds : 0,
      Boolean(isWon)
    );
    store.byToken[resolvedToken] = updated;
    store.byFingerprint[fingerprint] = resolvedToken;
    saveStore(store);
    res.json({ state: updated });
  });

  // 3. Register Instagram/TikTok verification request (max 1 extra attempt per 7-day cycle across both platforms)
  app.post('/api/challenge/instagram-extra', async (req, res) => {
    const { token, instagramHandle, postUrl, platform } = req.body || {};
    const { store, token: resolvedToken, fingerprint, state } = resolveAttemptState(req, token);
    const lockKey = `${resolvedToken}::${fingerprint}`;

    if (inFlightSocialRequests.has(lockKey)) {
      res.status(429).json({
        error: 'Ya hay una solicitud de verificación en curso. Espera unos segundos.',
        state,
      });
      return;
    }

    inFlightSocialRequests.add(lockKey);
    try {
      const validPlatform = platform === 'tiktok' ? 'tiktok' : 'instagram';
      const rawInput = typeof instagramHandle === 'string' ? instagramHandle : '';
      const rawPostUrl = typeof postUrl === 'string' ? postUrl : undefined;

      const validation = validateSocialSubmission(rawInput, validPlatform, rawPostUrl);
      if (!validation.ok) {
        res.status(400).json({ error: validation.error, state });
        return;
      }

      const normalizedHandle = validation.data.handle.toLowerCase();
      const handleAlreadyUsed = Object.values(store.byToken).some((rec) => {
        if (rec.deviceToken === resolvedToken) return false;
        const refreshedRec = refreshChallengeCycle(rec);
        const recActive =
          refreshedRec.instagramExtraGranted ||
          refreshedRec.socialVerificationStatus === 'pending_review' ||
          refreshedRec.socialVerificationStatus === 'approved' ||
          isCooldownActive(refreshedRec);
        return recActive && refreshedRec.instagramHandle?.toLowerCase() === normalizedHandle;
      });

      if (handleAlreadyUsed) {
        res.status(400).json({
          error: 'Esta cuenta ya ha sido utilizada para solicitar el intento extra en el ciclo actual.',
          state,
        });
        return;
      }

      const probe = await checkSocialAccountAndPost(
        validation.data.profileUrl,
        validation.data.postUrl,
        validPlatform
      );

      if (probe.accountNotFound) {
        res.status(400).json({
          error: 'No se ha podido encontrar la cuenta o publicación pública indicada (404). Verifica tu @usuario o enlace.',
          state,
        });
        return;
      }

      const result = requestSocialExtraAttempt(state, rawInput, validPlatform, {
        postUrl: rawPostUrl,
        autoVerified: probe.autoVerified,
      });

      if (!result.ok) {
        res.status(400).json({ error: result.error, state: result.state });
        return;
      }

      store.byToken[resolvedToken] = result.state;
      store.byFingerprint[fingerprint] = resolvedToken;
      saveStore(store);
      res.json({
        state: result.state,
        verificationStatus: result.status,
      });
    } finally {
      inFlightSocialRequests.delete(lockKey);
    }
  });

  // 4. Staff-authorized approval of pending social review or in-store extra attempt
  app.post('/api/challenge/staff-unlock', (req, res) => {
    const { token, staffCode } = req.body || {};
    if (typeof staffCode !== 'string' || staffCode.trim() !== STAFF_CODE) {
      res.status(403).json({
        error: 'Código de autorización de personal no válido.',
      });
      return;
    }
    const { store, token: resolvedToken, fingerprint, state } = resolveAttemptState(req, token);
    const updated = grantStaffExtraAttempt(state);
    store.byToken[resolvedToken] = updated;
    store.byFingerprint[fingerprint] = resolvedToken;
    saveStore(store);
    res.json({ state: updated });
  });

  // 5. Check and serve original homepage video from public/hero-burger.mp4 or any uploaded video in public/, src/ or root
  const publicVideoPath = path.resolve(process.cwd(), 'public', 'hero-burger.mp4');
  const publicVideosDirPath = path.resolve(process.cwd(), 'public', 'videos', 'hero-burger.mp4');

  function findUploadedVideoPath(): string | null {
    const candidates = [publicVideoPath, publicVideosDirPath];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).size > 1024) {
        return candidate;
      }
    }
    const searchDirs = [
      path.resolve(process.cwd(), 'public'),
      path.resolve(process.cwd(), 'public', 'videos'),
      path.resolve(process.cwd(), 'src'),
      path.resolve(process.cwd(), 'src', 'assets'),
      process.cwd(),
    ];
    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;
      for (const entry of fs.readdirSync(dir)) {
        if (/\.(mp4|webm|mov)$/i.test(entry)) {
          const fullPath = path.join(dir, entry);
          try {
            if (fs.statSync(fullPath).isFile() && fs.statSync(fullPath).size > 1024) {
              return fullPath;
            }
          } catch {
            // ignore
          }
        }
      }
    }
    return null;
  }

  function streamVideoFile(req: express.Request, res: express.Response, filePath: string): void {
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      res.status(404).end();
      return;
    }

    const fileSize = stat.size;
    const ext = path.extname(filePath).toLowerCase();
    const mimeType =
      ext === '.webm' ? 'video/webm' : ext === '.mov' ? 'video/quicktime' : 'video/mp4';
    // Strong ETag (RFC 9110 requires strong ETag for If-Range byte-range stitching)
    const strongEtag = `"${fileSize}-${Math.floor(stat.mtimeMs)}"`;
    const lastModified = stat.mtime.toUTCString();

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('ETag', strongEtag);
    res.setHeader('Last-Modified', lastModified);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
      if (!match) {
        res.status(416);
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        res.end();
        return;
      }

      const startStr = match[1];
      const endStr = match[2];
      let start = startStr ? parseInt(startStr, 10) : 0;
      let end = endStr ? parseInt(endStr, 10) : fileSize - 1;

      if (!startStr && endStr) {
        // Suffix byte-range-spec (e.g. bytes=-500)
        const suffixLength = parseInt(endStr, 10);
        start = Math.max(0, fileSize - suffixLength);
        end = fileSize - 1;
      }

      if (isNaN(start) || isNaN(end) || start < 0 || start >= fileSize || start > end) {
        res.status(416);
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        res.end();
        return;
      }

      end = Math.min(end, fileSize - 1);
      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', String(chunkSize));

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const stream = fs.createReadStream(filePath, { start, end });
      req.on('close', () => stream.destroy());
      stream.on('error', () => {
        if (!res.headersSent) res.status(500).end();
        else res.destroy();
      });
      stream.pipe(res);
      return;
    }

    res.status(200);
    res.setHeader('Content-Length', String(fileSize));
    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    req.on('close', () => stream.destroy());
    stream.on('error', () => {
      if (!res.headersSent) res.status(500).end();
      else res.destroy();
    });
    stream.pipe(res);
  }

  app.get(['/hero-burger.mp4', '/videos/hero-burger.mp4'], (req, res) => {
    const found = findUploadedVideoPath();
    if (found) {
      streamVideoFile(req, res, found);
      return;
    }
    res.status(404).end();
  });

  app.get('/api/hero-video/status', (_req, res) => {
    const found = findUploadedVideoPath();
    res.json({ exists: found !== null, path: found ? path.relative(process.cwd(), found) : null });
  });

  app.post(
    '/api/hero-video',
    express.raw({ type: ['video/*', 'application/octet-stream'], limit: '100mb' }),
    (req, res) => {
      try {
        const buf = req.body as Buffer;
        if (!Buffer.isBuffer(buf) || buf.length < 1024) {
          res.status(400).json({ error: 'Archivo de vídeo no válido o vacío.' });
          return;
        }
        fs.mkdirSync(path.dirname(publicVideoPath), { recursive: true });
        fs.mkdirSync(path.dirname(publicVideosDirPath), { recursive: true });
        fs.writeFileSync(publicVideoPath, buf);
        fs.writeFileSync(publicVideosDirPath, buf);

        const distVideoPath = path.resolve(process.cwd(), 'dist', 'hero-burger.mp4');
        if (fs.existsSync(path.dirname(distVideoPath))) {
          fs.writeFileSync(distVideoPath, buf);
        }

        res.json({ ok: true, size: buf.length, url: `/hero-burger.mp4?v=${Date.now()}` });
      } catch (err) {
        console.error('Error saving hero video:', err);
        res.status(500).json({ error: 'No se pudo guardar el archivo de vídeo en public/.' });
      }
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
