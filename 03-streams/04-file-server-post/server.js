const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const MaxFileSize = 1048576;

const server = new http.Server();

server.on('request', async (req, res) => {
  const url = new URL(req.url, `http://${ req.headers.host }`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  const send500 = () => {
    res.statusCode = 500;
    res.end('Server error');
  };

  switch (req.method) {
    case 'POST':
      if (req.url === `/${ pathname.split('/')[0] }`) {
        const fileStream = new LimitSizeStream({limit: MaxFileSize, path: filepath})
            .on('close', function() {
              fileStream.destroy();
            });

        await fs.open(filepath, 'wx', (err) => {
          if (err && err.code === 'EEXIST') {
            res.statusCode = 409;
            return res.end('File already exists');
          }
        });

        await req.pipe(fileStream).on('error', async (err) => {
          if (err && err instanceof LimitExceededError) {
            try {
              fileStream.destroy();
              await fs.unlink(filepath, () => {});
            } catch (err) {
              return send500();
            }
            res.statusCode = 413;
            return res.end('File size cannot exceed 1Mb');
          } else if (err) {
            fileStream.destroy();
            fs.unlink(filepath, () => send500());
            return;
          }
          res.statusCode = 200;
          return res.end('File was successfully written.');
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

  req.on('aborted', async () => {
    await fs.unlink(filepath, () => send500());
  });
});

module.exports = server;
