const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { fetchProperties, getMockData, fetchAndSyncProperties } = require('./api/properties');
const { getPropertyByUnid } = require('./db');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/') {
    pathname = '/index.html'; // Serve index.html as main page
  }

  // Handle API routes
  if (pathname === '/api/properties.php' || pathname === '/api/properties') {
    const limit = parseInt(parsedUrl.query.limit) || 12; // Changed default to 12
    const offset = parseInt(parsedUrl.query.offset) || 0; // Added offset parameter
    const filters = {
      operation: parsedUrl.query.operation,
      type: parsedUrl.query.type,
      rooms: parsedUrl.query.rooms,
      price_min: parsedUrl.query.price_min ? parseInt(parsedUrl.query.price_min) : undefined,
      price_max: parsedUrl.query.price_max ? parseInt(parsedUrl.query.price_max) : undefined,
      area_min: parsedUrl.query.area_min ? parseInt(parsedUrl.query.area_min) : undefined,
      area_max: parsedUrl.query.area_max ? parseInt(parsedUrl.query.area_max) : undefined,
      sort: parsedUrl.query.sort
    };

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    fetchProperties(limit, offset, filters) // Updated to pass offset
      .then(properties => {
        res.end(JSON.stringify(properties));
      })
      .catch(err => {
        console.error('Error fetching properties:', err);
        // Return mock data on error
        const mockData = getMockData();
        res.end(JSON.stringify(mockData.slice(offset, offset + limit))); // Apply offset to mock data
      });

    return;
  }

  // Handle sync API
  if (pathname === '/api/sync') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    fetchAndSyncProperties()
      .then(() => {
        res.end(JSON.stringify({ success: true, message: 'Sync completed' }));
      })
      .catch(err => {
        console.error('Error syncing properties:', err);
        res.end(JSON.stringify({ success: false, error: err.message }));
      });

    return;
  }

  // Handle property detail API
  const propertyMatch = pathname.match(/^\/api\/property\/(.+)$/);
  if (propertyMatch) {
    const unid = propertyMatch[1];

    getPropertyByUnid(unid)
      .then(property => {
        if (property) {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(JSON.stringify(property));
        } else {
          res.writeHead(404, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'Property not found' }));
        }
      })
      .catch(err => {
        console.error('Error fetching property:', err);
        res.writeHead(500, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      });

    return;
  }

  // Handle property detail pages
  let filePath;
  const detailMatch = pathname.match(/^\/object\/(.+)$/);
  if (detailMatch) {
    const unid = detailMatch[1];
    filePath = path.join(__dirname, 'public', 'object.html');
  } else {
    // Check if it's an HTML file
    if (path.extname(pathname) === '.html') {
      // First try public folder
      const publicPath = path.join(__dirname, 'public', pathname);
      const rootPath = path.join(__dirname, pathname);
      
      // Check if file exists in public folder
      if (fs.existsSync(publicPath)) {
        filePath = publicPath;
      } else if (fs.existsSync(rootPath)) {
        filePath = rootPath;
      } else {
        filePath = publicPath; // Will trigger 404 handler
      }
    } else {
      // For CSS, JS, images, includes, etc., serve from root
      filePath = path.join(__dirname, pathname);
    }
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
      // Add more as needed
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Server with API running at http://localhost:${port}`);
});
