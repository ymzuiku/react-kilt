function createObserver(isDev) {
  const observer = {
    values: Object.create(null),
    valuesMap: Object.create(null),
    fns: Object.create(null),
    subKeys: Object.create(null),
    triggers: Object.create(null),
    devHistory: [],
    devEventNumber: Object.create(null),
    devHook: void 0,
    subscribe: (key, fn) => {
      if (typeof fn !== 'function') {
        throw new Error('observer.subscribe: fn need typeof function');
      }
      if (!observer.fns[key]) {
        observer.fns[key] = {};
        observer.subKeys[key] = 0;
        observer.triggers[key] = value => {
          for (const k in observer.fns[key]) {
            observer.fns[key][k](value);
          }
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
    setValues: (key, value, isSaveHistort) => {
      let id;

      // 更新values
      observer.values[key] = value;

      // 记录历史values
      if (isSaveHistort || isDev) {
        id = Date.now() + Math.random();

        observer.valuesMap[id] = { ...observer.values };
      }

      // 记录历史变更时间及值
      if (isDev) {
        if (!id) {
          id = Date.now() + Math.random();
        }

        const now = new Date();
        const time = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        if (observer.devEventNumber[key] === void 0) {
          observer.devEventNumber[key] = {};
        }

        const num = observer.devHistory.length;

        observer.devEventNumber[key]['len'] = num;
        observer.devEventNumber[key][id] = num;

        observer.devHistory.push({
          num,
          id,
          time,
          name: key,
          value,
          values: { ...observer.values },
          lastValue: observer.valuesMap[id][key],
          lastValues: observer.valuesMap[id],
        });
        if (observer.devHook) {
          observer.devHook(key);
        }
      }

      return id;
    },
    rollbackOfId: id => {
      if (!id || !observer.valuesMap[id]) {
        // eslint-disable-next-line
        console.warn('react-wit: rollbackOfId is error');
        return;
      }
      const oldValue = observer.valuesMap[id];

      for (const k in observer.values) {
        observer.values[k] = oldValue[k];

        observer.triggers[k]({
          __rollback__: 'true',
          value: oldValue[k],
        });
      }
    },
  };

  const key = '__init__';

  observer.subscribe(key, v => {
    if (v === key) {
      observer.setValues(key, void 0);
    }
  });
  observer.triggers[key](key);

  return observer;
}

export default createObserver;
