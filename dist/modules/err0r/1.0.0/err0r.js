'use strict';

class Err0r extends Error {
  constructor (message, data) {
    super(message);
    this.name = 'Err0r';
    this.data = data;
  }
}

export default Err0r;
