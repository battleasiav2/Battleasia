const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
};
http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("403");
    return;
  }
    fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("404");
      return;
    }
    const ext = path.extname(file);
    const headers = { "Content-Type": types[ext] || "application/octet-stream" };
    if (ext === ".html" || ext === ".css" || ext === ".js") {
      headers["Cache-Control"] = "no-store";
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(4599, () => console.log("serving on http://localhost:4599"));
