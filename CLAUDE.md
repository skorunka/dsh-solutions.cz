# dsh-solutions.cz

Statický web DSH Solutions, bez buildu. Nasazuje se přes GitHub Pages z větve `master`,
vlastní doména je v `CNAME`.

## Komunikace

- **Česky a tykat.** Platí trvale.

## Struktura

- `index.html`, `style.css`, `script.js` — landing page (AI development, portfolio s galerií a lightboxem)
- `images/<projekt>/*.webp` — screenshoty projektů do galerie
- `promo/` — podklady k maturitnímu plesu: letáček A6, nálepky, slide na projektor, QR kódy, `PLES.md`
- `ples/` — neodkazovaná stránka pro Anežku a spolužáky (`noindex`), odkazuje na soubory v `promo/`
- `ai/` — serverová funkce AI ukázky („Vyzkoušejte si to“), samostatný projekt na Vercelu (`dsh-ai-one`),
  root directory `ai`. Web ji volá z `script.js` (`AI_API`). Návod a vypínač: `ai/README.md`.

## Konvence

- Texty česky, krátké věty, české uvozovky „takto“.
- **Žádné umělé zalamování**: nepoužívat `text-wrap: balance` ani `max-width` v `ch` na odstavcích.
  Text má téct přes celou šířku kontejneru.
- Obrázky do galerie: WebP, desktop max 1440 px na šířku, mobilní snímky max 900 px.
- Stránka `ples/` se nesmí odkazovat z landing page a musí mít `noindex, nofollow`.
- Sekce `#vyzkouset` a odkaz `.nav__link--ai` jsou v HTML `hidden`; zobrazí je až `script.js`,
  když `GET /api/navrh` vrátí `{ enabled: true }`. Vypínač je `AI_UKAZKA` ve Vercelu (po změně Redeploy).
- Klíč `ANTHROPIC_API_KEY` je jen ve Vercelu. Nikdy do repozitáře, logů ani chatu.
- **Verze stylů a skriptů:** `index.html` načítá `style.css?v=…` a `script.js?v=…`.
  Při každé změně `style.css` nebo `script.js` zvyš `?v=` (např. `2026-11-03.3`),
  jinak telefony až 10 minut drží starou verzi z cache GitHub Pages.
