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
