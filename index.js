import React from 'react';
import createObserver from './createObserver';

const createWit = (actions, defalutValues, devKeyCode) => {
  // 初始化订阅发布对象
  const observer = createObserver(devKeyCode);

  observer.values = { ...defalutValues };

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

        updates = Object.create(null);

        constructor(props) {
          super(props);

          // 根据 HOC 参数捆绑订阅发布
          keys.forEach(k => {
            this.state[k] = observer.values[k];

            // 捆绑触发函数
            this.updates[k] = value => {
              observer.triggers[k](value, this.$$witID);
            };

            // 创建订阅器
            this.removeSubscribes[k] = observer.subscribe(k, (v, witID) => {
              // 如果发布器不是本组件, 仅做更新, 不执行 actions
              if (witID !== this.$$witID) {
                if (!this.unmount) {
                  this.setState({
                    [k]: v,
                  });
                }
                return;
              }

              // 如果发布器是本组件, 执行action, 并且在action中选择性的更新
              // 参数为: (value, update, {witValues, witUpdates, witRollback})
              actions[k](
                v,
                (nextValue, isSaveHistory) => {
                  // 更新observer中的值
                  const id = observer.setValues(k, nextValue, isSaveHistory);

                  if (!this.unmount) {
                    this.setState({
                      [k]: nextValue,
                    });
                  }

                  return id;
                },
                { witValues: observer.values, witUpdates: observer.triggers, witRollback: observer.rollback },
              );
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
              witValues={observer.values}
              witUpdates={this.updates}
              witRollback={observer.rollback}
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

  wit.witValues = observer.values;
  wit.witUpdates = observer.triggers;
  wit.witRollback = observer.rollback;

  return wit;
};

export default createWit;
