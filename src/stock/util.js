import parallel from 'async/parallel';
import util from 'util';

import { INDEX_LABELS, INDEX_LIST } from './cons';


export function codeToSymbol(code) {
  let symbol = '';
  if (INDEX_LABELS.indexOf(code) >= 0) {
    symbol = INDEX_LIST[code];
  } else if (code.length === 6) {
    symbol = ['5', '6', '9'].indexOf(code.charAt(0)) >= 0 ? `sh${code}` : `sz${code}`;
  } else {
    symbol = code;
  }

  return symbol;
}

export function csvToObject(csv) {
  let csvArr = csv.trim().split('\r\n');
  let headers = csvArr.splice(0, 1);

  headers = headers[0].split(',');
  csvArr = csvArr.map(ele => {
    const obj = {};
    ele.split(',').forEach((s, i) => {
      obj[headers[i]] = s;
    });
    return obj;
  });

  return csvArr;
}

export function arrayObjectMapping(fields, items) {
  return items.map(ele => {
    const obj = {};
    ele.forEach((s, i) => {
      const field = fields[i];
      if (field === 'volume') {
        obj[field] = s / 100;
      } else if (field === 'amount') {
        obj[field] = s / 10000;
      } else {
        obj[field] = s;
      }
    });
    return obj;
  });
}

const _pow = (base, exp) => {
  let _b = base;
  for (let _i = 0; _i < exp; _i += 1) {
    _b *= base;
  }
  return _b;
};

export function randomString(num) {
  const lower = _pow(10, (num - 1));
  const upper = _pow(10, num) - 1;
  const rnum = lower + (Math.random() * (upper - lower));
  return util.format('%s', rnum);
}

export const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
};

/**
 * create a list of fetch tasks
 * return [promise, promise, ...]
 */
export const createFetchTasks = urls =>
  urls.map(url =>
    fetch(url)
    .then(checkStatus)
    .then(res => res.text())
  );

/**
 * @return [ [obj, obj, ...], [obj, obj, ...], ... ]
 */
export const runTasksInParallel = tasks =>
  new Promise((resolve, reject) => {
    parallel(
      tasks.map(task => callback => task.then(data => callback(null, data))),
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });

