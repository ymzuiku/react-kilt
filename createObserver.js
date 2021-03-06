function createObserver(isDev) {
  const observer = {
    values: Object.create(null),
    valuesMap: Object.create(null),
    store: {
      get: path => {
        const list = path.split('.');
        let data = observer.values;

        for (let i = 0; i < list.length; i++) {
          data = data[list[i]];

          if (data === void 0) {
            break;
          }
        }
        return data;
      },
      set: (name, nextValue, isSaveHistory) => {
        // 更新observer中的值
        const id = observer.setValues(name, nextValue, isSaveHistory);

        if (observer.triggers[name]) {
          observer.triggers[name](nextValue);
        }
        return id;
      },
    },
    rollbackIds: [],
    fns: Object.create(null),
    subKeys: Object.create(null),
    triggers: Object.create(null),
    devHistory: [],
    devHook: void 0,
    subscribe: (key, fn) => {
      if (typeof fn !== 'function') {
        throw new Error('observer.subscribe: fn need typeof function');
      }
      if (!observer.fns[key]) {
        observer.fns[key] = {};
        observer.subKeys[key] = 0;
        observer.triggers[key] = (value, id) => {
          for (const k in observer.fns[key]) {
            observer.fns[key][k](value, id);
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
    setValues: (key, value, isSaveHistory) => {
      let id;
      // 获取回滚到上一次的id
      const lastId = observer.rollbackIds[observer.rollbackIds.length - 1];

      // 更新values
      if (key !== '__rollback__') {
        observer.values[key] = value;
      }

      // 记录历史values
      if (isSaveHistory || isDev) {
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

        const num = observer.devHistory.length;

        // 从数组开头插入
        observer.devHistory = [
          {
            num,
            id,
            time,
            name: key,
            value: key === '__rollback__' ? void 0 : value,
            values: { ...observer.values },
            lastValue: key === '__rollback__' ? void 0 : observer.valuesMap[lastId] && observer.valuesMap[lastId][key],
            lastValues: key === '__rollback__' ? void 0 : observer.valuesMap[lastId],
          },
        ].concat(observer.devHistory);

        if (observer.devHook) {
          observer.devHook(key);
        }
      }

      observer.rollbackIds.push(id);
      return lastId;
    },
    dispatch: (fn, payload) => {
      fn({
        values: observer.values,
        store: observer.store,
        dispatch: observer.dispatch,
        rollback: observer.rollback,
        payload,
      });
    },
    rollback: id => {
      if (!id || !observer.valuesMap[id]) {
        // eslint-disable-next-line
        console.warn('react-wit: rollbackOfId is error');
        return;
      }
      const oldValue = observer.valuesMap[id];

      observer.setValues('__rollback__', oldValue);

      for (const k in observer.values) {
        observer.values[k] = oldValue[k];

        observer.triggers[k](oldValue[k]);
      }
    },
  };

  const key = '__init__';

  observer.subscribe(key, v => {
    if (v === key) {
      observer.setValues(key, void 0, true);
    }
  });
  observer.triggers[key](key);

  if (isDev) {
    window.witObserver = observer;
  }

  return observer;
}

export default createObserver;
