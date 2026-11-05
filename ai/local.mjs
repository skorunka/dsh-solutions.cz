// Lokální obal nad api/navrh.js. Vercel parsuje JSON tělo sám; tady to dělá handler ze streamu.
//   ANTHROPIC_API_KEY=… AI_UKAZKA=on ALLOWED_ORIGINS=http://127.0.0.1:8080 node local.mjs
import http from "node:http";
import handler from "./api/navrh.js";

const port = Number(process.env.PORT || 8787);
http
  .createServer((req, res) => {
    if (new URL(req.url, "http://x").pathname !== "/api/navrh") {
      res.statusCode = 404;
      return res.end();
    }
    handler(req, res).catch((err) => {
      console.error(err);
      res.statusCode = 500;
      res.end('{"ok":false,"duvod":"nedostupne"}');
    });
  })
  .listen(port, "127.0.0.1", () => console.log("ai local http://127.0.0.1:" + port));
