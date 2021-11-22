const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.currentDataLength = 0;
  }

  _transform(chunk, encoding, callback) {
    this.currentDataLength += encoding === 'buffer' ?
      chunk.length : chunk.toString(encoding).length;
    if (this.currentDataLength >= this.limit ) {
      callback(new LimitExceededError(), chunk);
    } else callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
