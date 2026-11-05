# AI ukázka pro dsh-solutions.cz

Serverová funkce pro sekci „Vyzkoušejte si to" na webu. Návštěvník popíše, co ho
ve firmě zdržuje, a dostane krátký návrh aplikace na míru. Běží na Vercelu jako
samostatný projekt; web zůstává na GitHub Pages a volá ji přes fetch.

## Nasazení (Vercel)

1. Vercel → **Add New → Project** → Import `skorunka/dsh-solutions.cz`.
2. **Project name:** `dsh-ai` (adresa pak bude `dsh-ai.vercel.app`; `script.js` ji očekává).
3. **Root Directory:** `ai`. Framework preset: Other.
4. **Environment Variables:**
   - `ANTHROPIC_API_KEY` – klíč z Claude Console
   - `AI_UKAZKA` – `on`
5. Deploy. Každý další push do `master` se nasadí sám.

## Vypínač

- `AI_UKAZKA=off` ve Vercelu → **Redeploy** → sekce na webu zmizí při dalším
  načtení stránky (web se funkce ptá `GET /api/navrh` → `{ enabled }`).
- Když dojde kredit nebo je klíč neplatný, funkce se sama na hodinu vypne a pošle
  e-mail přes Formspree na info@dsh-solutions.cz.

## Strop útraty

Model `claude-haiku-5-5`, nízké úsilí, krátké odpovědi: jeden návrh stojí
zlomek haléře. Tvrdý strop je předplacený kredit v Console s vypnutým
automatickým dobíjením. Měkké limity ve funkci: 20 dotazů na IP za 10 minut,
300 na instanci za hodinu, vstup 15–700 znaků.

## Lokální test

```
cd ai && npm install
ANTHROPIC_API_KEY=… AI_UKAZKA=on ALLOWED_ORIGINS=http://127.0.0.1:8080 node local.mjs
```
Pak `curl -X POST http://127.0.0.1:8787/api/navrh -H 'Content-Type: application/json' -d '{"text":"…"}'`.
