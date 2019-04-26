function createObserver(isDev) {
  const observer = {
    values: {},
    fns: {},
    subKeys: {},
    triggers: {},
    devHistory: [],
    devEventNumber: {},
    devHook: void 0,
    subscribe: (key, fn) => {
      if (typeof fn !== 'function') {
        throw new Error('observer.subscribe: fn need typeof function');
      }
      if (!observer.fns[key]) {
        observer.fns[key] = {};
        observer.subKeys[key] = 0;
        observer.triggers[key] = value => {
          if (isDev) {
            const now = new Date();
            const time = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

            const id = Date.now() + Math.random();

            if (observer.devEventNumber[key] === void 0) {
              observer.devEventNumber[key] = {};
            }

            let num = 0;

            // eslint-disable-next-line
            for (const unused in observer.devEventNumber[key]) {
              num += 1;
            }
            observer.devEventNumber[key]['len'] = num;
            observer.devEventNumber[key][id] = num;

            observer.devHistory.push({
              id,
              time,
              name: key,
              value,
              lastValue: observer.values[key],
            });
            if (observer.devHook) {
              observer.devHook(key);
            }
          }

          for (const k in observer.fns[key]) {
            observer.fns[key][k](value);
          }
          observer.values[key] = value;
        };
      }

      observer.subKeys[key] += 1;

      const k = observer.subKeys[key];

      observer.fns[key][k] = fn;

      return () => {
        if (observer.fns[key][k]) {
          delete observer.fns[key][k];
        }
      };
    },
  };

  return observer;
}

export default createObserver;
