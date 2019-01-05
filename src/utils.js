function comparer(v, k, b, isArray, path, r) {
  let index;
  const newPath = path.concat([k]);
  if (isArray && v != null && typeof v === 'object'
      && k != (index = b.findIndex(i => i && (i === v || (v.id != null && i.id === v.id) || (v._id != null && i._id === v._id)))))  {
    return r.push(newPath.concat([index > -1 ? b[index] : v]));
  }
  return r.push.apply(r, diff(v, b[k], newPath));
}

export function isWrappable(obj) { return obj !== null && typeof obj === 'object' && !(obj instanceof Element); }

export function diff(a, b, path = []) {
  let i, k, l, len, v;
  const r = [];
  if (!isWrappable(a) || (b == null)) {
    if (a !== b) {
      r.push(path.concat([a]));
    }
  } else if (Array.isArray(a)) {
    for (k = i = 0, len = a.length; i < len; k = ++i) {
      v = a[k];
      if ((b != null ? b[k] : void 0) !== v) comparer(v, k, b, true, path, r);
    }
    if ((b != null ? b.length : void 0) > a.length) {
      l = a.length;
      while (l < b.length) {
        r.push(path.concat([l, void 0]));
        l++;
      }
    }
  } else {
    for (k in a) {
      v = a[k];
      if ((b != null ? b[k] : void 0) !== v)
        comparer(v, k, b, false, path, r);
    }
    for (k in b) {
      v = b[k];
      if (!(k in a))
        r.push(path.concat([k, void 0]));
    }
  }
  return r;
}

export function unwrap(item) {
  let result, unwrapped, v;
  if (result = (item != null) && item._state) return result;
  if (!isWrappable(item)) return item;

  if (Array.isArray(item)) {
    if (Object.isFrozen(item)) item = item.slice(0);
    for (let i = 0, l = item.length; i < l; i++) {
      v = item[i];
      if ((unwrapped = unwrap(v)) !== v) item[i] = unwrapped;
    }
  } else {
    if (Object.isFrozen(item)) item = Object.assign({}, item);
    let keys = Object.keys(item);
    for (let i = 0, l = keys.length; i < l; i++) {
      v = item[keys[i]];
      if ((unwrapped = unwrap(v)) !== v) item[keys[i]] = unwrapped;
    }
  }
  return item;
}

// export observable
export function observable(input) {
  if (Symbol.observable in input) return input[Symbol.observable]();
  return {
    subscribe(observer) {
      if (!(observer instanceof Object) || observer == null) {
        throw new TypeError('Expected the observer to be an object.');
      }
      observer = observer.next || observer;
      let complete = false;
      S.on(input, function next() {
        if (complete) return;
        observer(input());
      });
      return {
        unsubscribe() { complete = true; }
      };
    },
    [Symbol.observable]() { return this; }
  };
}