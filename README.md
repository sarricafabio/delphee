<p align="center">
  <img src="Delphee%20Design%20System/assets/delphee-banner.svg" alt="Delphee" width="280">
</p>

# Delphee

> REST API wrapper attorno al portale studenti Delphi dell'Università di Roma "Tor Vergata".

[![Node](https://img.shields.io/badge/Node-%E2%89%A522-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![undici](https://img.shields.io/badge/undici-6-2E8B57)](https://undici.nodejs.org)
[![Cheerio](https://img.shields.io/badge/Cheerio-1.0-E88C1F)](https://cheerio.js.org)
[![Zod](https://img.shields.io/badge/Zod-3-3E67B1?logo=zod&logoColor=white)](https://zod.dev)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](./Dockerfile)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Un servizio HTTP che si autentica al portale [`delphi.uniroma2.it`](https://delphi.uniroma2.it) per conto di ogni studente ed espone i suoi dati come JSON pulito, gestendo login, sessioni, parsing HTML, cache e rate limiting. Pensato per essere consumato da un'app host (es. un'app studenti) che fa da proxy autenticato.

## Caratteristiche

- 🔐 **Multi-tenant**: ogni studente fa login con le proprie credenziali e riceve un bearer token opaco. Credenziali, cookie jar e dati in cache vivono **solo in RAM, mai su disco**; la password è tenuta al massimo 30 minuti (vedi [Modello di sicurezza](#modello-di-sicurezza)).
- 📚 **Copertura completa**: anagrafica, carriera, esami (con filtri), verbali, esami pendenti, piano di studi, appelli, tasse e ricevute, servizi (con risoluzione codici di attivazione), certificati.
- ⚡ **Cache solo in RAM**: ogni campo ha il suo TTL ed è legata alla sessione (purgata al logout e alla scadenza). Carriera/esami si rinfrescano ad ogni login; anagrafica/servizi 24h, tasse 1h, appelli 5min.
- 🔁 **Recupero trasparente**: se la sessione Delphi muore mid-request, Delphee rifà il login e ritenta. Se Delphi è giù, fallback all'ultimo snapshot cached. Aiuta a mitigare i problemi di Delphi.
- 🛡️ **Niente PII a riposo**: nessun dato personale su disco: cache in RAM, niente log per-utente, `.env` senza credenziali, fixture di test anonimizzate (vedi [Sicurezza e privacy](#sicurezza-e-privacy)).
- 🐳 **Pronto per Docker**: immagine leggera basata su Node 22.
- 🥞 **Stile "vanilla"**: TypeScript compilato a JavaScript puro, niente decorator, niente DI, niente framework lato client. I 11 parser HTML in `src/client/endpoints/*.ts` sono `function` pure che prendono una stringa e ritornano un oggetto (niente classi). Le 5 classi presenti (`Api`, `Session`, `Fetcher`, `CacheStore`, `SessionRegistry`) sono solo dove ha senso avere stato + ciclo di vita: orchestratori, non domain logic. La SPA in `app.js` è JS vanilla: `app.js` viene servito così com'è da Delphee, niente bundler, niente transpiler.

## Indice

- [Architettura](#architettura)
- [Quick start](#quick-start)
- [Configurazione](#configurazione)
- [API](#api)
- [Sviluppo](#sviluppo)
- [Test](#test)
- [Deploy con Docker](#deploy-con-docker)
- [Modello di sicurezza](#modello-di-sicurezza)
- [Cache e staleness](#cache-e-staleness)
- [Note e limiti noti](#note-e-limiti-noti)
- [Layout del progetto](#layout-del-progetto)

## Architettura

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  App host    │  JSON   │     Delphee      │  HTTP   │  delphi.uniroma2 │
│  (Next.js)   │ ──────▶ │  (questo servizio)│ ──────▶ │  .it            │
│              │ ◀────── │                  │ ◀────── │                 │
└──────────────┘         └──────────────────┘         └─────────────────┘
                                │
                                ▼
                        ┌──────────────┐
                        │    Cache     │  (in RAM, TTL per campo,
                        │  in-memory   │   legata alla sessione)
                        └──────────────┘
```

**Flusso di una richiesta tipica:**

1. Il client invia `Authorization: Bearer <token>` (ottenuto da `/session/login`).
2. Delphee risolve il token → sessione (credenziali + cookie jar in RAM).
3. Controlla la cache in RAM. Se hit e non scaduta, ritorna. Altrimenti fetch live da Delphi.
4. Se il cookie Delphi è scaduto, rifà il login con le credenziali in RAM e ritenta.
5. Se Delphi è giù e c'è uno snapshot cached, ritorna quello con `X-Cache-Stale: true`.
6. Login, logout o scadenza della sessione purgano i dati cached di quell'utente (vedi [Modello di sicurezza](#modello-di-sicurezza)).

## Quick start

Requisiti: **Node.js ≥ 22**.

```sh
# clona e installa
git clone <repo-url> delphee
cd delphee
npm install

# build
npm run build

# avvia (porta 7822 di default)
npm start
```

In modalità sviluppo (watch + reload automatico):

```sh
npm run dev
```

Apri `http://localhost:7822` per la mini-SPA di debug, oppure fai richieste JSON via `curl` (vedi [API](#api)).

### Esempio: login e fetch anagrafica

```sh
# Login
curl -s -X POST http://localhost:7822/session/login \
  -H 'content-type: application/json' \
  -d '{"matricola":"<MATRICOLA>","password":"<PASSWORD>"}'

# → { "token": "<TOKEN>", "info": { "matricola": "...", "since": ... } }

# Usa il token
curl -s http://localhost:7822/anagrafica \
  -H 'Authorization: Bearer <TOKEN>' | jq
```

> **Nota**: le credenziali non sono mai nel codice né in `.env`. Arrivano per-utente via `/session/login` e vivono in RAM solo per la durata della sessione.

### Utente demo (offline)

Per provare la UI senza credenziali reali e senza contattare Delphi, fai login con:

| Campo     | Valore    |
| --------- | --------- |
| Matricola | `0000000` |
| Password  | `demo`    |

Questo utente è completamente **offline**: la sessione è pre-autenticata e ogni endpoint risponde con dati fittizi (carriera, anagrafica, tasse, servizi, certificati, verbali, esami pendenti, piano, appelli, più PDF di esempio per ricevute e certificati). Nessuna richiesta esce verso `delphi.uniroma2.it`, quindi è adatto a sviluppo UI, screenshot e test manuali. La sessione demo rifiuta per costruzione qualsiasi chiamata di rete (`DemoSession.request` lancia un errore), così un endpoint non coperto fallisce in modo esplicito invece di raggiungere il portale. Implementazione in `src/server/demo.ts`.

## Configurazione

Tutte le variabili sono validate con zod al boot. Il processo rifiuta di avviarsi se la config è invalida.

| Var                 | Default                       | Descrizione                                                                |
| ------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| `DELPHI_BASE_URL`   | `https://delphi.uniroma2.it`  | Base URL del portale Delphi.                                                |
| `PORT`              | `7822`                        | Porta HTTP.                                                                |
| `LOG_LEVEL`         | `info`                        | `trace` \| `debug` \| `info` \| `warn` \| `error` \| `fatal`.                |
| `NODE_ENV`          | `development`                 | Modalità (influisce sul logger).                                           |

> **Niente credenziali nella config.** Le credenziali arrivano da `/session/login` per ogni utente.

## API

Tutte le rotte dati richiedono `Authorization: Bearer <token>`. Senza un token valido ritornano `401 { error: "no_session" }`.

### Sessione

| Method | Path              | Body                              | Risposta                                              |
| ------ | ----------------- | --------------------------------- | ----------------------------------------------------- |
| POST   | `/session/login`  | `{ matricola, password }`         | `200 { token, info }` · `400` · `401` · `429`         |
| GET    | `/session/status` | —                                 | `200 { state, matricola?, since, lastError? }`        |
| POST   | `/session/logout` | —                                 | `200`                                                 |

### Dati studente

| Method | Path                  | Note                                                                                              |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------ |
| GET    | `/anagrafica`         | Profilo personale (anagrafica, contatti, facoltà/corso, stato carriera, eventuale laurea).        |
| GET    | `/carriera`           | Esami verbalizzati completi (header + lista + rendimento). Cache forever.                          |
| GET    | `/carriera/esami`     | Come sopra ma filtrato. Query: `nome`, `ssd`, `aa`, `stato`, `cfuMin`, `cfuMax`, `partial`.        |
| GET    | `/verbali`            | Verbali non chiusi.                                                                              |
| GET    | `/esami-pendenti`     | Esami in verbalizzazione.                                                                        |
| GET    | `/piano`              | Piano di studi (solo studenti attivi).                                                            |
| GET    | `/appelli`            | `?insegnamento=CODICE`. Appelli aperti per un insegnamento.                                       |
| GET    | `/tasse`              | Situazione bollettini per anno accademico, con ISEE, rate, bollettini, IUV, pagoPA, ricevuta.     |
| GET    | `/tasse/ricevuta`     | `?bollettinoId=…&rataId=…&aa=YYYY/YYYY` → PDF `application/pdf` inline.                          |
| GET    | `/servizi`            | Lista servizi (Office365, MatLab, Mathematica, …) con link e codici di attivazione.               |
| GET    | `/certificati`        | Elenco certificati stampabili.                                                                   |
| GET    | `/certificati/stampa` | `?path=certificatoXxx.jsp&tipo=N` → PDF inline.                                                  |

### Sistema

| Method | Path       | Risposta            |
| ------ | ---------- | ------------------- |
| GET    | `/`        | Landing page (SPA). |
| GET    | `/health`  | `{ ok, version }`   |
| GET    | `/config`  | `{ version }`       |

### Esempio risposta: `/anagrafica`

```json
{
  "cognome": "...",
  "nome": "...",
  "matricola": "0000001",
  "codiceFiscale": "RSSMRA00A01H501Z",
  "dataNascita": "2000-01-01",
  "residenza": { "indirizzo": "VIA ROMA 1", "cap": "00100", "comune": "ROMA" },
  "domicilio": { "comune": "ROMA" },
  "email": "student.grad@example.test",
  "facolta": "...",
  "corso": "...",
  "codiceCorso": "H45",
  "annoCorso": 3,
  "annoCorsoLabel": "3 FUORI CORSO",
  "aaImmatricolazione": "2021/2022",
  "aaUltimaIscrizione": "2024/2025",
  "statoCarriera": null,
  "laurea": null
}
```
32
## Sviluppo

```sh
npm run dev        # watch + tsx
npm run build      # tsc + copia gli asset statici
npm start          # esegui il build
npm run typecheck  # solo type-check
```

Il codice sorgente è scritto in **stile "vanilla"**: TypeScript compilato a JavaScript puro, niente decorator, niente framework, niente dependency iniettabili. I parser HTML sono `function` pure che prendono una stringa e ritornano un oggetto. Le uniche classi sono dove c'è stato + ciclo di vita (orchestrazione), non nella domain logic. La SPA lato client è JS vanilla: `app.js` viene servito così com'è, niente bundler, niente transpiler.

Le dipendenze runtime sono solo cinque: `express` (HTTP server), `undici` (client per Delphi), `cheerio` (parsing HTML), `pino` (logging), `zod` (validazione env e payload). La cache è in RAM (una `Map`), quindi non serve alcun modulo nativo per il database.

## Test

```sh
npm test
```

I test girano su fixture HTML reali catturate dal portale Delphi e **completamente anonimizzate** (nomi, email, codice fiscale, matricola, telefono, indirizzo, ISEE, importi, date, codici di attivazione, ID pagamento sono tutti sostituiti con valori sintetici). I parser sono testati su invarianti strutturali (forma, presenza di "30 e lode", "IDONEO", "OTTIMO", "RITIRATO", ecc.), non su dati personali.

Layout dei test:

```
tests/
  parsers.test.ts        # 32 test sui parser HTML
  login.test.ts          # 5 test sulla sessione
  sessions.test.ts       # 3 test sul registry sessioni (incl. purge cache on evict)
  failure-log.test.ts    # 3 test sul logging dei fallimenti (operator stream, niente file)
  fixtures/              # HTML Delphi reale, anonimizzato
```

## Deploy con Docker

```sh
docker compose up -d
```

Il `Dockerfile` produce un'immagine `node:22-alpine` con il codice compilato in `dist/`. Il `docker-compose.yml` espone solo la porta configurabile, **niente volumi**, perché cache e sessioni vivono solo in RAM e non c'è nulla da persistere. Il `.dockerignore` esclude `node_modules`, `tests`, `fixtures`, `docs`, segreti e catture, così la build context resta minima.

Delphee è completamente **stateless su disco**: cache e sessioni vivono solo in RAM e un restart le azzera (gli studenti rifanno login). Puoi esporlo direttamente su internet (con HTTPS davanti), metterlo dietro un reverse proxy, o tenerlo in una rete privata: la logica non cambia. Per un'istanza pubblica, vedi la sezione [Deployment pubblico](#deployment-pubblico) sopra.

## Modello di sicurezza

- **Niente dato personale a riposo.** Nessuna credenziale, nessun dato studente e nessun log per-utente tocca il disco: cache e sessioni sono **solo in RAM**. Non c'è un file da cifrare, custodire o sottoporre a retention. Un restart azzera tutto e gli studenti rifanno login.
- **Ciclo di vita della password (max 30 min).** Il token di sessione di Delphi è instabile e di breve durata: non ci si può affidare ad esso per rinnovare una sessione, quindi in pratica l'unico modo affidabile per riprendere una sessione caduta è **rigiocare la password**. Per questo Delphee la tiene in RAM dentro l'oggetto `Session` (vedi `src/client/session.ts`) per fare re-login trasparente. La finestra di esposizione è limitata: la sessione, e con essa la password, viene evicta dopo **30 minuti di inattività** (`SessionPolicy.defaultTtlMs`). L'attività sposta in avanti la finestra; inattività, logout o restart la chiudono. La password non viene mai loggata né scritta su disco; esiste solo in memoria del processo per quella finestra. È il residuo di rischio inevitabile dato il protocollo di Delphi: cifrarla lato client non aiuterebbe (il server deve comunque produrre il testo in chiaro per Delphi).
- **Dati cached legati alla sessione.** I dati di uno studente in cache vengono purgati quando la sua sessione finisce, per logout o eviction per inattività (`SessionRegistry.onEvict` → `CacheStore.deletePrefix`). Un nuovo login li rinfresca. Così nessun dato personale sopravvive alla sessione che ne ha bisogno.
- **Il bearer token è l'unica auth.** Chi possiede un token valido può fare tutto ciò che può fare quell'utente su Delphi, per la durata della sessione. Questo vale sia in rete privata sia in un'istanza pubblica: in entrambi i casi proteggi i token.
- **Log redatti.** Il logger (pino) ha redazione attiva su `password`, `matricola`, `cookies`, `authorization`, ecc. (vedi `src/logger.ts`). I fallimenti verso Delphi finiscono solo sullo stream operatore (matricola redatta), **non** in file per-utente.
- **Rate limiting e backoff.** Chiamate a Delphi serializzate per sessione con gap di 2s, retry esponenziale 1s/4s/16s su 5xx.
- **Niente PII nel repo.** Le fixture di test sono completamente anonimizzate; vedi sotto.

### Deployment pubblico

Delphee **può** essere esposto pubblicamente: è il modello di deploy naturale per un'app studenti. Tuttavia, dato che il bearer token è l'unica autenticazione, è tua responsabilità proteggerlo. Checklist minima per un'istanza pubblica:

- **HTTPS obbligatorio** (Caddy, nginx, Traefik, qualcosa che termini TLS). I token non devono mai viaggiare in chiaro.
- **Sessioni con TTL breve** se l'app client non ha un meccanismo di refresh proprio (default 30 min; alza in `SessionPolicy.defaultTtlMs` solo se accetti una finestra di password più lunga).
- **Rate limiting a livello di reverse proxy** per mitigare brute-force su `/session/login` (Delphi blocca a monte comunque, ma meglio difese in profondità).
- **Monitoraggio dei log** per `invalid_credentials` spike, login da IP insoliti, picchi di 5xx.
- **Reverse proxy come Caddy/nginx** sempre consigliato, anche in DMZ: per terminare TLS, gestire keep-alive, e tenere i log access fuori dal processo Node.

> Il reverse proxy **non è un requisito di sicurezza**: Delphee non si basa su IP allowlist. È solo una buona prassi operativa per TLS, rate limit e log.

### Sicurezza e privacy

- **Niente PII a riposo (GDPR).** I dati Delphi (nome, codice fiscale, indirizzo, ISEE, pagamenti, foto, voti) sono dati personali: Delphee li tiene **solo in RAM**, legati alla sessione, e non li scrive mai su disco. Non esiste un database, un volume o un file di log per-utente da proteggere o da sottoporre a retention. Il titolare del trattamento non ha PII persistite da gestire.
- Le credenziali reali non sono mai nel codice, in `.env`, in `TESTCREDENTIALS.md` (gitignored), né nelle fixture di test.
- I fixture contengono solo **HTML Delphi reale con valori sintetici**: nomi, email, codice fiscale, matricola, telefono, indirizzo, ISEE, importi, date, codici di attivazione, ID pagamento sono tutti placeholder non-identificabili.
- Delphee gira su credenziali passate per richiesta; in hosting multi-tenant questo significa che il rate-limit di Delphi è per-studente (un utente non può saturare la quota degli altri).

## Cache e staleness

La cache è **interamente in RAM** (`CacheStore`, una `Map`): niente sqlite, niente disco. Si azzera ad ogni restart ed è legata alla sessione: i dati di uno studente vengono purgati al suo logout o all'eviction per inattività, e rinfrescati al login. Ogni campo ha un TTL configurato in `src/cache/policies.ts`:

| Campo               | TTL     | Note                                                      |
| ------------------- | ------- | --------------------------------------------------------- |
| `carriera` (esami)  | forever\* | \*Non scade da sola, ma viene purgata e rifetchata ad ogni login (e su logout/eviction). La fonte ufficiale è Delphi. |
| `anagrafica`        | 24h     | Dati manuali, cambiano raramente.                        |
| `piano`             | 24h     |                                                           |
| `servizi`           | 24h     | Link di attivazione statici.                              |
| `certificati`       | 1h      | Il menu può cambiare quando se ne sbloccano di nuovi.     |
| `tasse`             | 1h      |                                                           |
| `appelli`           | 5 min   | Time-sensitive.                                           |
| `verbali`           | 5 min   |                                                           |
| `esami-pendenti`    | 5 min   |                                                           |

La cache è **namespaced per matricola**: due studenti non condividono mai righe, anche se hanno la stessa query.

Quando una fetch live fallisce e c'è uno snapshot cached, Delphee ritorna quello con header `X-Cache-Stale: true`. Il client dovrebbe trattarlo come un warning soft (mostrare "potrebbe non essere aggiornato"), non come un errore.

## Note e limiti noti

- **I parser HTML dipendono dal markup Delphi.** Se Tor Vergata cambia i selettori JSP, vanno aggiornati i file in `src/client/endpoints/*.ts`.
- **Login best-effort a due step** (GET form, POST credenziali). I nomi dei campi potrebbero richiedere aggiustamenti dopo il primo run live.
- **`piano` e `appelli` ritornano array vuoti per i laureati.** Quei JSP non sono esposti sul loro account, Delphi ritorna 404, Delphee gestisce e ritorna `[]` con 200. La UI può mostrare "Nessun dato" senza gestire il 404.
- **`/tasse/ricevuta` ritorna PDF inline.** Il browser lo renderizza o scarica. Il PDF non viene cachato (binari grossi, valore basso).
- **Il `/session/login` può essere rate-limitato da Delphi.** Delphee non aggira i rate limit del portale; semplicemente rispetta i gap con `THROTTLE_GAP_MS`.
- **Il cookie GOMP 2010 non è supportato end-to-end.** Il SSO Delphi → GOMP richiede state lato browser (cookie `Gomp2011Logon`) che il redirect manuale di Delphee non propaga. Esposizione come proxy diretto, non come fetch automatizzato.

## Layout del progetto

```
src/
  config.ts                   caricatore env validato con zod
  logger.ts                   pino con redazione secrets
  types.ts                    tipi di dominio
  index.ts                    entry point Express
  client/
    cookie-jar.ts             gestione cookie minimale
    fetcher.ts                client undici, redirect manuali, retry
    session.ts                login/logout per utente, in RAM, self-relogin
    endpoints/                parser HTML puri
      anagrafica.ts
      carriera.ts
      appelli.ts
      piano.ts
      bollettini.ts
      servizi.ts
      certificati.ts
      esami-pendenti.ts
      esami-search.ts
      verbali.ts
      util.ts
  cache/
    store.ts                  store in-memory (RAM, niente disco)
    policies.ts               TTL per campo + TTL sessione
  server/
    api.ts                    orchestrazione fetch+cache (per richiesta)
    sessions.ts               registry sessioni in RAM, keyed by token
    routes.ts                 route Express
    session-middleware.ts     timing, error net, bearer auth
    failure-log.ts            log JSONL per utente su 5xx/401
    static/                   landing page
      index.html.ts           HTML shell server-rendered
      app.js                  controller SPA lato client (no framework)
      styles.css              design system
      unilogo.svg             logo ateneo
  utils/
    retry.ts                  backoff esponenziale
    throttle.ts               mutex serializzante con gap

tests/
  parsers.test.ts             test parser
  login.test.ts               test sessione
  sessions.test.ts            test registry
  failure-log.test.ts         test logging
  fixtures/                   HTML Delphi reale, anonimizzato
```

## Licenza

[MIT](./LICENSE). Vedi il file `LICENSE` per il testo completo.

---

**Maintainer**: questo repository è un'esperimento personale di un ex studente dell'Università di Roma "Tor Vergata". Non è affiliato ufficialmente con l'ateneo. Il sistema Delphi è estremamente obsoleto e possiede serissimi problemi di sicurezza informatica, questo prodotto **NON** è in grado di risolverli. L'ampia adozione di Delphee da parte dello studentato potrebbe, però, spingere l'Università a rinnovare il sistema. 
Il cambio della forma delle chiamate server di Delphi, seppur non probabile, potrebbe rendere Delphee non funzionante o rompere alcune funzionalità.
**NON SONO IN ALCUN MODO RESPONSABILE DELLE VOSTRE CREDENZIALI.** 
