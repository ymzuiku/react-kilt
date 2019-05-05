# 一个开发者友好的, 高性能的, react 状态管理工具

> 为此, 为她选了一个优雅的名字: wit

## 克隆 & 使用

懒得编译发布了, 进入项目

```sh
cd your-project/components
```

拷贝并执行以下命令, 将会只克隆组件代码

```sh
clone-by-ymzuiku(){
  git clone --depth=1 https://github.com/ymzuiku/$1.git && rm -rf $1/.git $1/.gitignore
}
clone-by-ymzuiku react-wit
```

直接引用

```js
import createWit from 'components/react-wit';
```

## 数据流

整个数据流非常简短, 由一个 Component 触发 update, 再由 action 更新和该 action 关联的多个 Components

```
| Component | --- | Rerender Components |
    |                    ^
    v                    |
| Action    | ---> | Update |
```

## 注册例子:

编写一些 action

```js
const actions = {
  dog: ({ payload, store}) => {
    // 更新dog属性
    store.set('dog', payload + 1);
  },
  cat: ({ payload, store }) => {
    // 横向修改其他属性
    store.set('dog', payload + 2);
    store.set('cat', payload + 1);
  },
  fish: ({ payload, store }) => {
    // 安全读取, 如果对象不存在, 返回 undefined
    const noHaveThisValue = store.get('dog.cat.xxx.0.fjdkafa.123.bb')
    console.log(noHaveThisValue) // undefined
  },
};
```

使用 actions 创建 wit 对象(wit对象是一个HOC)

```js
import createwit from 'react-wit';

const isDev = process.env.NODE_ENV === 'development';
// 依次传入: actions, defaultValues, 打开开发模式的热键(此例子是 ctrl+a)
const connectWit = createWit(actions, {}, isDev && 'KeyA');

export default connectWit;
```

## 使用

引入刚刚创建的 wit 对象, 给组件注入 action 

```js
import connectWit from '../connectWit'

//dog 对应 actions.dog
export default connectWit('dog', 'cat')({ dog, wit })=>{

  function updateDog() {
    // 执行 action.dog 函数
    wit.dispatch('dog', 50)
  }

  return (
    <div>
      <div>{dog}</div>
      <button onClick={updateDog} >更新全局状态</button>
    </div>
  )
}
```

## 时间回滚

每次update都可以设置是否记录上次数据, 从而进行回滚

```js
const actions = {
  dog: ({ payload, store, rollback }) => {
    // 更新dog属性, 并且记录更新之前的ID
    const timeId = store.set('dog', payload + 1, true);

    // 根据条件, 可以将**整个项目**回滚到更新之前
    if ('xxx') {
      rollback(timeId)
    }
  },
};
```