'use strict';

// v1.0.0
function getPlaceStatus (place, getEventList, unixTimestamp = Date.now()) {
  if (!place || !place.opening_hours || !place.opening_hours.periods || !place.utc_offset) {
    throw new Error('Required information is missing from place object');
  }
  
  if (place.permanently_closed) {
    return {
      always: {
        closed: true,
        open: false,
      },
      for: null,
      next: {
        day: null,
        time: null,
        type: null,
      },
      open: false,
    };
  }
  
  const [periods, utc_offset] = [place.opening_hours.periods, place.utc_offset];
  const date = new Date(parseInt(unixTimestamp, 10) + (utc_offset * 60 * 1000));
  const now = {
    day: date.getUTCDay(),
    time: `${`${date.getUTCHours()}`.padStart(2, '0')}${`${date.getUTCMinutes()}`.padStart(2, '0')}`,
    type: 'now',
  };
  
  const events = [];
  
  for (const period of periods) {
    if (period.open) {
      events.push({
        day: period.open.day,
        time: period.open.time,
        type: 'open',
      });
    }
    if (period.close) {
      events.push({
        day: period.close.day,
        time: period.close.time,
        type: 'close',
      });
    }
  }
  
  // place is open 24/7
  if (
    events.length === 1
    && events[0].day === 0
    && events[0].time === '0000'
    && events[0].type === 'open'
  ) {
    return {
      always: {
        closed: false,
        open: true,
      },
      for: null,
      next: {
        day: null,
        time: null,
        type: null,
      },
      open: true,
    };
  }
  
  events.push(now);
  
  events.sort((a, b) => {
    if (a.time < b.time) {
      return -1;
    }
    else if (a.time > b.time) {
      return 1;
    }
    return 0;
  }).sort((a, b) => {
    return a.day - b.day;
  });
  
  const nowIndex = events.findIndex(el => el.type === 'now');
  let status;
  if (nowIndex > 0) {
    status = events[nowIndex - 1].type;
  }
  else {
    status = events[events.length - 1].type;
  }
  if (status !== 'open' && status !== 'close') {
    throw new Error('Could not determine status');
  }
  
  function getTime (event) {
    let time = 0;
    const [hours, minutes] = [parseInt(event.time.slice(0, 2), 10), parseInt(event.time.slice(2, 4), 10)];
    time += event.day * 24 * 60;
    time += hours * 60;
    time += minutes;
    return time;
  }
  
  if (nowIndex === events.length - 1) {
    events.push({...events[0]});
    events[events.length - 1].day += 7;
    events[events.length - 1].computed = true;
  }
  
  const result = {
    always: {
      closed: false,
      open: false,
    },
    for: getTime(events[nowIndex + 1]) - getTime(events[nowIndex]),
    next: {
      day: events[nowIndex + 1].day % 7,
      time: events[nowIndex + 1].time,
      type: events[nowIndex + 1].type,
    },
    open: status === 'open' ? true : false,
  };
  
  if (getEventList) {
    result.events = events.filter(el => !el.computed && el.type !== 'now');
  }
  
  return result;
}

