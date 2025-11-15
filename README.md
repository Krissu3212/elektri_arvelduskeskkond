# Elektri Arveldusmootor

Automaatne aruandlusplatvorm, mis koondab Eleringi API reaalaja andmed ja ettevõtte elektriarved ühtsesse React armatuurlauale. Süsteem kasutab masinõpet, et tuvastada tootmise mustreid, kõrvalekaldeid ja efektiivsuse muutusi ning võimaldab tulemusi regulaarselt omanikele/haldajatele edastada või väliste raamatupidamis- ja haldustarkvaradega API kaudu integreerida.

## Põhivõimekus

- ⚡️ **Reaalaja andmed** – serveri `loader` kogub 48h Eleringi NordPool hinnainfo (EE piirkond) ja visualiseerib selle Tailwindi + Rechartsiga.
- 📥 **CSV võrdlus** – kasutaja laeb elektriarved üles (veerud `periodStart, periodEnd, provider, energyMWh, totalCostEUR`), mida võrreldakse turu keskmise €/MWh hinnaga.
- 🤖 **Masinõpe & anomaaliad** – libiseva akna ja Z-skoori põhised leiud, efektiivsuse indeks ning soovitused tootmise optimeerimiseks.
- 📊 **Visuaalsed raportid** – dünaamiline raportikaart + ajastusvorm, mis kajastab anomaaliaid, efektiivsust ja arvevõrdlust.
- 🔌 **API integratsioon** – `POST /api/reports` aktsepteerib arveinfot, arvutab võrdluse ja tagastab JSON vastuse, sobib raamatupidamistarkvara ühendamiseks.

## Kiirstart

```bash
npm install
npm run dev
# http://localhost:5173
```

### Keskkonnamuutujad

1. Kopeeri juurkausta fail `.env` (fail on `.gitignore` all).
2. Lisa oma OpenAI võti:\
   `OPENAI_API_KEY=sk-...`
3. Vajadusel lisa teised serveripoolsed võtmed samasse faili.

`app/lib/env.server.ts` laeb `.env` automaatselt nii `npm run dev` kui ka `npm start` käivitamisel, seega võtmed on saadaval loaderitele ja API-dele.

### Tootmise build

```bash
npm run build
npm start
```

### Tüübikontroll

```bash
npm run typecheck
```

## CSV vorming

```csv
periodStart,periodEnd,provider,energyMWh,totalCostEUR
2025-01-01,2025-01-31,Enefit,120.5,8400
2025-02-01,2025-02-28,Enefit,114.3,7990
```

Platvormi kaudu saab näidismalli alla laadida ning iga rida võrreldakse Eleringi turuhinnaga.

## API

| Meetod | Lõik           | Kirjeldus                              |
| ------ | -------------- | -------------------------------------- |
| GET    | `/api/reports` | Tagastab viimase analüüsi ja meta info |
| POST   | `/api/reports` | Vastuvõtab arve JSON objektina         |

```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "externalInvoiceId": "ER-2025-0012",
  "periodStart": "2025-02-01",
  "periodEnd": "2025-02-28",
  "energyMWh": 118.5,
  "totalCostEUR": 8120
}
```

Vastus sisaldab turuhinna võrdlust ning kinnitust, et arve salvestati.

## Tehniline ülevaade

- **React Router 7 + Vite** – täisstack router loaderitega.
- **Tailwind CSS 4** – klaasfrost stiil, tumerežiimi tugi.
- **Recharts & Lucide** – graafikud ja ikoonid.
- **Papaparse + Zod** – CSV ja API sisendi valideerimine.
- **ML utiliidid** – `app/lib/ml.ts` sisaldab libisevat keskmist, standardhälvet, efektiivsuse hinnangut ja raporti ehitajat.

## Arhitektuuri kaustad

- `app/routes/home.tsx` – põhivaade koos kõikide sektsioonidega.
- `app/routes/api.reports.ts` – serveripoolne API.
- `app/lib/*` – Eleringi teenus, CSV parser, ML, raport ja võrdlusloogika.
- `app/components/*` – taaskasutatavad UI plokid (graafikud, tabelid, raportid, integratsioon).

Projekt on ehitatud nii, et seda saaks laiendada EstFeedi autentimise, täpsema masinõppe või väliste webhookide loogikaga. 🎛️
