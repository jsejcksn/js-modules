'use strict';

function getRandomInt (max = 1, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default getRandomInt;
