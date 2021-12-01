const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', async (req, res) => {
  const url = new URL(req.url, `http://${ req.headers.host }`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (req.url === `/${ pathname.split('/')[0] }`) {
        await fs.unlink(filepath, (err) => {
          if (err && err.code === 'ENOENT') {
            res.statusCode = 404;
            return res.end('File not found');
          } else if (err) {
            res.statusCode = 500;
            return res.end('Server error');
          }
          res.statusCode = 200;
          return res.end('File successfully deleted');
        });
      } else {
        res.statusCode = 400;
        res.end('Bad request');
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
