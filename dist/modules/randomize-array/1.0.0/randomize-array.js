'use strict';

function randomizeArray (array) {
  const randomized = [];
  for (let i = 0, j = array.length; i < j; i++) {
    randomized.push(array.splice(Math.floor(Math.random() * array.length), 1)[0]);
  }
  for (const el of randomized) {
    array.push(el);
  }
}

export default randomizeArray;
