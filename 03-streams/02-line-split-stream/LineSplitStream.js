const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.remainder = '';
    this.encoding = options.encoding;
  }

  _transform(chunk, encoding, callback) {
    if (this.encoding !== 'utf-8') {
      callback(null, chunk);
    } else {
      const parts = (this.remainder + chunk.toString(this.encoding)).split(os.EOL);
      this.remainder = parts[parts.length - 1];
      parts.slice(0, -1).forEach((part) => callback(null, part));
    }
  }

  _flush(callback) {
    this.remainder && callback(null, this.remainder);
  }
}

module.exports = LineSplitStream;
