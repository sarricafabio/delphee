import type { Session } from "../client/session.js";
import { looksLikeLoginPage } from "../client/session.js";
import type { ProxyResponse, FetcherBinaryResponse, RequestInitLike } from "../client/fetcher.js";
import type { CacheStore } from "../cache/store.js";
import type { AppConfig } from "../config.js";
import { CachePolicy } from "../cache/policies.js";
import { NonRetryableError } from "../utils/retry.js";
import { logger } from "../logger.js";

import * as anagraficaParser from "../client/endpoints/anagrafica.js";
import * as carrieraParser from "../client/endpoints/carriera.js";
import * as bollettiniParser from "../client/endpoints/bollettini.js";
import * as serviziParser from "../client/endpoints/servizi.js";
import * as certificatiParser from "../client/endpoints/certificati.js";
import * as pianoParser from "../client/endpoints/piano.js";
import * as appelliParser from "../client/endpoints/appelli.js";
import * as verbaliParser from "../client/endpoints/verbali.js";
import * as esamiPendentiParser from "../client/endpoints/esami-pendenti.js";
import { filterEsami, summarizeEsami } from "../client/endpoints/esami-search.js";

import type {
  Anagrafica,
  CarrieraResponse,
  EsamiFilter,
  EsamiResponse,
  Piano,
  SituazioneTasse,
  ServiziResponse,
  CertificatiResponse,
  Appello,
  RicevutaRef,
  VerbaliResponse,
  EsamiPendentiResponse,
} from "../types.js";

// Paths. Most data lives under /Iscrizioni; certificati and piano under
// /studenti. Piano resolves to GOMP (out of scope) for our accounts, so it
// degrades to an empty piano + a composerUrl the SPA opens in the portal.
const PATH_DASHBOARD = "/totem/jsp/Iscrizioni/sStudentiLaureatiLogin.jsp?language=IT";
const PATH_ANAGRAFICA = "/totem/jsp/Iscrizioni/datiStudente.jsp";
const PATH_CARRIERA = "/totem/jsp/Iscrizioni/esamiVerbalizzati.jsp";
const PATH_TASSE = "/totem/jsp/Iscrizioni/situazioneRateNew.jsp";
const PATH_SERVIZI = "/totem/jsp/Iscrizioni/sStudentiAttivaServizi.jsp";
const PATH_CERTIFICATI = "/totem/jsp/studenti/stampaCertificati/preIndexCertificati.jsp";
const PATH_CERTIFICATI_BASE = "/totem/jsp/studenti/stampaCertificati";
const PATH_PIANO = "/totem/jsp/studenti/pianoDiStudi/index.jsp";
const PATH_VERBALI = "/totem/jsp/studenti/esami/verbaliNonChiusi.jsp";
const PATH_ESAMI_PENDENTI = "/totem/jsp/studenti/esami/esamiPendenti.jsp";

export interface ApiDeps {
  session: Session;
  store: CacheStore;
  config: AppConfig;
}

type CacheOutcome<T> = { kind: "ok" | "stale"; data: T };

export class Api {
  constructor(private readonly deps: ApiDeps) {}

  // Cache keys MUST be namespaced by account, or a second user serves the first
  // user's cached data (carriera/esami are cached forever). The Api is only
  // built for an authenticated session, so the matricola is always present.
  private key(base: string): string {
    const m = this.deps.session.info().matricola;
    if (!m) throw new Error("api used without an authenticated session");
    return `${m}:${base}`;
  }

  static isInvalidCredentials(err: unknown): boolean {
    return err instanceof NonRetryableError && err.message === "invalid_credentials";
  }

  // Cache → loader → stale-fallback. The stale flag becomes X-Cache-Stale.
  private async withCache<T>(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>,
  ): Promise<CacheOutcome<T>> {
    const hit = this.deps.store.get(key);
    if (hit) {
      try {
        return { kind: "ok", data: JSON.parse(hit) as T };
      } catch {
        this.deps.store.delete(key);
      }
    }
    try {
      const data = await loader();
      this.deps.store.set(key, JSON.stringify(data), ttlMs);
      return { kind: "ok", data };
    } catch (err) {
      if (Api.isInvalidCredentials(err)) throw err;
      const stale = this.deps.store.getStale(key);
      if (stale) {
        // Log the field only, never the full key — its `<matricola>:` prefix is
        // PII and pino's redaction (matricola path) does not cover the `key`
        // field name.
        logger.warn({ err, field: key.slice(key.indexOf(":") + 1) }, "live fetch failed; serving stale cache");
        return { kind: "stale", data: JSON.parse(stale) as T };
      }
      throw err;
    }
  }

