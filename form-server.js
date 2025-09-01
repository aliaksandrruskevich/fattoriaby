const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const port = process.env.PORT || 3000;

// Simple in-memory storage for form submissions (in production, use a database)
let formSubmissions = [];

// Load existing submissions if file exists
const submissionsFile = path.join(__dirname, 'form-submissions.json');
if (fs.existsSync(submissionsFile)) {
  try {
    formSubmissions = JSON.parse(fs.readFileSync(submissionsFile, 'utf8'));
  } catch (error) {
    console.log('Could not load existing submissions, starting fresh');
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle form submissions
if (req.method === 'POST' && pathname === '/submit-form') {
    let body = '';

    console.log('Content-Type:', req.headers['content-type']); // Log content-type

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log('Raw body:', body); // Log raw body

      try {
        const formData = querystring.parse(body);
        const submission = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...formData
        };

        formSubmissions.push(submission);

        // Log submission to console
        console.log('New form submission:', submission);

        // Save to file for persistence
        fs.writeFileSync(submissionsFile, JSON.stringify(formSubmissions, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Form submitted successfully' }));
      } catch (error) {
        console.error('Error processing form submission:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Error processing form submission' }));
      }
    });
    return;
  }

  // Handle GET requests for viewing submissions
  if (req.method === 'GET' && pathname === '/submissions') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(formSubmissions));
    return;
  }

  // Handle static files for admin interface
  if (pathname === '/') {
    pathname = '/admin.html';
  }

  const filePath = path.join(__dirname, 'admin', pathname);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
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
      case '.json':
        contentType = 'application/json';
        break;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Form server running at http://localhost:${port}`);
  console.log(`Form submissions will be saved to form-submissions.json`);
  console.log(`View submissions at http://localhost:${port}/submissions`);
});
