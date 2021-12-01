const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const urlWrapper = new URL(req.url, `http://${ req.headers.host }`);
  const pathname = urlWrapper.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  const fileStream = fs.createReadStream(filepath);
  fileStream
      .on('error', function(err) {
        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File not found');
        } else {
          send500(res);
        }
      })
      .on('close', function() {
        fileStream.destroy();
      });

  req.on('aborted', () => fileStream.destroy());

  switch (req.method) {
    case 'GET':
      if (req.url === `/${ pathname.split('/')[0] }`) {
        fileStream.pipe(res).on('error', send500(res));
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

const send500 = (res) => () => {
  res.statusCode = 500;
  res.end('Server error');
};

module.exports = server;