  // All HTML data pages flow through here. The login-page check runs INSIDE
  // session.request's callback so that a silently-dead Delphi session (which
  // answers with the login form instead of a 401) is seen as an auth failure
  // and triggers the session's re-login-and-retry path, rather than being
  // parsed as "empty" and surfaced as a spurious delphi_unavailable.
  private fetchBody(path: string): Promise<string> {
    return this.deps.session.request(async (f) => {
      const res = await f.get(path);
      if (looksLikeLoginPage(res.body)) {
        throw new NonRetryableError("session_lost");
      }
      return res.body;
    });
  }

  // Binary sibling of fetchBody, for the PDF endpoints. Delphi answers a dropped
  // session with the HTML login form even when a PDF was requested, so a
  // text/html body on a binary endpoint means we were bounced — surface it as a
  // lost session (re-login + retry) instead of streaming a login page to the
  // browser as a corrupt download. application/pdf responses skip the decode.
  private fetchBinaryAuthed(
    path: string,
    init?: RequestInitLike,
  ): Promise<FetcherBinaryResponse> {
    return this.deps.session.request(async (f) => {
      const res = await f.fetchBinary(path, init);
      if (/text\/html/i.test(res.contentType) && looksLikeLoginPage(res.body.toString("latin1"))) {
        throw new NonRetryableError("session_lost");
      }
      return res;
    });
  }

  // The student photo sits behind the Delphi session, so the browser can't load
  // it directly. Fetch it server-side and inline it as a data URI (cached with
  // the rest of anagrafica). Returns null on failure rather than breaking the
  // whole response.
  private async embedFoto(url: string): Promise<string | null> {
    try {
      const res = await this.deps.session.request((f) => f.fetchBinary(url));
      if (!res.body.length) return null;
      return `data:${res.contentType || "image/jpeg"};base64,${res.body.toString("base64")}`;
    } catch {
      return null;
    }
  }

  async getAnagrafica(): Promise<{ response: Anagrafica; stale: boolean }> {
    const { kind, data } = await this.withCache<Anagrafica>(
      this.key("anagrafica"),
      CachePolicy.anagrafica,
      async () => {
        const [datiHtml, dashHtml] = [
          await this.fetchBody(PATH_ANAGRAFICA),
          await this.fetchBody(PATH_DASHBOARD),
        ];
        const base = anagraficaParser.parse(datiHtml, this.deps.config.baseUrl);
        const extra = anagraficaParser.parseDashboardCarriera(dashHtml);
        if (!base.cognome && !base.matricola) {
          throw new NonRetryableError("empty anagrafica");
        }
        const fotoUrl = base.fotoUrl ? await this.embedFoto(base.fotoUrl) : null;
        return { ...base, fotoUrl, statoCarriera: extra.statoCarriera, laurea: extra.laurea };
      },
    );
    return { response: data, stale: kind === "stale" };
  }

  async getCarriera(): Promise<{ response: CarrieraResponse; stale: boolean }> {
    const { kind, data } = await this.withCache<CarrieraResponse>(
      this.key("carriera"),
      CachePolicy.carriera,
      async () => {
        const html = await this.fetchBody(PATH_CARRIERA);
        const parsed = carrieraParser.parse(html);
        if (parsed.esami.length === 0 && !parsed.header.matricola) {
          throw new NonRetryableError("empty carriera");
        }
        return parsed;
      },
    );
    return { response: data, stale: kind === "stale" };
  }

  async getEsami(filter: EsamiFilter): Promise<{ response: EsamiResponse; stale: boolean }> {
    const { response, stale } = await this.getCarriera();
    const esami = filterEsami(response.esami, filter);
    return { response: { esami, summary: summarizeEsami(esami) }, stale };
  }

  async getBollettini(): Promise<{ response: SituazioneTasse; stale: boolean }> {
    const { kind, data } = await this.withCache<SituazioneTasse>(
      this.key("bollettini"),
      CachePolicy.bollettini,
      async () => {
        const html = await this.fetchBody(PATH_TASSE);
        const parsed = bollettiniParser.parse(html);
        if (!parsed.studente.matricola && parsed.anni.length === 0) {
          throw new NonRetryableError("empty bollettini");
        }
        return parsed;
      },
    );
    return { response: data, stale: kind === "stale" };
  }

