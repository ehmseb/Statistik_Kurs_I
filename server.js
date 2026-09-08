const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, requested);

  if (!file.startsWith(root + path.sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.stat(file, (statError, stat) => {
    const target = !statError && stat.isDirectory() ? path.join(file, "index.html") : file;
    fs.readFile(target, (error, data) => {
      if (error) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": types[path.extname(target).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "public, max-age=300"
      });
      response.end(data);
    });
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`Statistik-Kurs läuft auf Port ${port}`);
});
