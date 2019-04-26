import React from 'react';
import createObserver from './createObserver';
import devtool from './devtool';

const Kilt = (actions, defalutValues, devKeyCode) => {
  if (typeof window === 'undefined') {
    devKeyCode = void 0;
  }
  const observer = createObserver(devKeyCode);

  observer.values = { ...defalutValues };

  if (devKeyCode) {
    devtool(observer, devKeyCode);
  }

  const controller = { values: observer.values, kiltPush: observer.triggers };

  return [
    (...keys) => {
      return Target => {
        class Result extends React.PureComponent {
          action = {};

          constructor(props) {
            super(props);

            const state = {};

            keys.forEach(k => {
              state[k] = void 0;
              observer.subscribe(k, v => {
                if (typeof actions[k] !== 'function') {
                  throw new Error(`错误: kilt 的 actions 中未包含 ${k} 属性`);
                }
                actions[k](
                  nextValue => {
                    this.setState({
                      [k]: nextValue,
                    });
                  },
                  v,
                  observer.values,
                  observer.triggers,
                );
              });
            });

            this.state = state;
          }

          render() {
            const { forwardedRef, ...rest } = this.props;

            return <Target {...rest} {...this.state} ref={forwardedRef} kiltPush={observer.triggers} />;
          }
        }

        return React.forwardRef((props, ref) => {
          return <Result {...props} forwardedRef={ref} />;
        });
      };
    },
    controller,
  ];
};

export default Kilt;