  // Servizi Forniti: activation links (Office365, MatLab, Mathematica, …)
  // plus the descriptive text. The list itself is cheap to fetch; the
  // per-service activation page may carry a code that the user wants to
  // copy, so the api follows each Entra= link server-side and pulls the
  // code from the response. MatLab-style services whose `?message=` URL
  // already encodes the code skip the extra fetch.
  async getServizi(): Promise<{ response: ServiziResponse; stale: boolean }> {
    const { kind, data } = await this.withCache<ServiziResponse>(
      this.key("servizi"),
      CachePolicy.servizi,
      async () => {
        const html = await this.fetchBody(PATH_SERVIZI);
        const parsed = serviziParser.parse(html, this.deps.config.baseUrl);
        if (parsed.servizi.length === 0) throw new NonRetryableError("empty servizi");
        // Resolve copyable codes for each service that doesn't already carry one
        // in its URL by following its activation link server-side. Two non-obvious
        // constraints, both learned from live capture:
        //   1. Delphi's `?Entra=` flow is STATEFUL — the inner page 500s unless
        //      the servizi list was the immediately-preceding request in this
        //      session. So we re-fetch the list before each service (it's the
        //      reason "most codes didn't resolve": only the first service used to
        //      land on a fresh list; the rest 500'd silently).
        //   2. A service's inner page may itself be a sub-list of codes (National
        //      Instruments → LabVIEW + Multisim), so we extract an array.
        // Per-service logging makes a miss visible instead of silently dropped.
        const enriched = [];
        for (const s of parsed.servizi) {
          if (!s.path || s.codes.length) { enriched.push(s); continue; }
          try {
            await this.fetchBody(PATH_SERVIZI); // re-establish the list context
            const res = await this.deps.session.request((f) => f.fetchBinary(s.path!));
            const html = res.body.toString("latin1");
            const codes = serviziParser.extractCodes(html);
            // No static code? The page may still offer a "Genera codice" action
            // (MyCampusXApp) — surface it so the SPA can trigger it on demand.
            const azione = codes.length ? null : serviziParser.extractAzione(html, this.deps.config.baseUrl);
            if (!codes.length && !azione) logger.info({ servizio: s.nome, path: s.path }, "servizi: no code on activation page");
            enriched.push({ ...s, codes, azione });
          } catch (err) {
            logger.warn({ err, servizio: s.nome, path: s.path }, "servizi: code fetch failed");
            enriched.push(s);
          }
        }
        return { servizi: enriched };
      },
    );
    return { response: data, stale: kind === "stale" };
  }

  async getCertificati(): Promise<{ response: CertificatiResponse; stale: boolean }> {
    const { kind, data } = await this.withCache<CertificatiResponse>(
      this.key("certificati"),
      CachePolicy.certificati,
      async () => {
        const html = await this.fetchBody(PATH_CERTIFICATI);
        const parsed = certificatiParser.parse(html);
        if (parsed.certificati.length === 0 && !parsed.studente.matricola) {
          throw new NonRetryableError("empty certificati");
        }
        return parsed;
      },
    );
    return { response: data, stale: kind === "stale" };
  }

  // Piano resolves to GOMP for our accounts; return an empty piano plus the
  // portal URL rather than erroring (graduates legitimately have none).
  async getPiano(): Promise<{ response: Piano; stale: boolean }> {
    const composerUrl = new URL(PATH_PIANO, this.deps.config.baseUrl).toString();
    try {
      const html = await this.fetchBody(PATH_PIANO);
      const parsed = pianoParser.parse(html, composerUrl);
      return { response: parsed, stale: false };
    } catch (err) {
      if (Api.isInvalidCredentials(err)) throw err;
      logger.info({ err }, "piano unavailable (GOMP/closed); returning empty");
      return {
        response: { cdl: null, annoCorso: null, esami: [], composerUrl },
        stale: false,
      };
    }
  }

  // Appelli: the legacy single-insegnamento page; returns [] when Delphi has no
  // such listing for the account (the modern flow is the calendar search).
  async getAppelli(insegnamento: string): Promise<{ response: Appello[]; stale: boolean }> {
    const { kind, data } = await this.withCache<Appello[]>(
      this.key(`appelli:${insegnamento}`),
      CachePolicy.appelli,
      async () => {
        const path = `/totem/jsp/prenotazioni/preVisualizzaPrenotabili.jsp?insegnamento=${encodeURIComponent(insegnamento)}`;
        try {
          const res = await this.deps.session.request((f) => f.get(path));
          return appelliParser.parse(res.body);
        } catch {
          return [];
        }
      },
    );
    return { response: data, stale: kind === "stale" };
  }

