# 优雅的, 高性能的, 定向的状态管理

> 为此, 为她选了一个优雅的名字: kilt

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
clone-by-ymzuiku react-kilt
```

直接引用

```js
import createKilt from 'components/react-kilt';
```

## 注册例子:

编写一些 action

```js
const actions = {
  dog: (update, value) => {
    // 更新dog属性
    update(value + 1);
  },
  cat: (update, value, values, kiltPush) => {
    // 横向修改其他属性
    kiltPush.dog(500);
    update(value + 2);
  },
};
```

```js
import createKilt from 'react-kilt';

const isDev = process.env.NODE_ENV === 'development';
// 依次传入: actions, defaultValues, 打开开发模式的热键(此例子是 ctrl+a)
const [kilt, controller] = createKilt(actions, {}, isDev && 'KeyA');

export default kilt;
```

## 使用

```js
import kilt from '../kilt'

export default kilt('dog', 'cat')({dog, kiltPush})=>{
  return (
    <div>
      <div>{dog}</div>
      <button onClick={()=> kiltPush.dog(50)} >更新全局状态</button>
    </div>
  )
}
```
