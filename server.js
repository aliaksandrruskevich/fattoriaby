const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/') {
    pathname = '/index.html'; // Serve index.html as main page
  }

  let filePath;
  // Serve top-level HTML pages from public/, others from root
  if (path.extname(pathname) === '.html') {
    // Check if pathname is top-level (no additional slashes after initial)
    const topLevelMatch = pathname.match(/^\/[^\/]+\.html$/);
    if (topLevelMatch) {
      filePath = path.join(__dirname, 'public', pathname);
    } else {
      filePath = path.join(__dirname, pathname);
    }
  } else {
    filePath = path.join(__dirname, pathname);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Serve 404.html if file not found
      const notFoundPath = path.join(__dirname, 'public', '404.html');
      fs.readFile(notFoundPath, (err404, data404) => {
        if (err404) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(data404);
        }
      });
      return;
    }

    const ext = path.extname(filePath);
    let contentType = 'text/html';
    switch (ext) {
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.php':
        contentType = 'text/html'; // PHP will be handled by hosting, but for local Node, serve as text
        break;
      case '.ico':
        contentType = 'image/x-icon';
        break;
      // Add more as needed
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
});
