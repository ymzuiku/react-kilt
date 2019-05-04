import React from 'react';
import createObserver from './createObserver';

const createWit = (actions, defalutValues, devKeyCode) => {
  // 初始化订阅发布对象
  const observer = createObserver(devKeyCode);

  observer.values = { ...defalutValues };

  const dispatch = (key, payload) => {
    observer.dispatch(actions[key], payload);
  };

  // 初始化开发工具
  if (typeof window !== 'undefined' && devKeyCode) {
    import('./devtool').then(v => {
      if (v && v.default) {
        v.default(observer, devKeyCode);
      }
    });
  }

  // 创建HOC
  const wit = (...keys) => {
    return Target => {
      class Result extends React.PureComponent {
        // 用于校验触发事件的是否此组件
        $$witID = Symbol('witID');

        state = Object.create(null);

        unmount = false;

        removeSubscribes = Object.create(null);

        constructor(props) {
          super(props);

          // 只订阅 keys 中的值
          keys.forEach(k => {
            this.state[k] = observer.values[k];

            // 创建订阅器
            this.removeSubscribes[k] = observer.subscribe(k, v => {
              // 如果发布器不是本组件, 仅做更新, 不执行
              if (!this.unmount) {
                this.setState({
                  [k]: v,
                });
              }
            });
          });
        }

        componentWillUnmount() {
          // 标记组件将要被施放
          this.unmount = true;
          // 清空订阅
          for (const k in this.removeSubscribes) {
            if (typeof this.removeSubscribes[k] === 'function') {
              this.removeSubscribes[k]();
            }
          }
        }

        render() {
          const { forwardedRef, ...rest } = this.props;

          return (
            <Target
              {...rest}
              {...this.state}
              ref={forwardedRef}
              wit={{ values: observer.values, rollback: observer.rollback, dispatch }}
            />
          );
        }
      }

      // ref, HOC穿透
      return React.forwardRef((props, ref) => {
        return <Result {...props} forwardedRef={ref} />;
      });
    };
  };

  wit.values = observer.values;
  wit.update = observer.triggers;
  wit.rollback = observer.rollback;
  wit.dispatch = dispatch;

  return wit;
};

export default createWit;