// v1.0.0
function getRandomInt (max = 1, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// v1.0.0
function html (tagName, attributes, ...childNodes) {
  const el = document.createElement(tagName);
  if (attributes) {
    for (const [prop, value] of Object.entries(attributes)) {
      if (prop === 'style' && (Array.isArray(value) || value instanceof Map)) {
        for (const declaration of value) {
          el.style.setProperty(...declaration);
        }
      }
      else {
        el.setAttribute(prop, value);
      }
    }
  }
  if (childNodes) {
    for (let node of childNodes) {
      if (typeof node === 'string') {
        node = document.createTextNode(node);
      }
      el.appendChild(node);
    }
  }
  return el;
}

// v1.0.0
function isStringNumber (str) {
  if (str.trim() !== '' && Number(str) === Number(str)) {
    return true;
  }
  else return false;
}

// v0.8.3
class JSONbin {
  constructor (secretKey) {
    if (secretKey) {
      this.key = secretKey;
    }
    this.url = {
      origin: 'https://api.jsonbin.io',
      path: {
        bin: '/b',
        collection: '/c',
        experimental: '/e',
        geolocation: '/g'
      }
    };
  }

  get c () {
    return {
      key: this.key ? this.key : undefined,
      transmit: this.transmit,
      url: this.url,
      async create (name) {
        const init = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'}
        };
        if (this.key) {
          Object.assign(init.headers, {'secret-key': this.key});
          if (name) {
            Object.assign(init, {body: JSON.stringify({name: name})});
          }
        }
        return this.transmit(new Request(`${this.url.origin}${this.url.path.collection}`, init), 'c.create');
      },
      async update (id, name) {
        const init = {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'}
        };
        if (this.key) {
          Object.assign(init.headers, {'secret-key': this.key});
          if (name) {
            Object.assign(init, {body: JSON.stringify({name: name})});
          }
        }
        return this.transmit(new Request(`${this.url.origin}${this.url.path.collection}/${id}`, init), 'c.update');
      }
    };
  }
  
  get e () {
    return {
      key: this.key ? this.key : undefined,
      transmit: this.transmit,
      url: this.url,
      async versions (id) {
        const init = {
          method: 'GET'
        };
        if (this.key) {
          init.headers = {'secret-key': this.key};
        }
        return this.transmit(new Request(`${this.url.origin}${this.url.path.experimental}/${id}/versions`, init), 'e.versions');
      }
    };
  }
  
  get g () {
    return {
      transmit: this.transmit,
      url: this.url,
      async lookup (address) {
        return this.transmit(new Request(`${this.url.origin}${this.url.path.geolocation}/${address}`), 'g.lookup');
      }
    };
  }
  
  async create (data, collectionId, name, makePublic) {
    const init = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    };
    if (this.key) {
      Object.assign(init.headers, {'secret-key': this.key});
      if (collectionId) {
        Object.assign(init.headers, {'collection-id': collectionId});
      }
      if (name) {
        Object.assign(init.headers, {'name': name});
      }
      if (makePublic) {
        Object.assign(init.headers, {'private': false});
      }
    }
    return this.transmit(new Request(`${this.url.origin}${this.url.path.bin}`, init), 'create');
  }
  
  async delete (id) {
    const init = {
      method: 'DELETE'
    };
    if (this.key) {
      init.headers = {'secret-key': this.key};
    }
    return this.transmit(new Request(`${this.url.origin}${this.url.path.bin}/${id}`, init), 'delete');
  }
  
  async read (id, version = '/latest') {
    const init = {
      method: 'GET'
    };
    if (typeof version === 'number') {
      version = parseInt(version, 10);
      if (version === 0) {
        version = '';
      }
      version = `/${version}`;
    }
    if (this.key) {
      init.headers = {'secret-key': this.key};
    }
    return this.transmit(new Request(`${this.url.origin}${this.url.path.bin}/${id}${version}`, init), 'read');
  }
  
  async update (id, data, replaceLatest) {
    const init = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    };
    if (this.key) {
      Object.assign(init.headers, {'secret-key': this.key});
      if (replaceLatest) {
        Object.assign(init.headers, {'versioning': false});
      }
    }
    return this.transmit(new Request(`${this.url.origin}${this.url.path.bin}/${id}`, init), 'update');
  }
  
  async transmit (request, operation) {
    try {
      const res = await fetch(request);
      if (res.ok) {
        const json = await res.json();
        switch (operation) {
          case 'create':
            return json.id;
          case 'delete':
            return json.message;
          case 'read':
            return json;
          case 'update':
            return json.version;
          case 'c.create':
            return json.id;
          case 'c.update':
            return json.success;
          case 'g.lookup':
            return json.data;
          default:
            return json;
        }
      }
      else {
        const json = await res.json();
        throw new Error(`Error ${res.status}: ${json.message}`);
      }
    }
    catch (err) {
      throw err;
    }
  }
}

