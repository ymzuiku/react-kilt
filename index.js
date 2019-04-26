import React from 'react';
import createObserver from './createObserver';
import devtool from './devtool';

const createWit = (actions, defalutValues, devKeyCode) => {
  if (typeof window === 'undefined') {
    devKeyCode = void 0;
  }
  const observer = createObserver(devKeyCode);

  observer.values = { ...defalutValues };

  if (devKeyCode) {
    devtool(observer, devKeyCode);
  }

  const wit = (...keys) => {
    return Target => {
      class Result extends React.PureComponent {
        unmount = false;

        constructor(props) {
          super(props);

          const state = {};

          keys.forEach(k => {
            state[k] = void 0;
            observer.subscribe(k, v => {
              if (typeof actions[k] !== 'function') {
                throw new Error(`错误: wit 的 actions 中未包含 ${k} 属性`);
              }
              actions[k](
                v,
                nextValue => {
                  if (!this.unmount) {
                    this.setState({
                      [k]: nextValue,
                    });
                  }
                },
                observer.triggers,
                observer.values,
              );
            });
          });

          this.state = state;
        }

        componentWillUnmount() {
          this.unmount = true;
        }

        render() {
          const { forwardedRef, ...rest } = this.props;

          return <Target {...rest} {...this.state} ref={forwardedRef} updateWit={observer.triggers} />;
        }
      }

      return React.forwardRef((props, ref) => {
        return <Result {...props} forwardedRef={ref} />;
      });
    };
  };

  wit.values = observer.values;
  wit.updateWit = observer.triggers;

  return wit;
};

export default createWit;
