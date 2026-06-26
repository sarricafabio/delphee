import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger.js";
import { Api } from "./api.js";
import { DEMO_MATRICOLA, DemoApi } from "./demo.js";
import type { SessionRegistry } from "./sessions.js";
import type { Session } from "../client/session.js";
import type { CacheStore } from "../cache/store.js";
import type { AppConfig } from "../config.js";

// Request timing + a final error net. Kept tiny on purpose: structured logging
// lives in pino, and route handlers own their own status codes.

// Resolve the Bearer token to a live session and attach a per-request Api to
// res.locals. The wrapper trusts LINFO (network-gated by Caddy); this token only
// identifies WHICH user's Delphi session a request maps to.
export function requireSession(
  registry: SessionRegistry,
  store: CacheStore,
  config: AppConfig,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const session = registry.get(bearerToken(req) ?? "");
    if (!session) {
      res.status(401).json({ error: "no_session" });
      return;
    }
    res.locals.session = session;
    // The demo user gets the canned-data Api; everyone else hits Delphi.
    res.locals.api = session.info().matricola === DEMO_MATRICOLA
      ? new DemoApi({ session, store, config })
      : new Api({ session, store, config });
    next();
  };
}

export function sessionOf(res: Response): Session {
  return res.locals.session as Session;
}

export function apiOf(res: Response): Api {
  return res.locals.api as Api;
}

// Bearer header for SPA fetches; the `dw_token` cookie for top-level browser
// navigations (new-tab links / the `/totem/*` reverse-proxy can't set an
// Authorization header). Login sets the cookie; both name the same registry
// token.
function bearerToken(req: Request): string | null {
  const m = /^Bearer (.+)$/.exec(req.header("authorization") ?? "");
  if (m) return m[1]!.trim();
  const cm = /(?:^|;\s*)dw_token=([^;]+)/.exec(req.header("cookie") ?? "");
  return cm ? decodeURIComponent(cm[1]!.trim()) : null;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info(
      { method: req.method, path: req.path, status: res.statusCode, ms: Math.round(ms) },
      "request",
    );
  });
  next();
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err }, "unhandled error");
  if (!res.headersSent) {
    res.status(500).json({ error: "internal_error" });
  }
}
