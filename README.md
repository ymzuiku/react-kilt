# 优雅的, 高性能的, 定向的状态管理

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
import createWit from "components/react-wit";
```

## 注册例子:

编写一些 action

```js
const actions = {
  dog: (value, update) => {
    // 更新dog属性
    update(value + 1);
  },
  cat: (value, update, witUpdate) => {
    // 横向修改其他属性
    witUpdate.dog(500);
    update(value + 2);
  },
  fish: (value, update, witUpdate, values) => {
    // 读取其他属性
    update(values.cat + 2);
  },
};
```

```js
import createwit from 'react-wit'

const isDev = process.env.NODE_ENV === 'development';
// 依次传入: actions, defaultValues, 打开开发模式的热键(此例子是 ctrl+a)
const wit = createWit(actions, {}, isDev && 'KeyA');

export default wit
```

## 使用

```js
import wit from '../wit'

export default wit('dog', 'cat')({dog, updateWit})=>{
  return (
    <div>
      <div>{dog}</div>
      <button onClick={()=> updateWit.dog(50)} >更新全局状态</button>
    </div>
  )
}
```js