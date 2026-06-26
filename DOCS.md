# Delphi Wrapper — Complete Documentation

THIS DOCUMENT IS ALSO TO BE CHALLENGED IF NEW DISCOVERIES ARE MADE. 

> **Status:** All routes verified live against `https://delphi.uniroma2.it` with two student accounts (one graduated, one active). GOMP integration is investigated but **out of scope** for now — see §10.
>
> This document captures **every single finding, decision, quirk, and implementation detail** I have about the Delphi Wrapper project, from the initial hand-off through the live investigation. It is deliberately exhaustive: nothing is summarised away, no findings are elided. Future maintainers (and the AI agents that will be reading it) should be able to rebuild the whole system from this file alone.

## Table of contents

1. [Project overview and scope](#1-project-overview-and-scope)
2. [Technology stack](#2-technology-stack)
3. [Environment variables and credentials](#3-environment-variables-and-credentials)
4. [File layout](#4-file-layout)
5. [The Delphi Segreterie system — what we're actually scraping](#5-the-delphi-segreterie-system--what-were-actually-scraping)
6. [Every page we know about, with its structure](#6-every-page-we-know-about-with-its-structure)
7. [The GOMP 2010 sub-system](#7-the-gomp-2010-sub-system)
8. [Wrapper architecture](#8-wrapper-architecture)
9. [The parsers in detail](#9-the-parsers-in-detail)
10. [Out of scope: GOMP integration](#10-out-of-scope-gomp-integration)
11. [Test suite — every test, what it asserts, where the fixture came from](#11-test-suite--every-test-what-it-asserts-where-the-fixture-came-from)
12. [Build, run, test, and the live verify dance](#12-build-run-test-and-the-live-verify-dance)
13. [Known issues, quirks, and landmines](#13-known-issues-quirks-and-landmines)
14. [Future work](#14-future-work)
15. [Live build findings (challenge log)](#15-live-build-findings-challenge-log)

---

## 1. Project overview and scope

**What this project is.** A local HTTP wrapper around the Delphi Segreterie student portal at `https://delphi.uniroma2.it`. The wrapper authenticates a student once (matricola + password), stores the session cookie encrypted in sqlite, and exposes the student's academic data as a clean, paginated, filterable JSON API. It is designed to be consumed by a separate Next.js host app (the LINFO student app), and runs on `localhost` only — no public-internet exposure.

**Why it exists.** The Delphi JSP pages are old, ugly, and require a session cookie that changes per login. The future LINFO app needs the same data but doesn't want to re-implement the scraping, the throttling, the redirect handling, the encrypted-cookie persistence, the per-field caching, or the parser maintenance every time Delphi tweaks a `<td>` class. This wrapper centralises all of that.

**What it is NOT.** Not a public API. Not a GOMP wrapper (GOMP is a different system at `uniroma2studenti.gomp.it` — see §7 and §10). Not an LLM/RAG/Smart-anything layer. Not a UI — the SPA that ships with it is a debugging surface, not the production client.

**Quality bar (from `PRODUCT.md`):**

- TypeScript strict, no `any` outside explicit `// TODO: any` markers.
- All parsers have unit tests with HTML fixtures in `tests/fixtures/`.
- Vitest for tests; `test`, `build`, `start`, `dev`, `typecheck` scripts.
- All env vars validated through zod at boot; process refuses to start on missing or malformed configuration.
- No silent errors. Every caught error is logged with context.
- Manual redirect handling so the session cookie survives 3xx hops (Delphi returns 302 from `preIndexCertificati.jsp` → `indexCertificati.jsp`; we follow it transparently).
- All cached values carry a per-field TTL; live failures fall back to the stale snapshot with `X-Cache-Stale: true`.

---

## 2. Technology stack

| Layer | Library | Version | Why |
|---|---|---|---|
| Runtime | Node.js | `>=20` (engines field) | Native `fetch`, `undici`, modern ESM. |
| Language | TypeScript | `^5.6` | Strict mode. Catches the parser mistakes before they ship. |
| Module system | ESM | `"type": "module"` | Native ESM, no Babel/TS-node dance. |
| HTTP server | Express | `^4.21` | Familiar middleware API. We use it thin (no view engine). |
| HTTP client | undici | `^6.20` | Faster than `node-fetch`; per-host `Client` lets us keep-alive. |
| HTML parsing | cheerio | `^1.0` | jQuery-like API over parsed HTML. We use it for every parser. |
| Cache / session store | better-sqlite3 | `^11.3` | Synchronous sqlite, perfect for single-process local cache. |
| Logger | pino | `^9.4` | Fast, JSON by default, pretty-printer in dev. |
| Pretty logger | pino-pretty | `^11.2` | Dev only. |
| Env validation | zod | `^3.23` | Boot-time env validation; type inference. |
| Test runner | vitest | `^2.1` | Fast, ESM-native, similar API to Jest. |
| Dev runner | tsx | `^4.19` | ESM TypeScript runner with watch mode. |
| Type defs | `@types/*` | matching | For express, node, cheerio, better-sqlite3. |

**Why no front-end framework in the SPA.** The HTML shell is rendered server-side from `src/server/static/index.html.ts`. The client-side controller is a single `app.js` file (~700 lines) that uses `fetch` directly. No build step, no bundler, no transpilation. The design register in `DESIGN.md` requires this: the page is a debug console, not a product UI.

---

## 3. Environment variables and credentials

Validated through zod at boot in `src/config.ts`. The process refuses to start on missing or malformed values.

| Var | Required | Default | Notes |
|---|---|---|---|
| `DELPHI_MATRICOLA` | yes | — | Student id. The wrapper uses this for fallback display, the login form pre-fill, and as a tag in some Delphi requests. Never logged. |
| `DELPHI_PASSWORD` | yes | — | Delphi password. Never logged; redacted by pino's `redact` paths. |
| `DELPHI_SESSION_KEY` | yes | — | 64-char hex string (32 bytes). AES-256-GCM key for the cookie jar stored in sqlite. If you change this, all saved sessions become unreadable. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `DELPHI_BASE_URL` | no | `https://delphi.uniroma2.it` | Override for testing against a staging environment. Trailing slashes are stripped. |
| `PORT` | no | `3000` | HTTP listen port. The local `.env` uses `7821`. |
| `LOG_LEVEL` | no | `info` | One of `trace, debug, info, warn, error, fatal`. |
| `DELPHI_CACHE_PATH` | no | `./data/cache.db` | Path to the sqlite cache + encrypted session store. |
| `NODE_ENV` | no | `development` | When set to `production`, pino-pretty is disabled. |
| `HOST` | no | (unset) | The local `.env` has `HOST=127.0.0.1` (informational only — Express doesn't use it). |

**Pino redact paths** (`src/logger.ts`): `password, DELPHI_PASSWORD, DELPHI_MATRICOLA, matricola, *.password, *.matricola, req.headers.cookie, req.headers.authorization, headers.cookie, headers.authorization, cookies, cookie, session.cookies`.

**No credentials in config.** In the multi-tenant model the LINFO host app POSTs matricola+password to `/session/login` per user; the wrapper holds them in RAM only and returns an opaque bearer token. `CAPTURE_ACCOUNTS` (an env var, JSON array of `{tag,matricola,password}`) is the only credential-bearing input, and only `npm run capture` reads it.

**GOMP credentials: there are none.** GOMP is supposed to be reachable through the Delphi session via SSO, but we couldn't reproduce that handshake from curl (see §7 and §10).

---

## 4. File layout

```
delphi-wrapper/
├── .env                       # gitignored. Holds the real creds.
├── .env.example               # Template. Committed.
├── .gitignore
├── DESIGN.md                  # Visual register of the SPA page.
├── DOCS.md                    # ← this file.
├── PRODUCT.md                 # Product brief.
├── README.md                  # Public-facing quickstart + routes table.
├── package.json
├── package-lock.json
├── tsconfig.json
├── vitest.config.ts
├── data/                      # Created at runtime.
│   └── cache.db               # sqlite cache + encrypted sessions.
│   └── cache.db-shm           # WAL.
│   └── cache.db-wal           # WAL.
├── dist/                      # Build output. `tsc` → `dist/`.
│   └── ...
├── node_modules/              # npm install.
├── src/
│   ├── config.ts              # zod-validated env loader.
│   ├── logger.ts              # pino instance.
│   ├── types.ts               # All domain types.
│   ├── index.ts               # Main entrypoint. Boot Express.
│   ├── client/
│   │   ├── cookie-jar.ts      # Minimal cookie management.
│   │   ├── fetcher.ts         # undici Client + manual redirect.
│   │   ├── session.ts         # login/logout/restore.
│   │   └── endpoints/
│   │       ├── anagrafica.ts  # Parser for datiStudente.jsp.
│   │       ├── appelli.ts     # Parser for the appelli page.
│   │       ├── carriera.ts    # Parser for esamiVerbalizzati.jsp.
│   │       ├── piano.ts       # Parser for piano di studi.
│   │       ├── bollettini.ts  # Parser for situazioneRateNew.jsp.
│   │       ├── servizi.ts     # Parser for sStudentiAttivaServizi.jsp.
│   │       ├── certificati.ts # Parser for preIndexCertificati.jsp.
│   │       └── esami-search.ts # filterEsami() and summarizeEsami().
│   ├── cache/
│   │   ├── store.ts           # sqlite-backed cache + session.
│   │   └── policies.ts        # per-field TTLs.
│   ├── server/
│   │   ├── api.ts             # high-level fetch+cache orchestrator.
│   │   ├── routes.ts          # Express routes.
│   │   ├── session-middleware.ts
│   │   └── static/
│   │       ├── index.html.ts  # Renders the SPA HTML shell.
│   │       ├── app.js         # SPA controller (no framework).
│   │       └── styles.css     # Design system.
│   └── utils/
│       ├── retry.ts           # withBackoff().
│       └── throttle.ts        # createThrottle().
└── tests/
    ├── anagrafica.test.ts
    ├── appelli.test.ts
    ├── bollettini.test.ts
    ├── carriera.test.ts
    ├── certificati.test.ts
    ├── cookie-jar.test.ts
    ├── esami-search.test.ts
    ├── servizi.test.ts
    ├── throttle.test.ts
    ├── ui.test.ts
    └── fixtures/
        ├── anagrafica.html          # hand-crafted synthetic fixture
        ├── appelli.html             # hand-crafted
        ├── carriera.html            # hand-crafted
        ├── datiStudente.real.html   # ← captured from live session
        ├── esamiVerbalizzati.real.html  # ← captured from live session
        ├── login.html               # hand-crafted
        ├── piano.html               # hand-crafted
        ├── preIndexCertificati.real.html  # ← captured from live session
        ├── situazioneRateNew.real.html   # ← captured from live session
        └── sStudentiAttivaServizi.real.html  # ← captured from live session
```

`*.real.html` fixtures are byte-identical (minus the date headers and JSESSIONID cookie) to pages fetched from the live Delphi portal. They are checked into the repo on purpose: they document the actual Delphi-side HTML, and they let the parsers be tested against real-world data even when Delphi is down.

---

## 5. The Delphi Segreterie system — what we're actually scraping

This section is the most important part of this document. It records everything we know about the live Delphi system, so that the parsers in §9 make sense.

### 5.1 Base URL, language flag, and the session cookie

- **Base URL**: `https://delphi.uniroma2.it`. All paths live under `/totem/jsp/...`. The Apache/Tomcat front-end advertises `Apache/2.2.16 (Debian)` + `Apache Tomcat/6.0.29`. The JSP container is ancient (Tomcat 6 was released in 2006).
- **Language flag**: every authenticated page accepts `?language=IT` and `?language=EN`. The IT page uses Windows-1252 (`iso-8859-1`) and the EN page uses the same. The HTML entities are spelled out (`&egrave;` for `è`, etc.) so we can't rely on UTF-8 decoding alone. Cheerio handles the entities correctly.
- **Session cookie**: `JSESSIONID`. Set on `delphi.uniroma2.it` with `Path=/totem; Secure`. It is also **proxied to GOMP** via cross-domain redirect — see §7.4.
- **CSRF**: Delphi does not implement CSRF tokens. We do not add any.

### 5.2 The login flow

The flow is a two-step `GET → POST`:

1. **Warmup**: `GET /totem/jsp/Iscrizioni/autenticazione.jsp?language=IT`. This sets the `JSESSIONID` cookie and the "visited" cookie that Delphi uses as a soft CSRF check. The response is the HTML login form. Form fields: `login` (text, maxlength 16), `password` (password, maxlength 8), `entra` (submit, value "Entra"), `language` (hidden). For SPID: `entraSPID` (submit, value "Entra con Spid o CiE"), `spidaccess=y`, `spidl=2`, `acs=2`.
2. **Submit**: `POST /totem/jsp/Iscrizioni/sStudentiLoginIntro.jsp` with `application/x-www-form-urlencoded` body `login=<matricola>&password=<pwd>&entra=Entra`. The response is the dashboard for the account type (graduated or active).

The wrapper's `Session.doLogin` does both steps, then saves the resulting `JSESSIONID` to the encrypted sqlite store.

The login page also contains a 302 redirect to `https://delphi.uniroma2.it/totem/jsp/Iscrizioni/sStudentiLoginProcess.jsp?language=IT` on a stale form post — that is the **standard redirect after a successful login**, which the wrapper follows manually because undici's auto-redirect was dropping the session cookie on the second hop (see §13, "undici redirect drops cookies").

For graduated students, the post-login dashboard is `sStudentiLaureatiLogin.jsp` (we hit it by accident during investigation, see §5.3). For active students, it's `sStudentiRegolariLogin.jsp`. The wrapper doesn't care which one Delphi chose; it just records the cookie.

### 5.2.1 Zombie sessions and login verification

**Symptom (reported in the field).** Some users — never all, never reproducibly — got `Delphi non è raggiungibile al momento` (HTTP 503, `delphi_unavailable`) on some pages, or every page. The same user would work fine minutes later after logging out and back in. It was not a rate limit (those would be 429, and the per-session 2 s throttle does not bound aggregate load anyway).

**Root cause, found via the per-user failure log** (`src/server/failure-log.ts`, which records every 503/401 to `data/logs/<matricola>-<date>.jsonl`). When it failed, one user's log showed *every* endpoint failing at once with `empty carriera`, `empty bollettini`, `empty anagrafica`, … The `empty X` guards in `Api` only fire when a parsed page has **no matricola in its header** — and a real data page always has one. So Delphi was answering every data request with the **login form**, not the student's data: the session was authenticated in our in-RAM registry but **dead on Delphi's side**.

How a dead session gets created: the old `doLogin` declared success on a weak test — *a `JSESSIONID` cookie exists AND the body does not say "credenziali errate."* But Delphi hands out a `JSESSIONID` on the login page itself. If the `GET → POST` handshake doesn't fully register server-side (a transient Delphi hiccup during login), we keep the cookie, mark the session `logged_in`, and mint a **zombie**: every subsequent fetch returns the login page → parses as `empty` → 503. Worse, the existing mid-request re-login only triggered on an auth `401/403` *thrown by the fetcher*, but `empty X` is thrown later in the `Api` loader, so the zombie never recovered. The user was stuck on 503 until the session was idle-evicted or they re-logged in by hand.

**The detector.** Authenticated captures (`captures/active/*`, `captures/graduated/*`) contain **no** password input field; the login form always does. So `looksLikeLoginPage(html)` = `/name=["']?password["']?/i.test(html)` is a reliable "this is NOT an authenticated page" signal. It is exported from `src/client/session.ts` and used in both fixes below.

**Fix 1 — don't create zombies (`Session.attemptLogin`).** After the login POST, classify by *what page we landed on*, not just "is there a cookie":
- no login form in the response → **authenticated** → success;
- login form **with** a credential-error message → **bad credentials** → `NonRetryableError("invalid_credentials")` (terminal, surfaces as 401, no retry);
- login form **without** an error message → the handshake didn't take → `RetryableError` → `withBackoff` retries the whole handshake (3 attempts, 500 ms base).

**Fix 2 — recover a session that dies later (`Api.fetchBody`).** Every HTML data page flows through `fetchBody`, which now runs `looksLikeLoginPage` **inside** the `session.request` callback. A login-page response throws `NonRetryableError("session_lost")`, which the session's existing re-login-and-retry path catches → it re-logs in once and refetches. If the re-login fixes it, the user never sees an error; if Delphi is genuinely broken, it falls through to stale cache or a (now correctly-attributed) 503.

The `empty X` guards remain as a backstop for the rare page that is neither the login form nor a valid data page.

**Coverage.** Delphi drops sessions constantly and in every context — this is its well-known behaviour, not an edge case — so the guard covers every authenticated surface, not just one. HTML data pages go through `Api.fetchBody`; PDF downloads (certificati, ricevute) go through `Api.fetchBinaryAuthed`, which treats a `text/html` body on a binary endpoint as the login form (so a session drop mid-download re-logs in and retries instead of streaming a login page to the browser as a corrupt PDF). The reverse-proxy path (`/totem/*`) is deliberately **not** auto-recovered: there the browser drives a live Delphi session and Delphi's own re-login UI is shown through the mirror.

**Security properties of the silent re-login** (it replays the stored password, so the bounds matter):
- **Bounded per request.** `Session.request` re-logs in at most **once** per request; if the retry still fails it propagates. No infinite loop.
- **No lockout hammering.** A genuinely wrong password returns the login form *with* a credential-error message → `invalid_credentials`, which is non-retryable: `withBackoff` does not retry it and `Session.request` does not re-login on it. We never replay a known-bad password against Delphi.
- **No login stampede.** Concurrent requests that all detect a dropped session collapse onto a single in-flight handshake (`Session.loginInFlight`), so a burst of pages triggers one re-login, not N.
- **No account crossing.** Re-login uses the session's *own* in-RAM credentials and its *own* cookie jar (one `Fetcher` per `Session`). It can neither switch accounts nor leak another user's data (see §15.3).
- **No secret leakage.** The session-loss error carries no page body; pino redacts `password`/`matricola` from every log; only 5xx bodies are snippetted into the failure log, never login pages.

Known ceiling: if Delphi drops the session on *every* request (pathological), each request still costs one re-login, rate-limited to ~1/2 s per user by the throttle. That's tolerable at the current user count; if it ever isn't, add a short per-session re-login cooldown that surfaces the error instead of re-logging in again.

### 5.3 The 302 redirect chain that Delphi uses

There are **two** redirect chains we have to handle. Both are empirically observed against the live server.

**Chain A: login → form post** (synchronous, happens in `Session.doLogin`):
```
POST /totem/jsp/Iscrizioni/sStudentiLoginIntro.jsp
  → 302 Location: /totem/jsp/Iscrizioni/sStudentiLaureatiLogin.jsp?language=IT
                                                          (graduated)
  → 302 Location: /totem/jsp/Iscrizioni/sStudentiRegolariLogin.jsp?language=IT
                                                          (active)
  → 200 OK (the dashboard)
```

**Chain B: certificati pre-page** (synchronous, happens on `/certificati`):
```
GET /totem/jsp/studenti/stampaCertificati/preIndexCertificati.jsp
  → 302 Location: /totem/jsp/studenti/stampaCertificati/indexCertificati.jsp
  → 200 OK
```

Both chains are followed by the `Fetcher.fetch()` method in `src/client/fetcher.ts`, which is the only method in the codebase that does manual redirect handling (see §8.4 for the implementation details). The `Fetcher.fetchBinary()` method does the same for the PDF ricevuta.

A third redirect chain exists but we don't follow it: the GOMP SSO chain. See §7.4 for details.

### 5.4 The two account types: graduated vs active

**Graduated students** see the Laureati dashboard (`sStudentiLaureatiLogin.jsp`) which links to:
1. `datiStudente.jsp` (anagrafica) — has the "Consegui laurea triennale in ..." block and a "Stato carriera: Carriera studente conclusa" line.
2. `situazioneRateNew.jsp` (tasse) — full history available.
3. `esamiVerbalizzati.jsp` (esami) — full history available.
4. `sStudentiAttivaServizi.jsp` (servizi) — Office365, MatLab, Mathematica activation links.
5. `stampaCertificati/preIndexCertificati.jsp` (certificati menu) — links to `certificatoLaurea.jsp`, `certificatoLaureaEsami.jsp`, `certificatoIscrizione.jsp?tipo=2`.

**Active students** see the Regolari dashboard (`sStudentiRegolariLogin.jsp`) which has 24 menu items grouped as follows (the full list is in §5.6).

Important: a graduated student trying to access an active-only path (e.g. `/totem/jsp/prenotazioni/menuPrenotazioni.jsp`) gets a 404 from Tomcat, **not** a 403. The path physically doesn't exist for that account type (it would, for an active student). This is why the wrapper's `/piano` and `/appelli` return empty arrays for graduated students — the Tomcat 404 page has 1075 bytes of HTML and the parser just finds no data table inside.

### 5.5 Graduated-student menu

Captured by curl on the live server, full source available in `tests/fixtures/*.real.html` for everything marked as "captured":

| # | Menu item | Path | Wrapper endpoint | Status |
|---|---|---|---|---|
| 1 | Visualizza e Modifica dati personali | `datiStudente.jsp` | `GET /anagrafica` | ✅ done |
| 2 | Situazione Bollettini | `situazioneRateNew.jsp` | `GET /tasse` | ✅ done |
| 3 | Esami verbalizzati | `esamiVerbalizzati.jsp` | `GET /carriera` and `GET /carriera/esami` | ✅ done |
| 4 | Attivazione altri servizi | `sStudentiAttivaServizi.jsp` | `GET /servizi` | ✅ done |
| 5 | Stampa Certificati | `stampaCertificati/preIndexCertificati.jsp` | `GET /certificati` | ✅ done |

That's the entire graduated-student menu. Just 5 items.

### 5.6 Active-student menu

Captured by curl on the live server, not yet in fixtures (the real-student fixtures are in `tests/fixtures/*/` but they're graduated-student). The full list:

| # | Menu item | Path | Wrapper | Status |
|---|---|---|---|---|
| 1 | Modifica password | `modificaPwStudenti.jsp` | — | not impl. (write op) |
| 2 | Visualizza e Modifica dati personali | `datiStudente.jsp` | `GET /anagrafica` | ✅ done |
| 3 | Acquisizione ISEE-Università | `studenti/autorizzaAccessoInps/autorizzazione.jsp` | — | not impl. |
| 4 | Gestione Tasse Universitarie | `situazioneRateNew.jsp` | `GET /tasse` | ✅ done |
| 5 | Richiesta esonero parziale tasse e contributi | (text-only, no link) | — | disabled |
| 6 | **Prenotazione esami** | `prenotazioni/menuPrenotazioni.jsp` | — | not impl. (T2 in plan) |
| 7 | Esami verbalizzati | `esamiVerbalizzati.jsp` | `GET /carriera` | ✅ done |
| 8 | **Frequenza corsi di insegnamento** | `IscCorsiStudente/menuIscrizioni.jsp` | — | not impl. (T2 in plan) |
| 9 | Esami in corso di verbalizzazione | `studenti/esami/esamiPendenti.jsp` | — | not impl. (T1 in plan) |
| 10 | **Presentazione piano di studi** | `studenti/pianoDiStudi/index.jsp` | — | not impl. (T1 in plan) |
| 11 | Verbali di interesse non chiusi | `studenti/esami/verbaliNonChiusi.jsp` | — | not impl. (T1 in plan) |
| 12 | Richiesta di Passaggio di corso | (text-only, "termini scaduti") | — | disabled for the test student |
| 13 | Richiesta di Trasferimento in uscita | (text-only, "termini scaduti") | — | disabled |
| 14 | Ristampa domanda di iscrizione/immatricolazione | `Iscrizioni/StampaDomandaEngine.jsp` | — | not impl. |
| 15 | Cancella la domanda di iscrizione | (text-only, no link) | — | disabled |
| 16 | Richiesta sospensione | (text-only, "esistono verbali non chiusi") | — | disabled |
| 17 | Ristampa richiesta iscrizione a tempo parziale | `stampa.pdf?tipoStampa=43` | — | not impl. (T1 in plan) |
| 18 | Rinuncia agli studi | (text-only, "esistono verbali non chiusi") | — | disabled |
| 19 | Gestione Domanda di Laurea | `studenti/laurea/indexLaurea.jsp` | — | not impl. (T1) |
| 20 | Frontespizio della Tesi di Laurea | `studenti/laurea/indexFrontespizio.jsp` | — | not impl. (T1) |
| 21 | Iscrizione/gestione corsi non curriculari | `corsiErogati/accedi2.jsp?cmd=stud` | — | not impl. |
| 22 | Attivazione altri servizi | `sStudentiAttivaServizi.jsp` | `GET /servizi` | ✅ done |
| 23 | Domanda per incarico di collaborazione part-time | `studenti/benefici/menu.jsp?tipoDomanda=11` | — | not impl. (T1) |
| 24 | Richieste Certificati | `studenti/richiestaCertificati/indexCertificati.jsp` | — | not impl. (T1) |
| 25 | Stampa Certificati | `stampaCertificati/preIndexCertificati.jsp` | `GET /certificati` | ✅ done |

So the active-student menu has 25 items, of which we cover 5 (the same 5 as the graduated student, plus the prenotazioni/piano/cert ones we discovered). The plan in the previous turn called for adding 15 more endpoints in two tiers.

---

## 6. Every page we know about, with its structure

This section is the parser contract. For each page, I record the URL, the expected HTTP method, the high-level structure of the HTML (where the data is, what classes wrap it, what the edge cases are), and the parser's selector strategy.

### 6.1 `autenticazione.jsp?language=IT` — Login warmup

**Path:** `/totem/jsp/Iscrizioni/autenticazione.jsp?language=IT`
**Method:** GET
**Auth required:** no
**Used by:** `Session.doLogin()` step 1.

HTML shape:

```html
<form action="sStudentiLoginIntro.jsp" method="post">
  <input name="login" type="text" maxlength="16" />
  <input name="password" type="password" maxlength="8" />
  <input name="entra" type="submit" value="Entra" />
  <input type="hidden" name="language" value="IT" />
</form>
<form method="POST" action="sStudentiLoginIntro.jsp">
  <input name="spidaccess" value="y" />
  <input name="spidl" value="2" />
  <input name="acs" value="2" />
  <input name="entraSPID" type="submit" value="Entra con Spid o CiE" />
</form>
```

There's also a cookie-test form (targetcookie=visited) which is Delphi's soft CSRF. We don't need to interact with it.

### 6.2 `sStudentiLoginIntro.jsp` — Credential submit

**Path:** `/totem/jsp/Iscrizioni/sStudentiLoginIntro.jsp`
**Method:** POST
**Auth required:** no
**Used by:** `Session.doLogin()` step 2.

Body: `application/x-www-form-urlencoded` with `login=<matricola>&password=<password>&entra=Entra`.

Response: 302 redirect to the appropriate dashboard (`sStudentiLaureatiLogin.jsp` for graduates, `sStudentiRegolariLogin.jsp` for active students), with a new `JSESSIONID` cookie set on `delphi.uniroma2.it` with `Path=/totem; Secure`. The wrapper follows the redirect manually; if Delphi ever returns 200 directly with no redirect, that means the login failed and the body contains "credenziali errate" or similar.

### 6.3 `sStudentiLaureatiLogin.jsp?language=IT` — Graduated dashboard

**Path:** `/totem/jsp/Iscrizioni/sStudentiLaureatiLogin.jsp?language=IT`
**Method:** GET
**Auth required:** yes (graduated)
**Used by:** nothing directly, but the post-login redirect lands here for graduates.

HTML shape (relevant part):

```html
<table id="adempi" align="center">
  <tr>
    <td class="titolo" colspan="2">
      <strong>ADEMPIMENTI e SERVIZI ON-LINE<br>
      Per studenti Laureati</strong>
    </td>
  </tr>
  <tr>
    <td class="intesta">Dati carriera</td>
    <td class="cellaBK" style="text-align: left">
      <font color="#00e000"><b>Carriera studente conclusa</b><br>
      AA immatricolazione <b>2021/2022</b> <br>
      Conseguita laurea triennale in LINGUE NELLA SOCIETA'
      DELL'INFORMAZIONE in data DD/MM/YYYY
      con la votazione di NNN/110
      </font>
    </td>
  </tr>
  <tr>
    <td class="intesta">Dati personali</td>
    <td class="cellaBK">
      <a href="datiStudente.jsp">Visualizza e Modifica dati personali</a>
    </td>
  </tr>
  <tr>
    <td class="intesta" style="text-align: center; font-weight: bold;">
      PAGAMENTO TASSE E CONTRIBUTI
    </td>
    <td class="cellaBK">
      <a href="situazioneRateNew.jsp">Situazione Bollettini</a>
    </td>
  </tr>
  <tr>
    <td class="intesta" style="text-align: center; font-weight: bold;">
      ESAMI
    </td>
    <td class="cellaBK">
      <a href="esamiVerbalizzati.jsp">Esami verbalizzati</a>
    </td>
  </tr>
  <tr>
    <td class="intesta" style="text-align: center; font-weight: bold;">
      ALTRI SERVIZI
    </td>
    <td class="cellaBK">
      <a href="sStudentiAttivaServizi.jsp">Attivazione altri servizi</a>
    </td>
  </tr>
  <tr>
    <td class="intesta">CERTIFICATI</td>
    <td class="cellaBK" style="text-align: left">
      <span class="riga">
        <a href="../studenti/stampaCertificati/preIndexCertificati.jsp">
          Stampa Certificati
        </a>
      </span>
    </td>
  </tr>
</table>
```

The "Dati carriera" cell carries the laurea information. The wrapper extracts this in the `Anagrafica` parser (see §9.1) as `laurea: { corso, data, votazione }`. The data string is parsed from "data DD/MM/YYYY" with the `parseDateIt` helper.

### 6.4 `sStudentiRegolariLogin.jsp?language=IT` — Active-student dashboard

**Path:** `/totem/jsp/Iscrizioni/sStudentiRegolariLogin.jsp?language=IT`
**Method:** GET
**Auth required:** yes (active)

This is the page that contains the 25 menu items listed in §5.6. The structure is a series of `<span class="riga"><a>...</a></span>` rows, interspersed with `<span class="riga">Plain text (no link)</span>` rows for the disabled items. The wrapper does not currently parse this page; one of the Tier 1 endpoints (`GET /studente/menu`) is supposed to extract these items into a structured menu response.

### 6.5 `datiStudente.jsp` — Anagrafica

**Path:** `/totem/jsp/Iscrizioni/datiStudente.jsp`
**Method:** GET
**Auth required:** yes
**Wrapper endpoint:** `GET /anagrafica`
**Cache policy:** 24h
**Parser:** `src/client/endpoints/anagrafica.ts`
**Captured fixture:** `tests/fixtures/datiStudente.real.html`

The page is a single `<form name="datiPersonali">` containing a `<table class="tabelladatipersonali" align="center">` with multiple section blocks separated by `<tr><td colspan="3" class="boxsfondotabella">SECTION NAME</td></tr>`.

Section names observed in the captured fixture (in order):
1. `Anagrafica` — Cognome, Nome, Codice Fiscale, Data di Nascita, Comune di Nascita, Provincia, Nazione di cittadinanza, Cellulare, E-Mail, Skype.
2. `Residenza ( eletto a recapito postale )` — Indirizzo, Comune, Provincia, CAP, Telefono.
3. `Domicilio` — Indirizzo, Comune, Provincia, CAP, Telefono.
4. `Carriera Universitaria` — Matricola, Facoltà, Corso, Tipologia Corso, Sede del Corso, Codice Corso, Anno di Corso, AA immatricolazione, AA ultima iscrizione.

Each section has a "Modifica" link inside the section header (`<a href="datiStudente.jsp?modifica=residenza&id=..." class="bottone2">`). We strip the `<a>` tag from the section header before extracting the section name (see parser details in §9.1).

The page also has a student photo: `<img src="/totem//Foto/visualizzaFoto?idPersona=<id>" />` where `<id>` is an internal Delphi person identifier. The double slash `//` is a real Delphi quirk; the wrapper exposes the URL as `fotoUrl` and the SPA passes it to an `<img>` tag, which loads it directly from Delphi with the session cookie attached.

Quirks observed:
- The "AA ultima iscrizione" value is `"2024/2025 (Iscrizione cautelativa)"` for graduated students. The parser strips the parenthetical and keeps just `"2024/2025"`.
- The "Anno di Corso" value is `"3 FUORI CORSO"`. The parser splits on whitespace and takes the first integer → `3`. The full label is preserved in `annoCorsoLabel`.
- Section names with parentheticals (e.g. "Residenza ( eletto a recapito postale )") need to have the parenthetical stripped to disambiguate the section key. The parser does this with `rawName.split("(")[0]?.trim()`.

### 6.6 `esamiVerbalizzati.jsp` — Carriera / Esami sostenuti

**Path:** `/totem/jsp/Iscrizioni/esamiVerbalizzati.jsp`
**Method:** GET
**Auth required:** yes
**Wrapper endpoints:** `GET /carriera`, `GET /carriera/esami`
**Cache policy:** forever (the official record is on Delphi, so we just refresh on demand)
**Parser:** `src/client/endpoints/carriera.ts`
**Captured fixture:** `tests/fixtures/esamiVerbalizzati.real.html` (captured from the live page, >10 esami parsed)

The page is a single `<table>` with three logical sections:

1. **Header block** — a single `<tr>` with a `<td class="riepilogo" colspan="16">` cell containing the student's name, matricola, and CDL. Parser extracts this with regex matching against the text "Studente:", "Matricola:", "Corso di Laurea:".
2. **Esami table** — 16 columns: N., Esame, SSD, AA, Data, Crediti, Voto, Note, (*) Tipo Attività, N. verbale, Riconosciuto Da, AA Orig., Crediti Orig., Voto Orig., Data Orig., VERB. ORIG. Header row uses `<td class="tabella1">` cells. Data rows alternate `<td class="esamidispari">` and `<td class="esamipari">` (this is the "riga dispari" / "riga pari" alternating-stripe pattern that Delphi uses throughout the portal).
3. **Rendimento block** — a single `<tr>` with a `<td class="riepilogo asinistra" colspan="16">` cell containing the rendimento summary. Parser extracts this with regex matching against "Esami validi:", "CFU Esami validi:", "Idoneità:", "CFU Idoneità:", "Media aritmetica:", "Media ponderata:".

The "Esame" cell holds BOTH codice and nome concatenated as `<codice> <nome>`, e.g. `0000001 CORSO 1`. The parser splits this with a regex `^(\d{6,9})\s+(.+)$`. The codice is always 6-9 digits.

Voto cell quirks (this is where the parser does the most work):

| Raw value | Parsed as | stato |
|---|---|---|
| `26/30` | `{tipo:"trentesimi", valore:26, lode:false}`, label `"26/30"` | `superato` |
| `30/30` | `{tipo:"trentesimi", valore:30, lode:false}`, label `"30/30"` | `superato` |
| `30 E LODE` | `{tipo:"trentesimi", valore:30, lode:true}`, label `"30 e lode"` | `superato` |
| `IDONEO` / `APPROVATO` / `PASS` | `{tipo:"qualifica", valore:"IDONEO"}`, label `"IDONEO"` | `idoneo` |
| `OTTIMO` / `BUONO` / `DISTINTO` / `DISCRETO` / `SUFFICIENTE` | `{tipo:"qualifica", valore:"OTTIMO"}` | `in_corso` (isPartial=true) |
| empty | `null` | `in_corso` |
| `RITIRATO` / `RESPINTO` / `BOCCIATO` (also matched in note column) | `null` | `non_superato` |

The `isPartial` flag is set when `cfu === null` (which happens for SCRITTO partial exams that have no CFU). The label is preserved as `votoLabel` so the SPA can render it as-is.

CFU quirks:
- `6.0`, `9.0`, `12.0` etc. — parsed as float.
- `--` — parsed as `null` (used for partial language exams).
- The parser uses `parseFloatSafe` which strips non-digit characters and returns `null` on parse failure.

SSD quirks:
- `SSD/00` — single SSD.
- `SSD/01, SSD/01` — duplicated SSD for combined exams (e.g. a 12 CFU exam composed of two 6-CFU SSDs). The parser preserves the full string.

AA quirks:
- `2021/2022` — normal.
- `---` — used for tirocinio/prova-finale when the AA is "later" (filled in by the segreteria). The parser falls back to scanning the later cells (the "riconosciuto da" columns) for the first `YYYY/YYYY` cell. For row 27 (TIROCINIO) the AA is in column 12 as "2023/2024".

Verbale quirks:
- `LETT-NNNNNNN` — normal alphanumeric verbale ID.
- `---` — used for tirocinio. The parser collapses this to `null`.

Tirocinio row quirks: The TIROCINIO row (row 27) has 15 cells, not 10 — the "riconosciuto da" cells are inlined into the same row. The parser's AA fallback in `rowToEsame` handles this by scanning cells 10+ for the first YYYY/YYYY match. For the verbale number, it returns `null` when the value is `---`.

### 6.7 `situazioneRateNew.jsp` — Tasse / Bollettini

**Path:** `/totem/jsp/Iscrizioni/situazioneRateNew.jsp`
**Method:** GET
**Auth required:** yes
**Wrapper endpoint:** `GET /tasse`, `GET /tasse/ricevuta`
**Cache policy:** 1h
**Parser:** `src/client/endpoints/bollettini.ts`
**Captured fixture:** `tests/fixtures/situazioneRateNew.real.html`

The page is complex. It has three top-level blocks:

1. **Studente block** — a `<table id="adempi">` with three rows labeled `MATRICOLA:`, `NOME:`, `COGNOME:`. Values are in `<td class="cella">` cells.

2. **Iscrizione summary block** — a `<table id="adempi">` containing a `<td class="msggenerico">` cell with a single `<h3>` line: `2024/2025: Relativamente all'anno dell'ultima iscrizione (CAUTELATIVA), la situazione dei pagamenti risulta essere regolare (Si ricorda che l'iscrizione cautelativa è riservata agli studenti che intendano laurearsi nella sessione invernale ovvero nell'ultima sessione utile dell'a.a. 2024/2025)`. The parser extracts: `anno` = "2024/2025" (the leading `YYYY/YYYY`), `tipo` = "CAUTELATIVA" (the first uppercase parenthetical, matched by `/\(([A-Z][A-Z\s]{2,})\)/`), and `messaggio` = the text after the colon, with the tipo parenthetical and the trailing reminder parenthetical removed (matched by `/\([A-Z][A-Z\s]{2,}\)/` and `/\s*\((?:Si ricorda|Nota|Per).*?\)\s*$/i`).

3. **Anni accademici block** — one `<table>` per anno accademico, with this structure per anno:
   - Anno header row: `<td class="intesta" colspan="5"><font size=4><b>AA YYYY/YYYY</b></font> <i>Isee: NNNN</i></td>`
   - Rata header row: `RATA | IMPORTO | DATA SCADENZA | RATA SALDATA | VOCI DA SALDARE`
   - Rata data row: rata number, importo, data scadenza, saldato (SI/NO)
   - Bollettino sub-table (one row per bollettino inside a nested table):
     - Header: `IMPORTO BOLLETTINO | CAUSALE | DATA PAGAMENTO | IUV | DETTAGLIO BOLLETTINO`
     - First data row: form (with bollettinoId/rataId/AA hidden fields + "Ricevuta" button), importo, causale, data, IUV, dettaglio line 1
     - Subsequent rows: more dettaglio lines (Tassa regionale, Imposta di bollo, Contributo onnicomprensivo, ecc.)
     - Final row: "* Convalidato con pagoPA" indicator

The parser walks: AA year header → Rata header → Rata data row (extract importo, scadenza, saldato) → next sibling `<tr>` (the bollettino sub-table) → first data row of sub-table (extract form fields, importo, causale, data pagamento, IUV, dettaglio) → subsequent sub-table rows (extract more dettaglio lines).

4. **"Altre tipologie di bollettino" block** — a separate `<table>` starting with an `<h3>` header. The h3 is inside a single-row table; the actual receipts table is the next sibling `<table>`. Columns: CAUSALE, IMPORTO, DATA PAGAMENTO, PAGATO, SALE, AUTH, ANNO ACCADEMICO, Descrizione, IUV. Each row has a form button "Ricevuta" that POSTs `bollettinoId`/`rataId`/`AA` to the same page. The parser walks up from the h3 to find the parent table, then takes the next sibling table.

The ricevuta (PDF receipt) flow is:
- User clicks "Ricevuta" → Delphi POSTs to `situazioneRateNew.jsp` with `ricevutaBollettino=Ricevuta` + the bollettinoId/rataId/AA fields → Delphi returns a PDF (application/pdf) with the receipt.
- The wrapper exposes this as `GET /tasse/ricevuta?bollettinoId=...&rataId=...&aa=...` which proxies the POST and streams the PDF back as `Content-Type: application/pdf` with `Content-Disposition: inline; filename="ricevuta-<bollettinoId>.pdf"`.

For the captured fixture, the ricevuta for a paid bollettino is a real PDF v1.4 (verified with `file` command). The `GET /tasse/ricevuta` endpoint has been tested end-to-end against this bollettino and the response is a valid PDF.

The 2024/2025 AA is a "cautelativa" iscrizione: only rata 1 is shown (importo 0), no rata 2/3. Other years have 3 rate each.

### 6.8 `sStudentiAttivaServizi.jsp` — Servizi (Office365/MatLab/Mathematica)

**Path:** `/totem/jsp/Iscrizioni/sStudentiAttivaServizi.jsp`
**Method:** GET
**Auth required:** yes
**Wrapper endpoint:** `GET /servizi`
**Cache policy:** 24h
**Parser:** `src/client/endpoints/servizi.ts`
**Captured fixture:** `tests/fixtures/sStudentiAttivaServizi.real.html`

The page is a `<table>` with a `<td class="titolotabella"><b>Servizi Forniti</b></td>` header row, followed by a `<td class="msggenerico">` cell containing an `<ol>` of `<li>` items.

Each `<li>` has the structure:
```html
<li>
  <div>
    <a href="../Iscrizioni/sStudentiAttivaServizi.jsp?Entra=../emailMicrosoft/menuEmail.jsp">
      Attivazione Microsoft Office365
    </a>
  </div>
  <i>(e-mail, network-disk, etc.)</i><br>
  <i>Per maggiori informazioni clicca
    <a href="http://docs.ccd.uniroma2.it/..." target="_blank">QUI</a>
  </i>
</li>
```

The parser (`parse`) extracts per `<li>`:
- `nome` = the text of the first `<a>` inside the `<li>`.
- `descrizione` = the concatenated text of all `<i>` elements, joined with `" — "`.
- `path` = the first `<a>`'s `href`, resolved against the page base into an absolute Delphi path (`pathname + search`). This is the **activation link** — the thing the user actually needs to click.
- `codes` = an array of `{ label, value }`. Populated at parse time **only** when the link's `?message=` query already encodes a code (MatLab's `OperazioneOK.jsp?message=…`); otherwise filled in by the resolution step below. `label` names a sub-item (National Instruments) and is null for single-code services.
- `infoLink` = an external docs URL found inside the `<i>` notes (the "clicca QUI" link).

Captured servizi for the active student:
1. "Attivazione Microsoft Office365" → menu; no code (status + reset-password actions, reachable via the proxy).
2. "Codice Attivazione MatLab" → `../Common/OperazioneOK.jsp?message=NNNNN-…` (code inline in URL).
3. "Codice Attivazione MyCampusXApp" → info page; the code lives in a different section (not surfaced).
4. "Codici Attivazione National Instruments" → an inner **sub-list** of two codes (LabVIEW `D11L…`, Multisim `D11L…`).
5. "Attivazione Licenza Mathematica" → Wolfram claim URL on the inner page.

#### Activation-code resolution (the stateful `Entra=` server-side fetch)

Most services don't put the code in the list URL — it lives on the **inner activation page** reached through the `?Entra=<inner.jsp>` flow. `Api.getServizi` resolves these server-side (`api.ts`):

1. Parse the list. Any service whose URL already carries a `?message=` code is done.
2. For every remaining service with a `path`: **re-fetch the servizi list, then `GET path`.** The list re-fetch is mandatory — Delphi's totem `Entra=` flow is **stateful**: the inner page returns HTTP 500 unless the list page was the *immediately preceding* request in the session. (This was the real "most codes don't resolve" bug: the old code fetched the list once and looped, so only the first service landed on a fresh list and every later one 500'd, silently.)
3. Run `extractCodes()` on the response. It handles two inner-page shapes: a **sub-list** of `OperazioneOK.jsp?message=CODE` anchors (NI → both codes, each labelled by item) or a **single** code/URL — a numeric cell (MatLab), or a hex-token activation URL (`https://user.wolfram.com/portal/requestAK/<hex>`, Wolfram). Codes may be alphanumeric (`D11L…`).
4. The resolved `codes[]` are cached with the list (24h).

Services that genuinely expose no code (Office365's menu, MyCampusXApp's info page) stay `codes: []` and log `servizi: no code on activation page`; a network/auth failure logs `servizi: code fetch failed` (never silently dropped). A new service with a different inner shape is added as another branch in `extractCodes`, using a capture of its inner page.

> **Cost note:** resolution is serial, rate-limited (`THROTTLE_GAP_MS = 2000`), and now does **two** throttled requests per uncached service (list + inner). For the 5-service account that's ~16 s on a cache-miss `GET /servizi`; the 24h cache makes it a once-a-day cost.

> **Not integrated (by design):** Office365 password-reset is a credential action (`resetPassword.jsp?Reset=si&email=…`) — left to the proxy, never a one-click wrapper button. Office365's **status** page (`attivaAccount.jsp?Lista=yes`) exposes the student's institutional email + Microsoft licence (e.g. `…@students.uniroma2.eu` → `ENTERPRISEPREMIUM_STUDENT, WIN10_ENT_A5_STU`) and is a ready read-only addition; fixture saved at `tests/fixtures/office365Stato.real.html`.

#### Transparent reverse-proxy — `ALL /totem/*` ("Apri nel portale")

"Apri nel portale" lets the user complete activation actions (reset email password, claim a licence, submit a request form) against the live portal — but the Delphi session is held **server-side**, so the browser can't talk to `delphi.uniroma2.it` directly without hitting the login wall. The wrapper mirrors Delphi under its own origin instead.

The route `r.all("/totem/*")` (`routes.ts`) forwards **every** request — pages, CSS, JS, images, GET and POST — to `delphi.uniroma2.it/totem/*` with the session's cookie jar attached (`Api.proxyPage` → `Fetcher.proxy`). Because the wrapper's path structure **mirrors** Delphi's, a proxied page needs **no body rewriting at all**: its own relative links (`../emailMicrosoft/menuEmail.jsp`), root-relative assets (`/totem/style/x.css`), inline-JS navigation (`document.location='../…'`), forms, and the browser **back** button all resolve back onto `/totem/*` on the wrapper and proxy through transparently. This is why the earlier single-URL copy (`/servizi/attiva?href=…`) broke on every move and this design doesn't — the address bar matches what the page expects.

Key mechanics:
- **Auth via cookie.** Login sets an httpOnly `dw_token` cookie (`routes.ts`); `bearerToken` (`session-middleware.ts`) reads it for top-level navigations that can't send an `Authorization` header. Logout clears it.
- **No redirect-follow, no throttle.** `Fetcher.proxy` issues a single request (the scraper's 2 s throttle would make an asset-heavy page unusable) and hands any 3xx back to the browser; `Api.proxyPage` rewrites a same-origin `Location` to a wrapper-relative `/totem/…` path so the browser stays on the mirror. Cross-origin redirects (e.g. Wolfram) are left absolute.
- **Bodies.** `express.raw` captures form-POST bodies verbatim and they're forwarded with the original `Content-Type`. Delphi's `Set-Cookie` is ingested into the server-side jar, never leaked to the browser.
- **Limit** (`ponytail:` in `routes.ts`): assumes Delphi emits relative/root-relative links — true in every captured page. A hardcoded absolute `https://delphi.uniroma2.it/…` link would escape the mirror; body-rewrite those only if one ever appears.

The "Apri nel portale" button is therefore just an `<a href="{path}" target="_blank">` to the real Delphi path — no token, no special endpoint; the cookie and the mirror do the rest.

### 6.9 `stampaCertificati/preIndexCertificati.jsp` — Stampa Certificati (menu)

**Path:** `/totem/jsp/studenti/stampaCertificati/preIndexCertificati.jsp`
**Method:** GET
**Auth required:** yes
**Wrapper endpoint:** `GET /certificati`
**Cache policy:** 1h
**Parser:** `src/client/endpoints/certificati.ts`
**Captured fixture:** `tests/fixtures/preIndexCertificati.real.html`

The path is the pre-page; it 302-redirects to `indexCertificati.jsp` which has the same content. The wrapper follows the redirect manually (Fetcher.fetch() handles it).

The page has two `<table>`s:

1. **Studente block** (top): a `<table align="center">` with rows like `<tr><td class="text">Cognome</td><td class="dati">SURNAME</td></tr>`. Fields extracted: Cognome, Nome, Matricola, Corso, Tipologia Corso, Codice Corso.

2. **Certificati list**: a `<table border="0" cellpadding="0" cellspacing="10">` with a "Scelta certificato" header and an `<ul type="square">` containing `<li><a href="...">Certificato name</a></li>` items.

3. **Limit note** (warning): a `<td colspan="3" class="text">` cell with text starting with "Attenzione, è possibile stampare un solo certificato per tipologia al giorno." This note uses `<br>` tags for line breaks; cheerio's `text()` does NOT add a space at `<br>`, so the parser uses `textWithBreaks()` which replaces `<br>` with a space before extracting text.

The parser extracts the certificati by:
- Walking every `<ul>` and `<ol>` on the page.
- For each `<li>` with a child `<a>`, parsing the href into `{path, parametri}` using `URLSearchParams`.
- Filtering: only links that mention "cert" in the href or the link text are kept.

Captured certificati for the graduated student:
1. "Certificato laurea" → `certificatoLaurea.jsp`
2. "Certificato laurea con esami" → `certificatoLaureaEsami.jsp`
3. "Certificato storico" → `certificatoIscrizione.jsp?tipo=2`

The wrapper does NOT actually issue the certificato — that requires the live Delphi session and is a write-side operation. The `/certificati` endpoint just lists what's available.

### 6.10 `studenti/richiestaCertificati/indexCertificati.jsp` — Richieste Certificati (form)

**Path:** `/totem/jsp/studenti/richiestaCertificati/indexCertificati.jsp`
**Method:** GET
**Auth required:** yes (active)

This is the **REQUEST** counterpart to the stampa endpoint. The page has a `<form action="indexCertificati.jsp">` with three checkboxes for the cert type:
```html
<input type="checkbox" name="tipoCertificato" value="2"> Certificato storico carriera dello studente
<input type="checkbox" name="tipoCertificato" value="1"> Certificato di iscrizione con esami sostenuti
<input type="checkbox" name="tipoCertificato" value="0"> Certificato di iscrizione
```
plus hidden `bollo=1`, hidden `motivo=-1`, and radio `lingua=0/1`.

Not yet wrapped. Tier 1 in the plan.

### 6.11 `prenotazioni/menuPrenotazioni.jsp` — Prenotazione esami (menu)

**Path:** `/totem/jsp/prenotazioni/menuPrenotazioni.jsp`
**Method:** GET
**Auth required:** yes (active)

A 3-item menu under "Area Esami":
1. "Prenota Esame" → `preVisualizzaPrenotabiliEmail.jsp`
2. "Visualizza o Cancella Prenotazioni" → `submenuPrenotazioni.jsp`
3. "Calendario Prove di Esame" → `calendarioEsami.jsp`

Not yet wrapped. Tier 1/2 in the plan.

### 6.12 `prenotazioni/preVisualizzaPrenotabiliEmail.jsp` — Booking step 1

**Path:** `/totem/jsp/prenotazioni/preVisualizzaPrenotabiliEmail.jsp`
**Method:** GET → form, POST → step 2

The page is an email confirmation form:
```html
<form method="post" action="preVisualizzaPrenotabiliEmail.jsp" name="cerca">
  <input type="text" name="email" size="60" maxlength="128" value="<STUDENT_EMAIL>">  ← pre-filled
  <input type="submit" name="avanti" value="Avanti">
</form>
```

When fetched directly (without the `?Entra=` flow), the page returns a Tomcat 404. The correct way to navigate is:
1. GET `menuPrenotazioni.jsp` (which sets up some session state).
2. GET `menuPrenotazioni.jsp?Entra=preVisualizzaPrenotabiliEmail.jsp` which renders the email form.
3. POST the form with the email.
4. The next step is presumably the list of bookable exams.

Not yet wrapped. Tier 2 in the plan.

### 6.13 `prenotazioni/submenuPrenotazioni.jsp` — Visualizza/cancella menu

**Path:** `/totem/jsp/prenotazioni/submenuPrenotazioni.jsp`
**Method:** GET
**Auth required:** yes (active)

A 2-item menu under "Area Prenotazioni":
1. "Solo Prenotazioni Attive" → `submenuPrenotazioni.jsp?Entra=visualizzaPrenotazioni.jsp&attiva=si`
2. "Tutte le Prenotazioni" → `submenuPrenotazioni.jsp?Entra=visualizzaPrenotazioni.jsp&attiva=no`

The visualizzaPrenotazioni page returns the list of my bookings. For the test student, it's empty: "Non risultano prenotazioni per lo studente per il criterio di ricerca scelto".

Not yet wrapped. Tier 2 in the plan.

### 6.14 `prenotazioni/calendarioEsami.jsp` — Calendario prove d'esame

**Path:** `/totem/jsp/prenotazioni/calendarioEsami.jsp`
**Method:** GET → form, POST → results
**Auth required:** yes (active)

This is the **killer feature** for an LINFO student app. A searchable calendar of all upcoming exams.

The form has:
- **Iniziale esame** (radio): 27 radio buttons for "Tutte", "A", "B", ..., "Z" (one per letter, all uppercase letters).
- **Anno Accademico** (select): 2002/2003 → 2026/2027.
- **Sessione** (select): TUTTE, ESTIVA, ESTIVA ANTICIPATA, AUTUNNALE, INVERNALE, STRAORDINARIA.
- **Data inizio / Data fine** (text, format `gg/mm/aaaa`).

Form action: `POST ../prenotazioni/calendarioEsami.jsp`. The results page is server-rendered HTML (not ASP.NET), so the parser will be straightforward.

Not yet wrapped. Tier 2 in the plan.

### 6.15 `studenti/pianoDiStudi/index.jsp` — Piano di studi (GOMP 2010 wrapper)

**Path:** `/totem/jsp/studenti/pianoDiStudi/index.jsp`
**Method:** GET
**Auth required:** yes (active)

This page is a Delphi JSP wrapper around **GOMP 2010**. The page itself contains:

- **Header section**: studente (e.g. "SURNAME NAME"), matricola, codice fiscale, corso di studi ("Lingue nella Società dell'Informazione, Manifesto A./A. 2024/2025 classe L-11").
- **Piani table**: `<table class="SearchResultsTable" id="ctl00_contents_PSGrid">` with columns A/A, Ultima modifica, Denominazione, Status, Azione. Each row links to `Composer.aspx?PS=<uuid>&CodiceAteneo=` for the piano detail (this is the GOMP composer, see §7).
- **New piano link**: "Compila un nuovo percorso formativo" → `Composer.aspx`.

The page is full of ASP.NET WebForms machinery (`__VIEWSTATE`, `__EVENTTARGET`, `__doPostBack`, `aspnetForm`, `ctl00_*` control IDs). The form posts to `./ElencoPiani.aspx` which 404s when fetched directly — the page is only navigable via the JavaScript postback that Delphi injects.

The wrapper's plan is to extract just the static header + the list of piani from the table; the actual composer (clicking through to a specific piano) is left as a `composerUrl` field that the SPA renders as an "Apri nel portale" link.

Not yet wrapped. Tier 1 in the plan.

### 6.16 `studenti/esami/esamiPendenti.jsp` — Esami in verbalizzazione

**Path:** `/totem/jsp/studenti/esami/esamiPendenti.jsp`
**Method:** GET
**Auth required:** yes (active)

A `<table>` with header rows in `<td class="riepilogo" colspan="9">` (studente/matricola/CDL) and `<td class="msggenerico" colspan="9">` ("Utilizzare esclusivamente qualora si riscontrino difformità"). Data columns: N., Esame, SSD, AA, Data, Crediti, Esito, Voto, N. verbale.

For the test student, the table contains exactly one row: "Non ci sono esami in corso di verbalizzazione".

Not yet wrapped. Tier 1 in the plan.

### 6.17 `studenti/esami/verbaliNonChiusi.jsp` — Verbali non chiusi

**Path:** `/totem/jsp/studenti/esami/verbaliNonChiusi.jsp`
**Method:** GET
**Auth required:** yes (active)

Same shape as esamiPendenti but with 7 columns: N., Esame, Docente, AA, Data, Crediti, N. verbale. The "Docente" column has the prefix "Prof. " (e.g. "Prof. FIRSTNAME LASTNAME"). The header text says "Elenco verbali di interesse non chiusi".

For the test student, exactly one row: a single course by "Prof. FIRSTNAME LASTNAME", AA YYYY/YYYY, data DD/MM/YYYY, N CFU, verbale LETT-NNNNNNN.

Not yet wrapped. Tier 1 in the plan.

### 6.18 `studenti/laurea/indexLaurea.jsp` — Gestione domanda di laurea (istruzioni)

**Path:** `/totem/jsp/studenti/laurea/indexLaurea.jsp`
**Method:** GET
**Auth required:** yes (active)

A long instructions page titled "Domanda di laurea: ISTRUZIONI" with 7 numbered phases (Stampa Dichiarazione, Compilazione online, Pagamento bollettino, Questionario AlmaLaurea, Convalida pagamento, Raccolta documentazione, Scadenza). The phases have `<ol>` and `<ul>` lists.

Not yet wrapped. Tier 1 in the plan.

### 6.19 `studenti/laurea/indexFrontespizio.jsp` — Frontespizio tesi (form)

**Path:** `/totem/jsp/studenti/laurea/indexFrontespizio.jsp`
**Method:** GET
**Auth required:** yes (active)

A form for the frontespizio della tesi. The form fields aren't fully captured (need to look at the post-login form).

Not yet wrapped. Tier 1 in the plan.

### 6.20 `IscCorsiStudente/menuIscrizioni.jsp` — Frequenza corsi (menu)

**Path:** `/totem/jsp/IscCorsiStudente/menuIscrizioni.jsp`
**Method:** GET
**Auth required:** yes (active)

A 2-item menu under "Area Corsi":
1. "Iscrizione al corso" → `menuIscrizioni.jsp?Entra=preVisualizzaIscrivibiliEmail.jsp`
2. "Visualizza o Cancella Iscrizioni" → `menuIscrizioni.jsp?Entra=visualizzaIscrizioni.jsp`

The flow mirrors the prenotazioni one: email confirmation → list of bookable courses → confirmation. The visualizzaIscrizioni endpoint shows my current courses.

Not yet wrapped. Tier 2 in the plan.

### 6.21 `studenti/autorizzaAccessoInps/autorizzazione.jsp` — Acquisizione ISEE

**Path:** `/totem/jsp/studenti/autorizzaAccessoInps/autorizzazione.jsp`
**Method:** GET
**Auth required:** yes (active)

A form for authorizing the university to fetch ISEE from INPS (Italian tax authority). Not yet captured in detail.

Not yet wrapped. Tier 1 in the plan.

### 6.22 `studenti/benefici/menu.jsp?tipoDomanda=11` — Collaborazione part-time

**Path:** `/totem/jsp/studenti/benefici/menu.jsp?tipoDomanda=11`
**Method:** GET
**Auth required:** yes (active)

A menu for the "Domanda per incarico di collaborazione part-time" service. Not yet captured in detail.

Not yet wrapped. Tier 1 in the plan.

### 6.23 `stampa.pdf?tipoStampa=N` — PDF binary endpoint

**Path:** `/totem/jsp/stampa.pdf?tipoStampa=N`
**Method:** GET
**Auth required:** yes (active)

Returns a real PDF binary (Content-Type: application/pdf). The `N` parameter is the type of print: `43` = "Ristampa richiesta iscrizione a tempo parziale".

This is a binary response; the wrapper exposes it as `GET /stampa?tipo=N` which uses `Fetcher.fetchBinary()` to proxy the PDF inline with `Content-Disposition: inline; filename="stampa-<N>.pdf"`.

Not yet wrapped. Tier 1 in the plan.

---

## 7. The GOMP 2010 sub-system

### 7.1 What GOMP is

GOMP (Gestione Ordinamenti, Manifesti, Prenotazioni) is a **separate ASP.NET application** hosted at `https://uniroma2studenti.gomp.it/`. It is **not** under `delphi.uniroma2.it`; the two systems share an SSO but are operated by different teams (Delphi is the older Segreterie system, GOMP is a commercial product from BeSmart).

GOMP 2010 handles, for active students:
- Piano di studi (compilation, presentation, approval)
- Questionari (AlmaLaurea etc.)
- Prenotazione appelli (the same prenotazioni we see in Delphi's JSP menu, but rendered as ASP.NET)

GOMP is **embedded inside some Delphi pages** as a wrapper (see `studenti/pianoDiStudi/index.jsp`), but the bulk of GOMP lives at `uniroma2studenti.gomp.it/WorkFlow2011/...`.

### 7.2 Why we are not implementing GOMP scraping directly

1. **The active student has no separate GOMP credentials.** GOMP expects a `UserName`/`UserPassword` pair that is **not** the Delphi matricola. The user confirmed: "it does NOT have a separate access cred. when you try going on the GOMP website without an access token, it redirects to delphi. it is accessed through delphi." (Direct quote from the user.)

2. **The SSO chain is not reproducible from curl.** When we hit `https://uniroma2studenti.gomp.it/WorkFlow2011/Studenti/Composer/ElencoPiani.aspx` with a valid Delphi session cookie, the redirect chain is:
   ```
   GET /WorkFlow2011/Studenti/Composer/ElencoPiani.aspx
     → 302 /WorkFlow2011/Logon/Logon.aspx?ReturnUrl=...
     → 302 https://delphi.uniroma2.it/totem/jsp/Iscrizioni/sStudentiLoginIntro.jsp
     → 200 (Delphi login form)
   ```
   The chain doesn't auto-redirect back to GOMP with a valid session because the GOMP/Delphi SSO handshake requires browser-side state (likely a session-bound `Gomp2011Logon` cookie that the wrapper's manual redirect doesn't propagate).

3. **The actual GOMP login form (which we did find, at `https://uniroma2studenti.gomp.it/WorkFlow2011/Logon/Logon.aspx`) rejected our test credentials silently.** We POSTed the active student's username + password + the `__VIEWSTATE` / `__EVENTVALIDATION` / `__VIEWSTATEGENERATOR` tokens to `Logon.aspx?ReturnUrl=...`. The server returned the same login form (no error, no redirect, no Gomp2011Logon cookie set). This confirms: the GOMP username is not the matricola, and there's no other way to authenticate without the right credential.

4. **The piano composer (`Composer.aspx`) is a real ASP.NET WebForms page** with `__VIEWSTATE`, `__EVENTVALIDATION`, and `__EVENTTARGET` machinery. Simulating this from a headless client is fragile because the viewstate token is bound to the ASP.NET session and changes on every request. The only reliable way to scrape it is via a real browser (Selenium, Playwright) which the wrapper explicitly does not use.

5. **The user explicitly said "stop thinking"** when we hit these walls. The pragmatic decision is to scope GOMP out entirely; the value is in the Delphi Segreterie pages, not the GOMP composer.

### 7.3 The GOMP login page (for reference)

The GOMP logon page at `https://uniroma2studenti.gomp.it/WorkFlow2011/Logon/Logon.aspx` is an ASP.NET WebForms page with this shape:

```html
<form method="post" action="./Logon.aspx?ReturnUrl=%2fWorkFlow2011%2fStudenti%2fComposer%2fElencoPiani.aspx" id="aspnetForm">
  <input type="hidden" name="__EVENTTARGET" value="" />
  <input type="hidden" name="__EVENTARGUMENT" value="" />
  <input type="hidden" name="__VIEWSTATE" value="..." />
  <input type="hidden" name="__VIEWSTATEGENERATOR" value="FE14CCE7" />
  <input type="hidden" name="__EVENTVALIDATION" value="..." />
  <span>Nome utente:</span>
  <input name="ctl01$contents$UserName" type="text" />
  <span>Password:</span>
  <input name="ctl01$contents$UserPassword" type="password" />
  <input type="submit" name="ctl01$contents$LogonButton" value="Accedi" />
  <a href="../../PublicArea/LostPassword/LostPassword.aspx">Password dimenticata?</a>
  <a href="../../PublicArea/Registrazione/Registrazione.aspx">Non sei registrato? Registrati ora</a>
</form>
```

Notable: the page also supports **SPID/CIE** login via a "spid-sp-access-button" widget, with a list of Italian IdPs. Both Delphi and GOMP expose SPID login. The flow is JavaScript-driven and we cannot reproduce it from curl.

### 7.4 The GOMP SSO chain (for reference)

The full chain we observed when fetching `https://uniroma2studenti.gomp.it/WorkFlow2011/Studenti/Composer/ElencoPiani.aspx` without any session:

```
1. GOMP composer: 302 Found
   Set-Cookie: ASP.NET_SessionId=vl1eqh2s0y1v4cwga10db3w3; path=/; HttpOnly
   Location: /WorkFlow2011/Logon/Logon.aspx?ReturnUrl=%2fWorkFlow2011%2fStudenti%2fComposer%2fElencoPiani.aspx

2. GOMP logon: 302 Found
   Set-Cookie: ASP.NET_SessionId=qnes3ieuwfug3iq001svu2wz; path=/; HttpOnly
   Set-Cookie: Gomp2011Logon=; expires=Mon, 11-Oct-1999 22:00:00 GMT  ← clears stale GOMP session
   Location: https://delphi.uniroma2.it/totem/jsp/Iscrizioni/sStudentiLoginIntro.jsp

3. Delphi login: 200 OK
   Set-Cookie: JSESSIONID=<SESSION_ID>; Path=/totem; Secure
   (HTML login form)
```

The expected final hop (GOMP accepting the Delphi session) is missing from our flow. The probable correct sequence in a real browser is:
1. GET GOMP composer (no cookies) → 302 to GOMP logon
2. GET GOMP logon (with ASP.NET_SessionId) → 302 to Delphi login
3. Browser shows Delphi login, user enters creds, POSTs to `sStudentiLoginIntro.jsp`
4. Delphi authenticates, returns 302 to `sStudentiLaureatiLogin.jsp` (or `sStudentiRegolariLogin.jsp`) **but with the original ReturnUrl appended** to a special GOMP-bridge URL
5. The Delphi page then bridges to GOMP with the Gomp2011Logon cookie set, and GOMP accepts the session.

That step 4-5 is the missing piece. The wrapper's manual redirect handling follows the location header, but Delphi's response doesn't carry the GOMP ReturnUrl in the Location — it just redirects to its own dashboard. So we never bridge back to GOMP.

Possible workarounds (not implemented):
- Capture the GOMP ReturnUrl from the second 302, save it in the wrapper's session, and after a successful Delphi login do a separate `GET <GOMP ReturnUrl>` to bridge.
- Drive a real headless browser (Playwright) for the SSO hop.
- Have the user provide separate GOMP credentials and skip SSO.

All three are out of scope for now. The user explicitly abandoned the GOMP integration, so we keep the Delphi-only scope.

---

## 8. Wrapper architecture

This section describes the wrapper code in detail, with file paths and the key design decisions for each component.

### 8.1 Process startup

`src/index.ts` is the main entrypoint. The flow:

1. `loadConfig()` — zod-validates env, throws on error.
2. `new CacheStore(config)` — opens sqlite, runs migrations.
3. `Fetcher.create(config.baseUrl, 2000)` — creates undici Client with 2-second gap throttle.
4. `new Session(fetcher, store)` — owns the cookie jar.
5. `new Api({ fetcher, session, store, config })` — orchestrator.
6. `createLoginLimiter()` — 5 attempts per 60s for /session/login.
7. `app.use(express.json({ limit: "32kb" }))` — body parser.
8. `app.use(requestLogger)` — pino request logger.
9. `app.use("/session/login", loginLimiter)` — rate limit.
10. `app.use(buildRoutes({ api, session, version, matricola }))` — routes.
11. `app.use(errorHandler)` — final error handler.
12. `await session.restore()` — best-effort, non-fatal.
13. `server.listen(config.port)`.
14. `SIGINT`/`SIGTERM` → graceful shutdown: close server, close store, close fetcher. `setTimeout(process.exit(1), 5_000)` as a hard-exit fallback.

### 8.2 Configuration (`src/config.ts`)

`loadConfig()` is a memoized function (`cachedConfig: AppConfig | null`) that runs zod validation once. The schema uses `superRefine` to check for missing keys with a custom error message that includes the `node -e` command to generate a key.

The returned `AppConfig` has:
- `matricola: string` — the DELPHI_MATRICOLA value.
- `password: string` — the DELPHI_PASSWORD value.
- `sessionKey: Buffer` — the 32-byte hex-decoded key.
- `baseUrl: string` — DELPHI_BASE_URL, trailing slashes stripped.
- `port: number` — PORT.
- `logLevel: string` — LOG_LEVEL.
- `cachePath: string` — DELPHI_CACHE_PATH (resolved relative to `process.cwd()`).
- `nodeEnv: string` — NODE_ENV.

`generateSessionKey()` is exported as a helper for operators who need to mint a new key.

### 8.3 Logging (`src/logger.ts`)

A single `logger` instance exported from the module. Created at import time (so it can use the env-derived `logLevel` and `nodeEnv`).

Pino redact paths (see §3 for the full list). The pino-pretty transport is configured only when `nodeEnv !== "production"`.

### 8.4 The `Fetcher` (`src/client/fetcher.ts`)

The most complex client class. Responsibilities:
1. Maintain an undici `Client` per base URL (keep-alive).
2. Maintain a `CookieJar` that gets re-attached on every request.
3. Follow 3xx redirects manually (up to 5 hops), downgrading 30x to GET (matching curl `-L` semantics).
4. Map status codes to typed errors: `RetryableError` for 5xx, `NonRetryableError` for 401/403.
5. Run every request through the throttle + retry helpers.

Why manual redirect handling? **undici's auto-redirect drops our session cookie on cross-domain hops** (e.g. when `preIndexCertificati.jsp` 302s to `indexCertificati.jsp` on the same host, or when GOMP 302s to Delphi). Setting `maxRedirections: 0` and implementing the loop ourselves fixes this.

The class exposes:
- `static create(baseUrl, minGapMs): Fetcher`
- `fetch(path, init?): Promise<FetcherResponse>` — text response, with redirect following.
- `fetchBinary(path, init?): Promise<FetcherBinaryResponse>` — PDF/binary response, with redirect following.
- `get(path): Promise<FetcherResponse>` — convenience for GET.
- `postForm(path, formData): Promise<FetcherResponse>` — convenience for POST with form data.
- `hasCookies(): boolean`
- `clearCookies(): void`
- `close(): Promise<void>`

The private `rawRequest()` method does a single hop: builds headers (with `User-Agent`, `Accept`, `Accept-Language`, `Cookie` from the jar), calls `client.request()`, ingests any new cookies, reads the body as text (or `arrayBuffer` for binary), and returns `{status, body, contentType, location}`.

`fetch()` then loops: while the response is 3xx and we have a `Location` header, resolve the location relative to the base URL and re-fetch. After the loop, classify the final status into the right error type or return the body.

The `User-Agent` is hardcoded to: `Mozilla/5.0 (X11; Linux x86_64) delphi-wrapper/0.1 (student-portal)`. This is a deliberate honesty: we identify ourselves to Delphi.

### 8.5 The `CookieJar` (`src/client/cookie-jar.ts`)

A minimal `Map<string, string>` wrapper. Supports two input shapes:
- Web `Headers` (from `fetch`), with `getSetCookie()`.
- undici plain-object headers (`Record<string, string|string[]>`).

`ingest()` normalises both shapes and applies each `set-cookie` line. `toHeader()` joins them as `name=value; name=value` for the next request. `hasAny()` and `clear()` are obvious.

The "domain" of the cookies is implicit; we only ever attach the jar to requests against the configured `baseUrl`, so cross-domain leakage isn't a concern in practice.

### 8.6 The `Session` (`src/client/session.ts`)

Wraps the login/logout/restore flow around a single `SessionRecord` in the encrypted cache.

The state machine:
- `logged_out` → just booted, or just logged out
- `logging_in` → `login()` is in progress
- `logged_in` → `record` is set, cookies in the jar
- `expired` → a request returned `NonRetryableError` and we're about to re-login
- `failed` → `login()` threw, `lastError` is set

The login flow:
1. Clear cookies.
2. GET `autenticazione.jsp?language=IT` (warmup).
3. POST `sStudentiLoginIntro.jsp` with `login`, `password`, `entra` (form fields discovered in §6.1).
4. Verify that the response is not 401/403 and that we have cookies; otherwise throw `NonRetryableError("invalid_credentials")`.
5. Save the resulting `Cookie: ...` header to the encrypted store via `store.saveSession(cookieHeader)`.

`request<T>(fn, fallbackLogin)` is the "do something" wrapper:
1. If not logged in, log in using `fallbackLogin()` to get creds.
2. Run `fn(fetcher)`.
3. If the result was a `NonRetryableError`, re-login once transparently and retry.

`restore()` is called at boot. It loads the latest session from the store, re-injects the cookies into the jar, and probes with a GET to `sStudentiLoginProcess.jsp?language=IT`. If the probe returns 2xx, the session is still valid; if it returns 401/403, the session is deleted and we boot as `logged_out`.

The fallback creds come from `Api.fallbackCreds()` which returns the `DELPHI_MATRICOLA` / `DELPHI_PASSWORD` from the config.

### 8.7 The `Throttle` (`src/utils/throttle.ts`)

A serialising mutex with a minimum inter-task gap. The implementation is a queue of `() => void` callbacks that the `pump()` function dequeues, with a `setTimeout(wait)` to enforce the gap. `lastReleaseAt` is updated to `Date.now()` BEFORE running the next task so the gap is measured between task-ends, not task-starts.

API:
- `run<T>(fn: () => Promise<T>): Promise<T>` — enqueue + run.
- `pending(): number` — number of tasks waiting + in-flight.
- `reset(): void` — drop the queue, clear `lastReleaseAt`.

The 2-second gap is calibrated against the live Delphi server, which throttles at ~1 req/sec for the same session. The test `tests/throttle.test.ts` includes a 2-second "production-like" test that takes ~4.5 seconds to run.

### 8.8 The retry helper (`src/utils/retry.ts`)

`withBackoff(fn, opts)` runs `fn` up to `opts.attempts` times (default 3), with exponential backoff (`baseDelayMs * multiplier^(attempt-1)`, defaults 1000ms * 4 → 1s, 4s, 16s). Retries only when `opts.shouldRetry(err)` is true.

`RetryableError` and `NonRetryableError` are subclasses of `Error` with `name = "RetryableError"` / `"NonRetryableError"`. The wrapper uses these to distinguish retryable 5xx from non-retryable auth failures (401/403).

### 8.9 The `CacheStore` (`src/cache/store.ts`)

A `better-sqlite3` wrapper that owns two tables:

```sql
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  ttl_ms INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  cookies_json TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
```

API:
- `get(key): string | null` — returns the value if the TTL hasn't expired, else null.
- `getStale(key): string | null` — returns the value regardless of TTL (used for stale-cache fallback).
- `set(key, value, ttlMs): void` — upsert.
- `delete(key): void` — remove.

For sessions:
- `saveSession(cookies, ttlMs?): SessionRecord` — encrypts the cookie header with AES-256-GCM, inserts a row, returns the record. The `id` is a UUIDv4.
- `loadSession(id): SessionRecord | null` — decrypts, returns. If decryption fails (e.g. sessionKey changed), the row is deleted and null is returned.
- `loadLatestSession(): SessionRecord | null` — same but picks the most recent row.
- `deleteSession(id): void`.

The encryption format is `iv.tag.ciphertext` base64, joined by `.`. The `createCipheriv` / `createDecipheriv` calls use AES-256-GCM with the sessionKey from the config.

### 8.10 The `CachePolicy` (`src/cache/policies.ts`)

Per-field TTLs:

| Field | TTL | Notes |
|---|---|---|
| `esamiSostenuti` | forever (0) | Refreshed on demand. |
| `carrieraHeader` | forever | Same. |
| `rendimento` | forever | Same. |
| `anagrafica` | 24h | |
| `pianoStudi` | 24h | |
| `appelliAperti` | 5min | Time-sensitive. |
| `postiDisponibili` | 1min | |
| `bollettini` | 1h | |
| `servizi` | 24h | |
| `certificati` | 1h | |
| `defaultTtlMs` (session) | 12h | |

The `CachePolicy` object is a `const`, so the values are inlined at the call sites by TypeScript. The `SessionPolicy.defaultTtlMs` is the default for new sessions unless the caller passes a different TTL.

### 8.11 The `Api` orchestrator (`src/server/api.ts`)

The `Api` class is the high-level facade. Every public method follows the same pattern:

```typescript
async getX(): Promise<{ response: X; stale: boolean }> {
  const { outcome } = await this.withCache<X>(
    "cache-key",
    CachePolicy.x,
    async () => {
      const html = await this.deps.session.request(
        (f) => f.get(PATH_X),
        this.fallbackCreds,
      );
      const parsed = parser.parse(html.body, this.deps.config.baseUrl);
      if (isEmptyResponse(parsed)) {
        throw new NonRetryableError("empty x response");
      }
      return parsed;
    },
  );
  return { response: outcome.data, stale: outcome.kind === "stale" };
}
```

`withCache<T>` is the inner helper:
1. Check the cache with `store.get(key)`. If hit, parse and return `{kind: "ok", data}`.
2. If miss, run `loader()`. On success, write to cache and return `{kind: "ok", data}`.
3. On error, log and check `store.getStale(key)`. If hit, return `{kind: "stale", data}`.
4. On any other failure, re-throw.

The `stale` flag in the public API is what the HTTP layer translates into the `X-Cache-Stale: true` response header.

`fallbackCreds()` returns the config's matricola + password, used by `session.request` for transparent re-login.

`isInvalidCredentials(err)` is a convenience used by the HTTP layer to translate `NonRetryableError("invalid_credentials")` into a 401 response.

The public methods:
- `getCarriera()` — full carriera (header + esami + rendimento).
- `getEsami(filter)` — filtered esami with summary.
- `getAppelli(insegnamento)` — list of appelli.
- `getPiano()` — piano di studi.
- `getAnagrafica()` — anagrafica record.
- `getBollettini()` — tasse.
- `getRicevuta(req)` — PDF ricevuta via fetchBinary.
- `getServizi()` — servizi list.
- `getCertificati()` — certificati list.

The Delphi path constants (PATH_CARRIERA, PATH_ANAGRAFICA, etc.) are defined at the top of the file. The comment block above them explains which paths work for which account type.

### 8.12 The Express routes (`src/server/routes.ts`)

`buildRoutes(deps)` returns a `Router`. The route order matters: more specific routes first, fallbacks last.

Routes:

| Method | Path | Handler |
|---|---|---|
| GET | `/health` | `{ok: true, version}` |
| GET | `/config` | `{matricola, version}` (no password) |
| GET | `/` | Rendered SPA shell |
| GET | `/static/styles.css` | static asset (searched in 3 paths) |
| GET | `/static/app.js` | static asset (searched in 3 paths) |
| GET | `/session/status` | From `session.info()` |
| POST | `/session/login` | `session.login()` |
| POST | `/session/logout` | `session.logout()` |
| GET | `/carriera` | `api.getCarriera()` |
| GET | `/carriera/esami` | `api.getEsami(filter)` with query-param parsing |
| GET | `/appelli` | `api.getAppelli(insegnamento)` |
| GET | `/piano` | `api.getPiano()` |
| GET | `/anagrafica` | `api.getAnagrafica()` |
| GET | `/tasse` | `api.getBollettini()` |
| GET | `/tasse/ricevuta` | `api.getRicevuta(req)` (PDF inline) |
| GET | `/servizi` | `api.getServizi()` |
| GET | `/certificati` | `api.getCertificati()` |

The static asset lookup tries three paths in order: `dist/server/static/...` (when running compiled), then `src/server/static/...` (when running via tsx), then `process.cwd()/src/server/static/...`. This makes the wrapper work in both `npm run dev` and `npm start` modes without copying files around.

The query-param parsing for `/carriera/esami` uses three small helpers:
- `parseStatoFilter(value)`: comma-separated stato list.
- `parseBool(value)`: "true"/"1"/"false"/"0" → boolean.
- `parseIntQuery(value)`: integer, or undefined.

Errors are mapped via the `describeError()` function in the SPA (client side); the server returns JSON like `{error: "delphi_unavailable"}` with status 503, 401, 429, etc.

### 8.13 Session middleware (`src/server/session-middleware.ts`)

Two tiny middlewares:

- `requestLogger(req, res, next)`: starts a `process.hrtime.bigint()` timer, registers a `res.on("finish")` listener that logs the duration, status, method, path via pino.
- `errorHandler(err, req, res, next)`: final error handler. Logs the error, sends `{error: "internal_error"}` with status 500 if the response hasn't been sent yet.

The login rate limiter lives in `src/index.ts` (not in `session-middleware.ts`): it uses an in-memory counter (`LOGIN_RATE_WINDOW_MS = 60_000`, `LOGIN_RATE_MAX = 5`) and returns 429 with `Retry-After` and `{error: "rate_limited", retryAfterMs}` if exceeded.

### 8.14 The SPA shell (`src/server/static/index.html.ts`)

Renders the HTML shell as a TypeScript template literal. The shell has:
- A skip-link for accessibility.
- An app header with brand dot + identity + logout button (visible only when logged in).
- A login form (visible only when not logged in).
- A dashboard with 8 tabs (Riepilogo, Esami, Appelli, Piano, Tasse, Servizi, Certificati, Anagrafica).
- A loading state.
- A footer with the version.

Each tab panel has:
- A title + refresh link.
- A "stale" hint (hidden by default, shown when `X-Cache-Stale`).
- A body div that the SPA controller populates.

The Esami panel additionally has a filter form (nome, SSD, AA, stato) that posts to `loadTab("esami", {force: true})`. The Appelli panel has a codice-insegnamento search form.

`escapeAttr()` is a tiny HTML-attribute escaper used to inject the version into the title and footer.

### 8.15 The SPA controller (`src/server/static/app.js`)

~700 lines of vanilla JavaScript (no framework, no build step). Key state:

```javascript
const state = {
  matricola: "",
  version: "",
  versionFromConfig: "",
  activeTab: "riepilogo",
  loadedTabs: new Set(),
  appelliCodice: "",
  esamiFilter: { nome: "", ssd: "", aa: "", stato: "" },
  carriera: null,
  carrieraStale: false,
};
```

The `TABS` array is the source of truth for tab order: `["riepilogo", "esami", "appelli", "piano", "tasse", "servizi", "certificati", "anagrafica"]`.

The bootstrap flow:
1. `onReady(bootstrap)`.
2. Element lookups into the `els` object.
3. `showLoading()`.
4. Fetch `/config` to get matricola + version.
5. Fetch `/session/status` to know if we're logged in.
6. If logged in, `enterDashboard()`; else `showLogin()`.
7. `wireEvents()` to attach event handlers.
8. `updatePageTitle()`.

`api(path, init)` is a thin `fetch` wrapper that:
- Sets `Accept: application/json`.
- Reads `X-Cache-Stale` from the response.
- Parses JSON or returns `{error: "invalid_response"}`.

`describeError(status, body)` is the i18n mapper from `{error: "..."}` codes to Italian strings. The codes: `invalid_credentials`, `missing_credentials`, `rate_limited`, `delphi_unavailable`, `missing_insegnamento`, `missing_bollettinoId`.

Tab loaders (`LOADER_BY_TAB`): one per tab, returns `{data, stale}` or null. The `appelli` loader short-circuits if no codice is set, calling `renderAppelliPrompt()`.

Renderers (`renderByTab`): one per tab. Each clears the body div, then builds the DOM via the `el(tag, attrs, children)` helper.

Key renderer details:
- `renderRiepilogo`: shows studente/matricola/cdl as cards, then the rendimento stats, then the esami summary.
- `renderEsami`: groups esami by stato (superato/in_corso/non_superato/idoneo) and shows a section per group, with the filter form's summary at the top.
- `renderAppelli`: simple table with codice/insegnamento/data/posti/iscritti/stato.
- `renderPiano`: header with CDL/anno + table of esami.
- `renderAnagrafica`: photo (if URL), dl list, and cards for residenza/domicilio/carriera. Falls through to a "Laurea" card if `data.laurea` is present.
- `renderTasse`: nested per-AA sections, with rate/bollettino blocks. Each bollettino has its own header (importo, causale, data, IUV, pagoPA badge, ricevuta link) and a dettaglio ul. The "Altri bollettini" section is rendered at the end.
- `renderServizi`: card grid with link + descrizione.
- `renderCertificati`: card grid with the warning note from the "Attenzione" cell and the cert link/path/params.

The `fmtDate(it)` helper formats ISO `YYYY-MM-DD` to Italian `dd/mm/yyyy`. `fmtEuro(v)` formats number → "€ X,YZ".

### 8.16 The design system (`src/server/static/styles.css`)

~700 lines of CSS with these design tokens (DESIGN.md requires this register):

- Off-white surface, near-black ink, one accent (Tor Vergata red used sparingly).
- OKLCH color space for perceptual evenness.
- System font stack for body, JetBrains Mono for code.
- Spacing scale: 4/8/12/16/24/32/48 px (`--s-1` … `--s-7`).
- Status colors: ok/bad/warn/idle.

Layout patterns:
- Single-column app shell, max-width 960px.
- Header: brand + identity + logout, separated by a 1px rule.
- Tabs: underline-style with the accent color for the active one.
- Tables: zebra-striped (`tbody tr:nth-child(odd) td` background).
- Definition lists: 2-column with monospace dt, regular dd.
- Cards: 1px border, off-white background, 4px radius.

Component classes:
- `.riepilogo-summary` / `.riepilogo-card` / `.riepilogo-stats` — the Riepilogo tab layout.
- `.esami-summary` — the summary banner at the top of Esami.
- `.anagrafica-photo` / `.anagrafica-cards` / `.anagrafica-card` — the Anagrafica layout.
- `.tasse-head` / `.tasse-iscrizione` / `.tasse-anno` / `.tasse-rata` / `.tasse-bollettino` / `.tasse-dettaglio` — the Tasse layout.
- `.servizi-list` — card grid.
- `.certificati-head` / `.certificati-warning` / `.certificati-list` — the Certificati layout.

Reduced-motion media query zeroes out transitions. Small screen media query (max-width 600px) collapses the grids to single column.

---

## 9. The parsers in detail

This section records every parser, its contract, the live quirks it handles, and the test coverage. The parsers live in `src/client/endpoints/*.ts`; each exports a `parse(html, baseUrl)` function that returns a typed domain object.

### 9.1 anagrafica.ts

**Input:** HTML of `datiStudente.jsp`.
**Output:** `Anagrafica` (see `src/types.ts`).
**Parser strategy:**

1. Walk every `<tr>` in the `table.tabelladatipersonali`.
2. Section headers are `<td class="boxsfondotabella">`. For these, strip the inner `<a>` tags (the "Modifica" link), then split on `(` and trim to get the canonical section name (e.g. "Residenza ( eletto a recapito postale )" → "residenza").
3. Label/value rows are `<td class="text">` + `<td class="dati">`. Walk `.nextAll("td.dati")` from the label cell to find the value.
4. Store in `Map<sectionName, Map<label, value>>`.
5. Compose the `Anagrafica` result from the labeled fields.

Quirks handled:
- "AA ultima iscrizione" with parenthetical: regex `^(\d{4}\/\d{4})` to strip the `(Iscrizione cautelativa)`.
- "Anno di Corso" with words: `parseIntSafe` takes the first integer, full label preserved in `annoCorsoLabel`.
- "Codice Fiscale" vs "Codice Fiscale:" (with colon) — labels are cleaned of trailing colons by `cleanText`.
- "Dati carriera" cell: extracted as `statoCarriera`.
- "Conseguita laurea triennale in X in data DD/MM/YYYY con la votazione di V/110" cell: parsed into `laurea: {corso, data, votazione}`.
- Photo URL: extracted from the first `<img>` in the table.

Test coverage: `tests/anagrafica.test.ts` — 15 tests, 7 of which run against the captured `datiStudente.real.html` fixture and assert codiceFiscale, dataNascita, comune/provincia di nascita, cellulare, email, residenza/domicilio indirizzo/cap, facolta/corso/tipologia/sede/codiceCorso, AA immatricolazione/ultima iscrizione, nazione di cittadinanza, foto URL.

### 9.2 carriera.ts

**Input:** HTML of `esamiVerbalizzati.jsp`.
**Output:** `CarrieraResponse` with `header`, `esami[]`, `rendimento`.
**Parser strategy:**

1. `parseHeader($)`: scrape the first `<td class="riepilogo">` with regex against the text for "Studente:", "Matricola:", "Corso di Laurea:".
2. `parseRendimento($)`: scrape the last `<td class="riepilogo">` that contains "RENDIMENTO", parse the labeled stats.
3. `findTableByHeader($)`: walk every `<table>`, pick the one whose first `<tr>` has `<td class="tabella1">` cells with the strings "Esame" and "Voto" in the headers.
4. For every `<tr>` in that table, call `rowToEsame($)` and collect non-null results.

`rowToEsame($)`:
- Filter: data rows have cells with class `esamidispari` or `esamipari`. Skip rows without that.
- Cell 1 is `<codice> <nome>`. Parse with regex `^(\d{6,9})\s+(.+)$`.
- Cell 2 is the SSD (string).
- Cell 3 is the AA (parse with `^(\d{4}\/\d{4})$`).
- Cell 4 is the data (parse with DD/MM/YYYY).
- Cell 5 is the CFU (parseFloat, "--" → null).
- Cells 6+7 are voto+note — call `parseVoto()`.
- Cell 8 is the tipo attività.
- Cell 9 is the verbale number ("---" → null).
- AA fallback: if cell 3 is missing/empty, scan cells 10+ for the first YYYY/YYYY (handles the TIROCINIO inline case).

`parseVoto(voto, note, cfu)`:
- "30 E LODE" → trentesimi/30 + lode=true.
- "N/30" with N in [18..30] → trentesimi/N + lode=false.
- "IDONEO" / "APPROVATO" / "PASS" → qualifica/IDONEO + stato=idoneo.
- "OTTIMO" / "BUONO" / "DISTINTO" / "DISCRETO" / "SUFFICIENTE" → qualifica + isPartial=true (these are language partials).
- "RITIRATO" / "RESPINTO" / "BOCCIATO" → null + stato=non_superato.
- empty → null + stato=in_corso.
- Otherwise → qualifica + stato=in_corso.

Test coverage: `tests/carriera.test.ts` — 19 tests across two describe blocks. The "real fixture" block runs against `esamiVerbalizzati.real.html` and asserts:
- 28 esami parsed.
- header.studente / matricola / cdl.
- rendimento.esamiValidi=17, cfuEsamiValidi=168, idoneita=3, cfuIdoneita=12, mediaAritmetica=28.18, mediaPonderata=28.11.
- "30 E LODE" → lode=true.
- "IDONEO" → stato=idoneo.
- "SCRITTO" partial exams → isPartial=true + OTTIMO/BUONO.
- Combined language exams → SSD with comma.
- TIROCINIO → AA 2023/2024 + verbale null.
- 26/30 → label "26/30", stato superato.

### 9.3 appelli.ts

**Input:** HTML of the appelli page.
**Output:** `Appello[]`.
**Parser strategy:**

1. `findDataTable($)`: walk every `<table>` matching the selectors in `TABLE_SELECTORS` (id `tblAppelli`, classes `table-appelli`/`datatable`/etc., and `table` as fallback). For each, check that the first `<tr>` has cells with "Codice" + "Data" headers.
2. `findHeaderRow($)`: find the first row in the table with cells containing column keywords. Score by keyword matches.
3. For each row, call `rowToAppello($)` with the header row.
4. `rowToAppello`: resolve column indices via the header row, fall back to positional defaults (codice=0, data=1, postiDisp=2, postiTot=3, iscritti=4, stato=5).
5. `parseStato(label, posti, totali)`: classify the stato based on the label text or postiDisponibili.

Test coverage: `tests/appelli.test.ts` — 10 tests against a synthetic fixture. Includes the "no label, infer from postiDisponibili=0" case.

Quirks: the active student has never been able to actually test the appelli parser end-to-end because the calendarEsami search page is the real way to get appelli data; the `/appelli?insegnamento=CODICE` path is for the older single-insegnamento page which may or may not exist.

### 9.4 piano.ts

**Input:** HTML of `studenti/pianoDiStudi/index.jsp`.
**Output:** `Piano` (cdl, annoCorso, esami).
**Parser strategy:**

1. CDL: look in selectors `span#cdl`, `span.cdl`, `div.header-cdl`, `td.cdl`, `td.header-cdl`. Take the first non-empty text. Fall back to "unknown".
2. Anno corso: same pattern with ANNO_SELECTORS.
3. Find the data table (header row with "Codice" + "Insegnamento" columns).
4. For each row, parse codice/nome/cfu/anno/stato.
5. `parseStato`: "Superato" → superato, "In corso" → in_corso, anything else → da_fare.

The fallback table lookup is generous: any table with a header row containing "Codice" and "Insegnamento" (or "Nome" or "Materia") wins. This handles both the old and new GOMP templates.

Test coverage: no dedicated test file; covered indirectly through the synthetic `tests/fixtures/piano.html` fixture.

### 9.5 bollettini.ts

**Input:** HTML of `situazioneRateNew.jsp`.
**Output:** `SituazioneTasse` (studente, iscrizione, anni[], altriBollettini[]).
**Parser strategy:**

1. `parseStudente($)`: walk every `table#adempi` looking for rows with `td.intesta` labels MATRICOLA/NOME/COGNOME and `td.cella` values.
2. `parseIscrizione($)`: find the first `td.msggenerico h3` or `td.msggenerico` and extract anno (first `YYYY/YYYY`), tipo (first uppercase parenthetical, regex `/\(([A-Z][A-Z\s]{2,})\)/`), and messaggio (text after the colon, with the tipo parenthetical and the trailing "Si ricorda..." parenthetical removed).
3. Walk every `td.intesta` looking for cells whose text matches `/^AA\s+\d{4}\/\d{4}/`. For each, call `parseAnnoAccademicoSection()`.
4. `parseAnnoAccademicoSection()`: read the AA year + ISEE, then call `findRataHeaderRows()` to get the rata header rows in this section. For each rata header, call `parseRata()`.
5. `findRataHeaderRows()`: walks `tr.next("tr")` from the AA header until it hits the next AA or end. We don't use cheerio's `nextUntil` because its type signature (`Cheerio<Element>`) doesn't match our `Cheerio<AnyNode>` wrapper.
6. `parseRata()`: from the rata header row, walk to `dataRow = headerRow.next("tr")`, extract the rata number/importo/scadenza/saldato, then walk to `bollettiniRow = dataRow.next("tr")` and call `parseBollettino()`.
7. `parseBollettino()`: find the sub-table inside the row, take the first data row (esamipari cells), extract the form fields (bollettinoId/rataId/AA), the bollettino number (text sibling of the form), the importo (cell 1 strip `*`), causale, data pagamento, IUV, and the dettaglio from the subsequent data rows. Look for the "* Convalidato con pagoPA" row to set the convalidato flag.
8. `parseAltriBollettini($)`: find the h3 with text "Altre tipologie di bollettino", walk up to the parent table, take the next sibling table. For each row with 9+ cells (skip the header), extract the ricevuta form fields and the receipt data.

Test coverage: `tests/bollettini.test.ts` — 10 tests against `situazioneRateNew.real.html`. Asserts:
- studente fields.
- iscrizione.anno/tipo/messaggio.
- 4 anni accademici.
- ISEE per anno.
- 3 rate per anno (2023/24, 2022/23, 2021/22), 1 rata for 2024/25 (cautelativa).
- Rate 1 of 2023/2024: saldato=true, importo=N, 1 bollettino.
- Bollettino dettaglio: Tassa regionale, Imposta di bollo.
- Ricevuta POST fields: bollettinoId, rataId, AA.
- 1 altro bollettino (Imposta di bollo, €16).

### 9.6 servizi.ts

**Input:** HTML of `sStudentiAttivaServizi.jsp`.
**Output:** `ServiziResponse { servizi[] }`.
**Parser strategy:**

1. Look for the first `<ol>` inside a `<td class="msggenerico">` (the standard Delphi pattern). Fall back to any `<ol>` then any `<ul>`.
2. For each `<li>` in the list, call `parseListItem()`.
3. `parseListItem()`: extract the first `<a>` text (nome), the href (link), and the target/esterno classification. Concatenate all `<i>` text for descrizione.

Test coverage: `tests/servizi.test.ts` — 5 tests. Asserts 3 servizi parsed: Office365, MatLab, Mathematica. Checks the descrizione for the Office365 link, the OperazioneOK URL for MatLab, and the sStudentiAttivaLicenzaMathematica URL for Mathematica.

### 9.7 certificati.ts

**Input:** HTML of `stampaCertificati/preIndexCertificati.jsp` (or the post-redirect `indexCertificati.jsp` which has the same content).
**Output:** `CertificatiResponse { studente, certificati[], limiteNote }`.
**Parser strategy:**

1. `parseStudente($)`: walk every table, find rows with `td.text`/`td.dati` pairs for Cognome/Nome/Matricola/Corso.
2. `parseListaCertificati($)`: walk every `<ul>` and `<ol>`, find `<li>` with a child `<a>`. Parse the href into `{path, parametri}` using `URLSearchParams`. Filter to only links that mention "cert" in the href or text.
3. `parseLimite($)`: find the first `<td class="text">` cell that contains both "Attenzione" and "certificato". Use `textWithBreaks()` to convert `<br>` to spaces before extracting text.

Quirks handled:
- `<br>` not adding spaces: `textWithBreaks()` replaces `<br>` with a space before extracting.
- The page also has a "Scelta certificato" header — that's filtered by the parser's "cert" filter.

Test coverage: `tests/certificati.test.ts` — 7 tests. Asserts studente fields, 3 certificati parsed, each with the right path and parametri (notably `tipo=2` for the Certificato storico), and the limit note.

### 9.8 esami-search.ts (filter+summary helpers)

Two pure functions:

- `filterEsami(esami, filter)` — applies an `EsamiFilter` to a list of esami. AND across fields, OR within `stato` array. Filters on:
  - `nome`: case-insensitive substring on `nome`.
  - `ssd`: case-insensitive substring on `ssd`.
  - `annoAccademico`: exact match.
  - `stato`: single value or array.
  - `isPartial`: boolean.
  - `cfuMin` / `cfuMax`: integer range (null cfu fails range filters).

- `summarizeEsami(esami)` — returns an `EsamiSummary` with:
  - `totale`, `superati`, `inCorso`, `nonSuperati`, `idonei`.
  - `cfuTotali` (sum of all non-null CFU).
  - `cfuSuperati` (sum of CFU for stato=superato or idoneo).
  - `cfuMedia` (mean of trentesimi voti, rounded to 2 dp, or null).
  - `anniAccademici` (distinct, sorted).

Test coverage: `tests/esami-search.test.ts` — 12 tests. Covers all filter fields and the summary.

---

## 10. Out of scope: GOMP integration

This is restated for the record, because the user said "stop thinking" about it but the next maintainer (or the next AI agent) should know why GOMP is not wrapped.

**What we attempted:**
1. Found the canonical GOMP URL: `https://uniroma2studenti.gomp.it/WorkFlow2011/Studenti/Composer/ElencoPiani.aspx` (the piano composer).
2. Found the GOMP login page: `https://uniroma2studenti.gomp.it/WorkFlow2011/Logon/Logon.aspx` which has a real ASP.NET login form with `UserName`/`UserPassword` fields.
3. Found the GOMP SSO chain: GOMP → GOMP logon → Delphi login.
4. Attempted to log into GOMP with the active student's matricola + password — the form returned the same login form (no error, no redirect, no `Gomp2011Logon` cookie set). The GOMP username is **not** the matricola.
5. Confirmed with the user: the active student has no separate GOMP credentials, and the SSO is supposed to work through Delphi (which our manual redirect handling can't reproduce because Delphi's login response doesn't carry the original GOMP ReturnUrl in its Location header).

**Decision:** GOMP is out of scope. The wrapper exposes the Delphi JSP wrapper for the piano listing (`studenti/pianoDiStudi/index.jsp` — see §6.15) but does not attempt the GOMP composer. The SPA, when implemented, will show the "Apri nel portale" link that opens the GOMP composer in a new browser tab using the user's existing session.

**What would be needed to re-enable GOMP:**

1. **Separate GOMP credentials** in `.env`: `DELPHI_GOMP_USERNAME` and `DELPHI_GOMP_PASSWORD`.
2. A `GompClient` class that:
   - Logs into GOMP logon independently.
   - Persists the `Gomp2011Logon` + `ASP.NET_SessionId` cookies in the encrypted cache under a separate "GOMP session" key.
   - Fetches pages from `uniroma2studenti.gomp.it` with the full cookie jar.
3. A `WebFormsPostback` helper for the composer (`Composer.aspx?PS=...`): given an `__VIEWSTATE` and the `__EVENTTARGET` of the action to take, build a multipart form body and POST it. This is fragile because the `__VIEWSTATE` is session-bound and changes on every request.
4. Alternative: drive Playwright for the GOMP flow and expose the resulting DOM via the wrapper.

None of this is on the roadmap unless the user provides GOMP credentials.

---

## 11. Test suite — every test, what it asserts, where the fixture came from

Total: 10 test files, 96 tests, all passing.

### tests/anagrafica.test.ts (15 tests)

**Synthetic fixture (`tests/fixtures/anagrafica.html`):** hand-crafted. Has Cognome, Nome, Matricola, Codice Fiscale, Anno di Corso, AA immatricolazione, E-Mail but no CDL row.

- returns sensible defaults on empty HTML.
- extracts cognome and nome.
- uses matricola from page when present.
- falls back to passed matricola when page has none.
- parses "3 FUORI CORSO" as anno di corso 3.
- parses "3 FUORI CORSO" into annoCorsoLabel.

**Real fixture (`tests/fixtures/datiStudente.real.html`):** captured by curl from the live `datiStudente.jsp` for the graduated student.

- extracts a 16-char alphanumeric codiceFiscale.
- parses data di nascita "DD/MM/YYYY" → "YYYY-MM-DD".
- extracts comune/provincia di nascita.
- extracts cellulare, email, skype (null).
- extracts residenza/domicilio as separate sections.
- extracts facolta/corso/tipologia/sede/codiceCorso.
- extracts AA immatricolazione/ultima iscrizione.
- extracts nazione di cittadinanza.
- extracts photo URL.

### tests/appelli.test.ts (10 tests)

Uses a hand-crafted fixture (`tests/fixtures/appelli.html`) with 4 appelli (Aperto, Chiuso, Scaduto, inferito da postiDisponibili=0).

- parses 4 appelli.
- parses Aperto correctly.
- classifies Chiuso.
- classifies Scaduto.
- propagates insegnamento hint.
- normalises dates to ISO.
- returns empty for empty list.
- returns empty for no table.
- infers statoIscrizione from postiDisponibili=0.
- parses posti/iscritti as integers.

### tests/bollettini.test.ts (10 tests)

Uses `situazioneRateNew.real.html`.

- extracts studente header.
- extracts iscrizione summary (anno, tipo, messaggio).
- parses 4 anni accademici.
- extracts ISEE per anno.
- parses 3 rate per anno (1 rata for 2024/25 cautelativa).
- rate 1 of 2023/24: saldato=true, importo=N, 1 bollettino.
- bollettino dettaglio: Tassa regionale, Imposta di bollo.
- ricevuta POST fields.
- altri bollettini section.
- empty structure for blank page.

### tests/carriera.test.ts (19 tests)

**Synthetic fixture (`tests/fixtures/carriera.html`):** hand-crafted. 5 esami with classic patterns (26/30, 30/30, RITIRATO).

- parses 5 esami.
- splits codice/nome.
- parses CFU as float.
- parses voto N/30.
- null voto on RITIRATO.
- superato on passed exams.
- parses dd/mm/yyyy dates.
- ignores non-data rows.
- empty on no table.
- 4-column defensive skip.

**Real fixture (`tests/fixtures/esamiVerbalizzati.real.html`):** captured by curl from the live page for the graduated student.

- parses a non-trivial number of esami (>10).
- extracts page header.
- extracts rendimento summary (esamiValidi, cfuEsamiValidi, mediaAritmetica all present).
- parses 30 E LODE.
- parses IDONEO.
- flags SCRITTO partial exams.
- parses SSD with comma.
- normalises tirocinio AA + verbale.
- 26/30 details.

### tests/certificati.test.ts (7 tests)

Uses `preIndexCertificati.real.html`.

- extracts studente header.
- extracts 3 certificati.
- captures Certificato laurea.
- captures Certificato laurea con esami.
- captures Certificato storico with tipo=2.
- captures limit note.
- empty structure for blank page.

### tests/cookie-jar.test.ts (5 tests)

- accepts undici plain-object headers (string).
- accepts undici plain-object headers (string[]).
- accepts Web Headers with getSetCookie().
- tolerates undefined and null.
- ignores malformed set-cookie lines.

### tests/esami-search.test.ts (12 tests)

Uses `esamiVerbalizzati.real.html` (28 esami).

- filter by nome (case-insensitive substring).
- filter by SSD.
- filter by anno accademico.
- filter by stato (single value).
- filter by stato (array, OR).
- filter by isPartial=true.
- filter by CFU range.
- empty filter returns full list.
- summary counts by stato.
- summary CFU totals.
- summary distinct anni accademici sorted.
- summary media for numeric voti.

### tests/servizi.test.ts (5 tests)

Uses `sStudentiAttivaServizi.real.html`.

- extracts 3 servizi.
- captures Office365 with description.
- captures MatLab with OperazioneOK URL.
- captures Mathematica with license URL.
- empty list for page with no servizi.

### tests/throttle.test.ts (8 tests)

- executes N concurrent calls serially.
- serializes with minimum gap.
- replicates 2-second production rule.
- preserves gap even on slow tasks.
- returns underlying value.
- propagates errors.
- does not block after failure.
- pending() reporting.

### tests/ui.test.ts (5 tests)

Spins up an Express app on a random port with the real routes (and a CacheStore backed by a tmpdir). Doesn't hit the network — it just asserts the route shapes.

- GET / returns the SPA shell with all 8 tabs.
- GET /config returns matricola + version.
- GET /config does not leak the password.
- GET /static/styles.css returns 200 with text/css.
- GET /static/app.js returns 200 with JS content type.

---

## 12. Build, run, test, and the live verify dance

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env: set DELPHI_MATRICOLA, DELPHI_PASSWORD, generate DELPHI_SESSION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run in dev mode (watch)
npm run dev
# → starts tsx watch on src/index.ts, listens on PORT (default 3000, 7821 in our .env)

# Run compiled
npm run build
npm start
# → node dist/index.js

# Test
npm test
# → vitest run
npm run typecheck
# → tsc --noEmit

# Live verify dance (the one I run after every change):
pkill -f 'tsx watch' 2>/dev/null
sleep 2
rm -f data/cache.db data/cache.db-shm data/cache.db-wal
nohup npm run dev > /tmp/delphi-dev.log 2>&1 &
sleep 5
curl -s http://127.0.0.1:7821/health
curl -s -X POST http://127.0.0.1:7821/session/login \
  -H "content-type: application/json" \
  -d '{"matricola":"<MATRICOLA>","password":"<PASSWORD>"}'
curl -s http://127.0.0.1:7821/anagrafica | python3 -m json.tool | head
curl -s http://127.0.0.1:7821/carriera | python3 -m json.tool | head
curl -s http://127.0.0.1:7821/tasse | python3 -m json.tool | head
curl -s http://127.0.0.1:7821/servizi | python3 -m json.tool | head
curl -s http://127.0.0.1:7821/certificati | python3 -m json.tool | head
curl -sI "http://127.0.0.1:7821/tasse/ricevuta?bollettinoId=<ID>&rataId=<ID>&aa=YYYY/YYYY"
# Last one should return 200 with Content-Type: application/pdf
```

---

## 13. Known issues, quirks, and landmines

These are the things that will bite the next maintainer if they're not documented. Each one was a real bug at some point during development.

1. **undici's auto-redirect drops the session cookie.** The fix is to set `maxRedirections: 0` and implement the redirect loop in `Fetcher.fetch()` and `Fetcher.fetchBinary()`. The wrapper already does this. See §8.4.

2. **`<br>` does not introduce a space in cheerio's `.text()`.** The wrapper uses `textWithBreaks()` in `src/client/endpoints/certificati.ts` to fix this for the limit note parsing. Other parsers (e.g. `dettaglio` in bollettini) don't have `<br>` between fields, so they don't need this fix.

3. **The "Modifica" link inside a section header corrupts the section name.** If you don't strip `<a>` from the `<td class="boxsfondotabella">` cell, you get "Residenza Modifica" or "Domicilio Modifica" instead of the clean name. The `anagrafica.ts` parser does `cloned.find("a").remove()` before reading the text.

4. **Some terminal courses have `---` in the AA cell** (e.g. internships and the final thesis). The AA value is in a later cell (the "AA Orig." column, inline within the same row). The carriera parser falls back to scanning cells 10+ for the first YYYY/YYYY pattern.

5. **"AA ultima iscrizione" includes a parenthetical.** The live value is "2024/2025 (Iscrizione cautelativa)". The parser regex-truncates to the YYYY/YYYY prefix.

6. **"30 E LODE" must be matched before "N/30".** If the parser checks for N/30 first, "30 E LODE" would be parsed as 30/30 (trentesimi/30, lode=false). The `parseVoto()` function checks for "E LODE" first.

7. **Partial language exams have cfu=`--` and a language qualifier in the voto cell.** The parser uses cfu=null as a signal to set `isPartial=true`. The voto cell value is "OTTIMO" / "BUONO" / "DISTINTO" / "DISCRETO" / "SUFFICIENTE". These are stored as qualifica and `stato=in_corso`.

8. **"IDONEO" vs "OTTIMO" both look like qualifiers but mean different things.** IDONEO is "this exam doesn't have a numeric grade" (e.g. tirocinio, prova finale). OTTIMO is "this is the partial exam (SCRITTO) for a language; the ORALE has the real grade." The parser uses the cfu=null check to disambiguate.

9. **The 2024/2025 rata table for the graduated student has only 1 rata (cautelativa).** Tests that assume 3 rate per year fail unless they special-case 2024/2025.

10. **Delphi returns the cert pre-page as a 302 → cert index-page. Without manual redirect, the wrapper caches an empty result from the 302 body.** This was the original bug; the fix was manual redirect in `Fetcher.fetch()` and pointing `PATH_CERTIFICATI` at the pre-page (which 302s to the index page; the wrapper follows it).

11. **Delphi's session restore probe (`sStudentiLoginProcess.jsp`) returns 302 → login page when the session is invalid.** The `Session.restore()` method treats 2xx as valid and 401/403 as invalid; 302 falls through to "valid" because we don't follow it (the Login process page is itself a redirect). This is a minor issue — the session is re-checked on the first real request via `session.request()`.

12. **The login rate limiter is in-memory.** A process restart resets the counters. Two parallel processes would each have their own counter (effectively doubling the rate). Not a problem in practice (one process per machine) but worth noting.

13. **The `User-Agent` identifies us as `delphi-wrapper/0.1`.** This is honest and not a stealth scraper. If Delphi ever blocks scrapers by User-Agent, we'd need to change this or use a different transport. We have not seen any blocking.

14. **The `__doPostBack` machinery in the GOMP composer is not implemented.** We expose the `composerUrl` as a link the user can open in a browser. The full GOMP integration is parked — see §10.

15. **The `IscCorsiStudente` and `prenotazioni` pages have a two-step "email confirmation" flow.** The form posts to the same page; on success, the next page is the actual list. The wrapper doesn't handle this yet (Tier 2 in the plan).

16. **The "Calendario Prove di Esame" page (`calendarioEsami.jsp`) uses a regular HTML form (not ASP.NET).** The result is a server-rendered table, so the parser is straightforward. The wrapper will wrap this with a server-side POST to Delphi; the client passes filter params as query params.

17. **The `certificati` endpoint only lists available certs — it doesn't issue them.** Issuing a cert requires the live Delphi session, and is a write-side operation. The wrapper exposes the menu only.

18. **The `tasse/ricevuta` endpoint requires a real bollettinoId from a `tasse` fetch.** If the bollettinoId doesn't exist on the Delphi side, the POST returns the same page with an error message (HTML, not PDF). The wrapper doesn't currently detect this case — the client should treat the response as PDF only if Content-Type is `application/pdf`.

19. **The 2-second throttle is a real wall-clock delay.** The throttle test takes ~4.5s to run because it forces a 2s gap between 3 calls. Don't run the test in CI without increasing the timeout.

20. **The `rendimento` block is sometimes missing.** If the page is empty (no esami), the rendimento row is absent. The `parseRendimento()` function returns `null` in that case and the API exposes `rendimento: null` in the response.

21. **The session `restore()` is best-effort and may silently log in again on the first real request.** This is by design — the wrapper tries the encrypted cache, and if that fails, falls back to a fresh login using the env creds.

22. **The `dist/` build is committed? No, only `src/` is.** `npm run build` regenerates `dist/` locally; the dev server uses `tsx` which reads from `src/` directly. CI does both: `npm run build && npm test` to ensure parity.

23. **There is no `package-lock.json`-pinned CI.** We use `^` for all dependencies, which means `npm install` can pull minor versions. This was a pragmatic choice during initial development. For production, switch to `~` or exact pins.

24. **The `fresh: true` semantic of `npm test` is vitest's default.** `vitest run` is non-watch. We never set `--watch` in any script.

25. **The `X-Cache-Stale: true` header is added by the route handler, not the cache layer.** The cache layer just stores the data; the route handler translates the `outcome.kind === "stale"` flag into the header.

---

## 14. Future work

This section is the backlog. Items are roughly ordered by value, but the user should re-prioritise.

**Tier 1 — high value, low risk (Delphi Segreterie only):**

1. `GET /piano-studio` — read the GOMP 2010 piano listing from `studenti/pianoDiStudi/index.jsp`. Return `{header, piani[], composerUrl}`. Each piano row carries the `Composer.aspx?PS=...` URL so the client can open the editor in a browser.
2. `GET /verbali-non-chiusi` — read the open grade records.
3. `GET /esami-pendenti` — read the in-progress verbalizzazione list.
4. `GET /corsi/menu` and `GET /corsi/visualizza` — read the frequenza corsi menu + my iscrizioni.
5. `GET /certificati-richieste` — read the Richieste Certificati form (different from Stampa).
6. `GET /laurea` and `GET /laurea/frontespizio` — read the laurea instructions + frontespizio form.
7. `GET /isee` — read the ISEE authorization form.
8. `GET /servizi/collaborazione` — read the part-time collaboration menu.
9. `GET /stampa?tipo=N` — proxy the `stampa.pdf?tipoStampa=N` PDF binary.
10. `GET /studente/menu` — parse the active-student home page as a structured menu.

**Tier 2 — medium value, medium risk (Delphi Segreterie form flows):**

11. `GET /prenotazioni/calendario?anno=&sessione=&iniziale=&datainizio=&datafine=` — the killer feature. The wrapper does a server-side POST to `calendarioEsami.jsp` with the form fields, then parses the results table.
12. `GET /prenotazioni` — read the prenotazioni menu.
13. `GET /prenotazioni/visualizza?attive=true|false` — read my bookings.
14. `GET /prenotazioni/avvia` — first step of the booking flow (email confirmation form).

**Tier 3 — high risk (write operations):**

15. `POST /prenotazioni/conferma` — reserve a seat. Requires an idempotency key and a "double-check the body" pattern. Never fire without client confirmation.
16. `POST /prenotazioni/cancella` — cancel a booking.
17. `POST /corsi/iscrizione` — book a course.
18. `POST /corsi/cancella` — cancel a course.
19. `POST /certificati/richiedi` — request a new certificate.
20. `POST /password/cambia` — change the Delphi password.

**GOMP integration (parked, see §10):**

21. Capture the GOMP ReturnUrl in the login flow and bridge back after a successful Delphi login.
22. Drive Playwright for the GOMP composer (if a GOMP username/password becomes available).
23. Add `DELPHI_GOMP_USERNAME` / `DELPHI_GOMP_PASSWORD` to `.env`.

**SPA / UX:**

24. Add the Tier 1 + 2 tabs to the SPA (currently we have 8 tabs, plan calls for ~13).
25. Reshape the existing tabs: Riepilogo, Esami (with filter form), Appelli, Piano (with "Apri nel portale" link), Prenotazioni (new), Tasse, Certificati (with Stampa + Richiedi sub-tabs), Servizi, Laurea (new), Anagrafica.
26. Add a "stale data" badge in the tab header so the user knows which tabs are showing cached data.
27. Add a "n/a" badge for routes that are unavailable for the user's account type (graduated vs active).

**Operational:**

28. Add a `--ci` flag to `package.json` for the test script that disables the long throttle test in CI.
29. Add Dockerfile + docker-compose for self-hosting.
30. Add Prometheus metrics endpoint (`/metrics`) for observability.

---

## 15. Live build findings (challenge log)

This section records discoveries from the **first end-to-end implementation**, when
the whole wrapper + SPA was built from this document and verified live against
**both** real accounts (one graduated, one active). Where a finding
corrects an earlier section, it says so. Per the header of this document, these
findings take precedence over the earlier prose.

### 15.1 Critical: the cache MUST be namespaced by matricola

**Corrects §8.9 and §8.11.** The original cache used flat keys (`carriera`,
`anagrafica`, `bollettini`, …). Because the wrapper supports **more than one
account** (the SPA login form accepts any matricola, not just the `.env` one) and
because `carriera`/`esami` have a **forever TTL (0)**, the first account to
populate the cache poisoned it for everyone: logging in as a second account still
served the first account's data, permanently for the forever-TTL fields. This
presented as "no matter what credentials you use, you always see the same
account."

The fix: every cache key is prefixed with the active matricola
(`<matricola>:carriera`, `<matricola>:anagrafica`, …) in `Api.key()`. The active
matricola is `session.info().matricola`, falling back to `config.matricola` for a
request that will log in via the fallback path. Verified live: the graduated and active accounts each yield their own row
per endpoint, with no cross-contamination.

### 15.2 Session must persist the matricola

**Extends §8.9.** The `session` table gained a `matricola TEXT` column (with an
idempotent `ALTER TABLE` migration for older dbs) so that `Session.restore()`
re-establishes *which* account the restored cookie belongs to — without it, a
restored session keys the cache as `null:*`. `saveSession(cookies, matricola,
ttl?)` now takes the matricola.

### 15.3 Transparent re-login must not silently switch accounts

**Corrects §8.6.** `Session.request()`'s mid-request re-login used the fallback
(config) credentials unconditionally. If an account other than the `.env` one had
logged in via the SPA, an expiry would silently re-login as the `.env` account —
another way to "land on the wrong account." We don't store SPA-account passwords
(by design), so the fix is: only auto-re-login when the logged-in matricola **is**
the config matricola; otherwise surface the expiry (`NonRetryableError`) and let
the client re-authenticate.

### 15.4 Laurea and stato carriera live on the dashboard, not datiStudente

**Corrects §9.1 and §6.5.** `datiStudente.jsp` has **no** "Conseguita laurea…"
cell and no "Stato carriera" line — those are on the post-login dashboard
(`sStudentiLaureatiLogin.jsp`, the "Dati carriera" cell). The anagrafica flow
therefore fetches **both** pages and merges: `anagrafica.parse(datiStudente)` for
the personal/career fields, `anagrafica.parseDashboardCarriera(dashboard)` for
`statoCarriera` + `laurea`. Verified: laurea `{corso: LINGUE NELLA SOCIETA'
DELL'INFORMAZIONE, data: YYYY-MM-DD, votazione: NNN/110}`.

**New landmine:** the dashboard "Dati carriera" cell has **no period**, so a
greedy `Carriera studente …[^.]*` regex swallows the entire on-line-services menu
into `statoCarriera`. Bound the match to the status word
(`conclusa|attiva|in corso|in regola|sospesa`).

### 15.5 Piano di studi 404s into GOMP — no static listing on these accounts

**Corrects §6.15 and Tier-1 item #1 in §14.** A live GET of
`studenti/pianoDiStudi/index.jsp` does **not** render a parseable static header +
piani table; it issues an SSO redirect to
`/workflow2011/logon/logon.aspx?SSO=…` and 404s (GOMP, out of scope per §10).
Both accounts behave this way. The wrapper's `/piano` therefore returns an empty
piano plus a `composerUrl` (the Delphi piano index URL) for the SPA's "Apri nel
portale" link, rather than erroring. The table parser in `piano.ts` is retained
for any account where Delphi *does* render the static listing.

### 15.6 calendarioEsami needs the `?Entra` navigation flow

**Corrects §6.14 / §13.16.** A direct GET of `prenotazioni/calendarioEsami.jsp`
404s with a redirect to `sStudentiLogin2.jsp`. The page is only reachable through
the menu nav (`menuPrenotazioni.jsp` → `…?Entra=…`). The appelli/calendario parser
is in place but the navigation/POST flow is **not yet wired**; `/appelli` returns
`[]` for now. (`menuPrenotazioni.jsp` itself does return 200 for both accounts.)

### 15.7 Account type is NOT detectable by a 404 on the "wrong" dashboard

**Corrects §5.4.** Both `sStudentiLaureatiLogin.jsp` **and**
`sStudentiRegolariLogin.jsp` return 200 for both account types (the graduated
account gets a 200 on the Regolari page and vice-versa). The "404 on the wrong
account-type path" behaviour holds only for the *deep* active-only paths
(prenotazioni internals, etc.), not for the two dashboards. Don't use a dashboard
status code to classify the account.

### 15.8 Servizi has more items than documented

**Corrects §6.8 and §9.6.** The active account exposes **five** services,
not three: Microsoft Office365, MatLab, **MyCampusXApp**, **National
Instruments**, Mathematica. The graduated account exposes three. The parser is
count-agnostic (it walks every `<li>` in the `td.msggenerico ol`), so this needed
no code change — but tests must not assert exactly three.

### 15.9 Bollettini count corrections

**Corrects §9.5 test expectations.** The graduated account has **2**
"Altre tipologie di bollettino" rows, not 1. All other §9.5 expectations held
exactly against live HTML: 4 anni, ISEE per anno, 3 rate per year except
2024/2025 (cautelativa, 1 rata), and the paid bollettino parses to
`{importo:156, causale:020, convalidatoPagoPa:true, dettaglio includes "Tassa
regionale" and "Imposta di bollo", ricevuta:{bollettinoId, rataId, AA:2023/2024}}`.
The ricevuta PDF is a real PDF v1.4 — matching §6.7.

### 15.10 Parser results verified against live HTML

The capture script (`scripts/capture.ts`, `npm run capture`) logs into both
accounts and dumps every route's raw HTML to `captures/<account>/`. Parser
results, all confirmed: carriera 28 esami (graduated) / 7 (active), rendimento
media aritmetica ~28 / ponderata ~28, several "30 e lode", IDONEO and OTTIMO/BUONO
partials handled, RITIRATO (in the **note** column, voto empty) → `non_superato`,
terminal-course AA-fallback working. The `tests/fixtures/*.real.html`
files were refreshed from these captures and the parser tests pass.

**Note on byte sizes:** the captured pages are smaller than the sizes quoted in
§4/§6 (e.g. `datiStudente.jsp` is ~10.5 KB live vs the 13299 B quoted). Delphi's
markup has drifted slightly since the original investigation; the structural
selectors are unchanged and the parsers are unaffected.

### 15.11 Encoding and redirects confirmed

Confirmed working as documented: latin1/windows-1252 byte decode + cheerio entity
resolution (`&egrave;` etc.), manual redirect handling preserving `JSESSIONID`
(the certificati pre-page 302 → index page is followed transparently), the 2-second
throttle, and exponential backoff.

### 15.12 SPA + build notes

- **Design system updated (supersedes §8.16 and the old DESIGN.md):** the accent is
  **Tor Vergata green `#007d34`**, not red. The SPA ships **light + dark themes**
  (token-based, toggle, system default), Inter, soft rounded corners, the masked
  `unilogo.svg`, and 8 tabs. See the current `DESIGN.md`.
- **`[hidden]` landmine:** the login/loading/dashboard view roots have explicit
  `display` rules, which beat the UA `[hidden]{display:none}`. A global
  `[hidden]{display:none !important}` is required or all three views stack on top
  of each other.
- **`tsconfig` `rootDir` must be `src`** (not `.`), or `tsc` emits `dist/src/index.js`
  and `npm start`'s `node dist/index.js` can't find the entrypoint. Non-TS static
  assets (`app.js`, `styles.css`, `unilogo.svg`) are copied into `dist/server/static`
  by the `build` script.
- **Login-failure detection is not live-tested.** `Session.doLogin()` flags failure
  via a body regex (`credenziali errate|…`) plus a "no cookies" check. To avoid
  account lockout, wrong credentials were **not** submitted against the live portal,
  so the exact error markup is unverified — confirm Delphi's real failure page
  before trusting the regex.

---

*End of document. If you got this far, the future maintainer is probably an AI agent. The most important things to remember are: (1) Delphi returns 302 redirects and **undici drops the session cookie on auto-redirect** — always use the wrapper's manual redirect handling. (2) The session is encrypted with AES-256-GCM in sqlite; if you change the `DELPHI_SESSION_KEY`, all stored sessions become unreadable and every restart will require a fresh login. (3) **Cache keys are namespaced by matricola (§15.1)** — never reintroduce a flat key, or multi-account logins will cross-contaminate.*




