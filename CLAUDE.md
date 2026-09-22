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

## Konvence

- Texty česky, krátké věty, české uvozovky „takto“.
- **Žádné umělé zalamování**: nepoužívat `text-wrap: balance` ani `max-width` v `ch` na odstavcích.
  Text má téct přes celou šířku kontejneru.
- Obrázky do galerie: WebP, desktop max 1440 px na šířku, mobilní snímky max 900 px.
- Stránka `ples/` se nesmí odkazovat z landing page a musí mít `noindex, nofollow`.