  // Ricevuta PDF: POST the bollettino ids back to the tasse page; stream binary.
  async getRicevuta(ref: RicevutaRef): Promise<{ body: Buffer; contentType: string }> {
    const res = await this.fetchBinaryAuthed(PATH_TASSE, {
      method: "POST",
      body: new URLSearchParams({
        ricevutaBollettino: "Ricevuta",
        bollettinoId: ref.bollettinoId ?? "",
        rataId: ref.rataId ?? "",
        AA: ref.aa ?? "",
      }).toString(),
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    return { body: res.body, contentType: res.contentType || "application/pdf" };
  }

  // Verbali non chiusi: open grade records. The list is usually short (0–few
  // per AA) and changes only when a prof closes a verbale, so a 5-min TTL is
  // generous. Returns the empty list for graduated students (the path 404s).
  async getVerbali(): Promise<{ response: VerbaliResponse; stale: boolean }> {
    const { kind, data } = await this.withCache<VerbaliResponse>(
      this.key("verbali"),
      CachePolicy.verbali,
      async () => {
        const html = await this.fetchBody(PATH_VERBALI);
        const parsed = verbaliParser.parse(html);
        if (!parsed.header.matricola) throw new NonRetryableError("empty verbali");
        return parsed;
      },
    );
    return { response: data, stale: kind === "stale" };
  }

  // Esami in corso di verbalizzazione: in-flight exams the prof hasn't yet
  // chiuso. Same TTL rationale as verbali. Empty for graduated students.
  async getEsamiPendenti(): Promise<{ response: EsamiPendentiResponse; stale: boolean }> {
    const { kind, data } = await this.withCache<EsamiPendentiResponse>(
      this.key("esami-pendenti"),
      CachePolicy.esamiPendenti,
      async () => {
        const html = await this.fetchBody(PATH_ESAMI_PENDENTI);
        const parsed = esamiPendentiParser.parse(html);
        if (!parsed.header.matricola) throw new NonRetryableError("empty esami pendenti");
        return parsed;
      },
    );
    return { response: data, stale: kind === "stale" };
  }

  // Certificato PDF: GET the stampaCertificati/certificatoXxx.jsp endpoint with
  // its query params. Delphi returns a PDF inline. No caching (the binary is
  // one-shot and the user re-prints the same day if needed).
  async getCertificato(path: string, params: Record<string, string>): Promise<{ body: Buffer; contentType: string; filename: string }> {
    const qs = new URLSearchParams(params).toString();
    const target = `${PATH_CERTIFICATI_BASE}/${path}${qs ? `?${qs}` : ""}`;
    const res = await this.fetchBinaryAuthed(target);
    const filename = `certificato-${path.replace(/\.jsp.*/, "")}${params.tipo ? `-${params.tipo}` : ""}.pdf`;
    return { body: res.body, contentType: res.contentType || "application/pdf", filename };
  }

  // Transparent reverse-proxy of one Delphi request on behalf of the browser
  // (see routes `/totem/*`). The session's cookie jar is attached so Delphi
  // serves the authenticated page/asset; nothing is rewritten in the body —
  // the wrapper mirrors Delphi's path structure, so the page's own relative
  // links resolve back onto the proxy. We only rewrite a same-origin redirect
  // Location into a wrapper-relative `/totem/...` path so the browser stays on
  // the mirror; a cross-origin redirect (rare) is left absolute. Not cached.
  async proxyPage(
    path: string,
    init: { method?: string; body?: Buffer; contentType?: string } = {},
  ): Promise<ProxyResponse> {
    const headers: Record<string, string> = {};
    if (init.contentType) headers["content-type"] = init.contentType;
    const res = await this.deps.session.request((f) =>
      f.proxy(path, { method: init.method, body: init.body, headers }),
    );
    let location = res.location;
    if (location) {
      try {
        const origin = new URL(this.deps.config.baseUrl).origin;
        const u = new URL(location, origin + path);
        location = u.origin === origin ? u.pathname + u.search : u.href;
      } catch { /* unparseable Location — pass through untouched */ }
    }
    return { ...res, location };
  }

  // Trigger a service's "Genera codice" action and read back the generated code.
  // Stateful, like the rest of the Entra= flow: list → the service's activation
  // page (so the Genera button's context exists) → the Genera URL itself. Each
  // call regenerates on Delphi's side, so this runs only on an explicit user
  // click, never during list load.
  async generaCodice(ctxPath: string, azionePath: string): Promise<{ code: string | null }> {
    await this.fetchBody(PATH_SERVIZI);
    await this.deps.session.request((f) => f.fetchBinary(ctxPath));
    const res = await this.deps.session.request((f) => f.fetchBinary(azionePath));
    return { code: serviziParser.extractGeneratedCode(res.body.toString("latin1")) };
  }
}