// v1.0.0
function randomizeArray (array) {
  const randomized = [];
  for (let i = 0, j = array.length; i < j; i++) {
    randomized.push(array.splice(Math.floor(Math.random() * array.length), 1)[0]);
  }
  for (const el of randomized) {
    array.push(el);
  }
}

// v1.0.0
function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// v1.0.0
const xEl = {
  gen (tagName, attributes, ...childNodes) {
    const el = document.createElement(tagName);
    if (attributes) {
      for (const [prop, value] of Object.entries(attributes)) {
        if (prop === 'style' && (Array.isArray(value) || value instanceof Map)) {
          this.style(el, value);
        }
        else {
          el.setAttribute(prop, value);
        }
      }
    }
    if (childNodes) {
      for (let node of childNodes) {
        if (typeof node === 'string') {
          node = document.createTextNode(node);
        }
        el.appendChild(node);
      }
    }
    return el;
  },
  
  get input () {
    return {
      gen: this.gen,
      style: this.style,
      
      getCharacterWidth (el) {
        const styles = getComputedStyle(el);
        const borders = parseFloat(styles.getPropertyValue('border-width')) * 2;
        const paddingLeft = parseFloat(styles.getPropertyValue('padding-left'));
        const paddingRight = parseFloat(styles.getPropertyValue('padding-right'));
        const padding = paddingLeft + paddingRight;
        const textContent = 'hello world';
        const charCount = textContent.length;
        const span = this.gen('span', {style: styles.cssText}, textContent);
        this.style(span, [
          ['width', ''],
          ['opacity', '0'],
          ['position', 'absolute'],
          ['top', '0'],
          ['left', '0'],
        ]);
        document.body.appendChild(span);
        const width = span.getBoundingClientRect().width;
        span.remove();
        return (width - borders - padding) / charCount;
      },

      parse (el) {
        const input = el.value;
        let type;
        let value;
        if (input === 'true') {
          type = 'boolean';
          value = true;
        }
        else if (input === 'false') {
          type = 'boolean';
          value = false;
        }
        else if (input === 'null') {
          type = 'null';
          value = null;
        }
        else if (input === input.trim() && input.trim() !== '' && Number(input) === Number(input)) {
          type = 'number';
          value = Number(input);
        }
        else {
          type = 'string';
          value = input.trim();
        }
        el.dataset.type = type;
        el.dataset.value = `${value}`;
        return value;
      },

      resizeMonospace (el, elBorder = 0, ...elPadding) {
        const styles = getComputedStyle(el);
        const borders = parseFloat(styles.getPropertyValue('border-width')) * 2;
        const paddingLeft = parseFloat(styles.getPropertyValue('padding-left'));
        const paddingRight = parseFloat(styles.getPropertyValue('padding-right'));
        const padding = paddingLeft + paddingRight;
        const charCount = el.value.length ? el.value.length : el.placeholder.length;
        let adjustments = elBorder;
        for (const side of elPadding) {
          adjustments += side;
        }
        const width = (this.getCharacterWidth(el) * charCount) + padding + borders + adjustments;
        this.style(el, [
          ['width', `${width}px`],
        ]);
      },
    };
  },

  style (el, declarations, clearExisting) {
    if (clearExisting) {
      el.style = '';
    }
    for (const declaration of declarations) {
      el.style.setProperty(...declaration);
    }
  },
};

// v1.0.0
const xStyleSheet = {
  gen (rules, parentEl = document.head) {
    const style = parentEl.appendChild(document.createElement('style'));
    // style.classList.add('js-styles');
    for (const [selector, declarations] of rules) {
      const index = style.sheet.insertRule(`${selector} {}`, style.sheet.cssRules.length);
      for (const declaration of declarations) {
        style.sheet.cssRules[index].style.setProperty(...declaration);
      }
    }
    return style.sheet;
  },
};

export {
  getPlaceStatus,
  getRandomInt,
  html,
  isStringNumber,
  JSONbin,
  randomizeArray,
  shuffleArray,
  xEl,
  xStyleSheet,
};
