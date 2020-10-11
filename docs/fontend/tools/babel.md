---
title: babel7 介绍和配置
---

## 前言
本文旨在记录 `Babel`  学习过程，记录 `Babel` 各个包之间的关系及其作用。
文章基于 `babel 7+`

::: tip 文章参考
- [Babel](https://babeljs.io/docs/en/next/)
- [babel 7 的使用的个人理解](https://www.jianshu.com/p/cbd48919a0cc)
- [不容错过的 Babel7 知识](https://juejin.im/post/6844904008679686152#heading-5)
:::

## 什么是 `Babel`

`Babel` 为了解决各个运行平台对于es语言的差异性而带来的一款工具。

#### Babel 是一个 javascript complier
Babel是一个工具链，主要用于在当前和较旧的浏览器或环境中将ECMAScript 2015+代码转换为JavaScript的向后兼容版本。 以下是Babel可以为您做的主要事情：

- 语法转换 transform syntax
- 目标环境中缺少的Polyfill功能（通过@babel/polyfill）
- 源代码转换（codemods）



## Babel 概念

### 汇总

| 概念 | 包含库 | 说明 |
| :-: | :- | :- |
| [core](#babel-core) | [@babel/core](https://babeljs.io/docs/en/next/babel-core) | `babel compiler` 核心编译器，用于解析，转换代码。 |
| [cli](#babel-cli) | [@babel/cli](https://babeljs.io/docs/en/next/babel-cli) | babel 内置的命令行工具，可用于使用命令行工具编译代码。 |
| [plugins](#babel-plugins) | [Transform Plugins](https://babeljs.io/docs/en/next/plugins) </br>  `@babel/plugin-transform-runtime` </br>  `@babel/plugin-transform-react-jsx` </br> .....| 应用于代码转换的插件，内部调用 `@babel/core` 转换代码， 插件是观察则模式的对象，只对观察的语法实施转换 |
| [presets](#babel-preset) | `@babel/preset-env` </br> `@babel/preset-flow` </br> `@babel/preset-react `</br> `@babel/preset-typescript` </br>| 一个预设是一组 plugin 的集合 ， 可以定义自己的预设。|
| [cli](#babel-plugin-transform-runtime) | [@babel/plugin-transform-runtime](https://babeljs.io/docs/en/next/babel-plugin-transform-runtime) | 一个通过重复利用 Babel 注入的帮助程序 @babel/runtime 的插件 |


## @babel/core

`@babel/core` 是一个基于 在 `node` 中运行的代码编译器，无论是通过 `@babel/cli` 工具还是 `webpack的 babel` 插件转译，内部都是通过 `node` 调用 `@babel/core` 相关功能来实现代码转译。是一个开发依赖包。

```sh 
npm install --save-dev @babel/core
```

`@babel/core` 内部实现了 `transform` , `tranformFile` , `transformFromAst` 方法。都实现了 `callback` 方式调用， 同步方式，和异步的 `promise` 方式调用接口，

- transform
```javascript
babel.transform(code: string, options?: Object, callback: Function)
```
- transformSync
```javascript
const  {code, map, ast} = babel.transformSync(code: string, options?: Object)
```
- transformAsync
```javascript
babel.transformAsync(code, options).then(result => {
 const  {code, map, ast} = result
});
```
- transformFile
```javascript
babel.transformFile(filename, options, callback)
```
- transformFileSync
```javascript
const  {code, map, ast} = babel.transformFileSync(filename, options)
```
- transformFileAsync
```javascript
babel.transformFileAsync(filename, options).then(result => {
 const  {code, map, ast} = result
});
```
- transformFromAst
```javascript
const sourceCode = "if (true) return;";
const parsedAst = babel.parse(sourceCode, { parserOpts: { allowReturnOutsideFunction: true } });
babel.transformFromAst(parsedAst, sourceCode, options, function(err, result) {
  const { code, map, ast } = result;
});

```
- transformFromAstSync
```javascript
const sourceCode = "if (true) return;";
const parsedAst = babel.parse(sourceCode, { parserOpts: { allowReturnOutsideFunction: true } });
const { code, map, ast } = babel.transformFromAstSync(parsedAst, sourceCode, options);

```
- transformFromAstAsync
```javascript
const sourceCode = "if (true) return;";
babel.parseAsync(sourceCode, { parserOpts: { allowReturnOutsideFunction: true } })
  .then(parsedAst => {
    return babel.transformFromAstAsync(parsedAst, sourceCode, options);
  })
  .then(({ code, map, ast }) => {
    // ...
  });

```


## @babel/cli

 `@babel/cli` 是 `Babel` 官方提供的 `cli`   脚手架工具，用于在命令行中执行编译命令，输出编译后的代码。

 不推荐在全局安装 `@babel/cli` 命令行工具，原因： 
  - 同一台计算机可能运行不同版本 `Babel` 的项目，安装在项目内可以分别更新维护。
  - 项目内安装能降低项目对全局环境的依赖，更好的可移植性支持。

```sh
npm install --save-dev @babel/core @babel/cli
```


创建测试文件 `test.js`
```javascript
const aa = () => { const bb  = [1, 2]; console.log(...bb); };
const {x, y} = obj;
const [a, b, ...rest] = arr;
```

运行命令
```sh
npx babel test.js
```

输出
```
const aa = () => {
  const bb = [1, 2];
  console.log(...bb);
};

const {
  x,
  y
} = obj;
const [a, b, ...rest] = arr;
```

可以看到并没有任何转译。

这事由于只安装了脚手架工具和核心包 `@babel/core `，并没有安装具体的实施转换对应代码的 `plugins`  

我们这里希望解析**箭头函数**的语法，所以需要安装解析箭头函数的插件 `@babel/plugin-transform-arrow-functions`
```sh
npm i -D @babel/plugin-transform-arrow-functions
# 安装解构语法支持
npm i -D @babel/plugin-transform-destructuring
```

安装了解析转换的 `plugin` 之后，我们还需要配置使用插件。

- 对于 `cli` 工具，我们可以使用命令行方式指定使用 `plugin` 具体使用可以查看命令行帮助 `npx babel --help`

- 使用本地配置文件 `.babelrc` 或者  `.babelrc.json`文件配置，优先级低于命令行配置

所以我们可以

```sh
npx babel test.js --plugins @babel/plugin-transform-arrow-functions,@babel/plugin-transform-destructuring
```

输出
```
const aa = function () {
  const bb = [1, 2];
  console.log(...bb);
};

const _obj = obj,
      x = _obj.x,
      y = _obj.y;

const _arr = arr,
      _arr2 = _toArray(_arr),
      a = _arr2[0],
      b = _arr2[1],
      rest = _arr2.slice(2);
```


或者在根目录下创建 .babelrc 文件

```json
{
  "presets": [],
  "plugins": [
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-transform-destructuring"
  ]
}
```

运行命令
```sh
npx babel test.js
```

输出和 cli 方式配置一致。


## @babel/plugin

`plugin` 使用详见上一小节。

[babel plugins 文档](https://babeljs.io/docs/en/next/plugins)

 `plugin` 是直接作用于代码的语法转换工具，它定义了 指定语法的转换规则，内部调用 `@babel/core `的 `transform` 方法实现语法转换。 `plugin` 关注转换逻辑， `@babel/core` 实现转换操作的关系。

 `plugin` 基于访问者 `Visitor` 模式，将作用域代码块解析出的 `AST` 抽象语法树 的某一节点的操作分离出来，在不改变 `AST` 结构的前提下，转换关注的 代码块。


 #### plugin 开发

 插件是基于 **访问者模式** ，先将代码块解析成 AST 抽象语法树， 然后遍历树节点， 找到自己要访问的节点，然后基于特定的规则，实现对这一块代码的 AST 重新组装，
 最后调用 AST 生成代码的方法，将转换后的 AST 再次转换成代码块。从而实现代码的转译。

 [创建babel插件教程](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)

 - `Babel` 使用一个基于 `ESTree` 并修改过的 `AST` 。 
 - `@babel/types` 可以根据 options 创建 AST ，[@babel/types 文档](https://babeljs.io/docs/en/babel-types)


 一段简单的实例代码，实现箭头函数的转换

 ```javascript
 //babel核心库，用来实现核心的转换引擎 
let babel= require('@babel/core');
//可以实现类型判断，生成AST节点
let types = require('@babel/types');
let code = `let sum = (a,b)=>a+b`; // let sum = function (a,b){return a+b}
// 这个访问者可以对特定的类型的节点进行处理
let visitor = {
  ArrowFunctionExpression(path){
    let params = path.node.params;
    let blockStatement = types.blockStatement([
        types.returnStatement(path.node.body)
    ]);
    let func = types.functionExpression(null, params, blockStatement, false, false);
    path.replaceWith(func);
  }
}

let arrayPlugin = {visitor}
//babel内部先先把代码转成AST,然后进行遍历，

console.log(code)
let result = babel.transform(code,{
    plugins:[
        arrayPlugin
    ]
})
console.log(result.code);
 ```

 
 output

 ```
 let sum = (a,b)=>a+b
let sum = function (a, b) {
  return a + b;
};
```



## @babel/preset

通过使用或创建一个 preset 即可轻松使用一组插件。


#### 官方preset

- [@babel/preset-env](https://babeljs.io/docs/en/next/babel-preset-env)

  [更多配置](https://babeljs.io/docs/en/next/babel-preset-env)

  `@babel/preset-env` 是一个智能预设，它使您可以使用最新的JavaScript，而无需微观管理目标环境所需的语法转换（以及可选的浏览器polyfill）。 这都使您的生活更轻松，JavaScript包更小！

  需要说明的是，@babel/preset-env 会根据你配置的目标环境，生成插件列表来编译。对于基于浏览器或 Electron 的项目，官方推荐使用 .browserslistrc 文件来指定目标环境。默认情况下，如果你没有在 `Babel` 配置文件中(如 `.babelrc`)设置 `targets` 或 `ignoreBrowserslistConfig`,`@babel/preset-env` 会使用 `browserslist` 配置源。

  如果你不是要兼容所有的浏览器和环境，推荐你指定目标环境，这样你的编译代码能够保持最小。

  例如，仅包括浏览器市场份额超过0.25％的用户所需的 `polyfill` 和代码转换（忽略没有安全更新的浏览器，如 `IE10 `和 `BlackBerry）`:

  ```
  //.browserslistrc
  > 0.25%
  not dead
  ```

  查看 browserslist 的[更多配置](https://github.com/browserslist/browserslist)




- [@babel/preset-flow](https://babeljs.io/docs/en/next/babel-preset-flow)

  [更多配置](https://babeljs.io/docs/en/next/babel-preset-flow)

  如果您使用`Flow`（JavaScript代码的静态类型检查器），则建议使用此预设。 它包含以下插件： 
      - `@babel/plugin-transform-flow-strip-types`

- [@babel/preset-react](https://babeljs.io/docs/en/next/babel-preset-react)
  
  [更多配置](https://babeljs.io/docs/en/next/babel-preset-react)



- [@babel/preset-typescript](https://babeljs.io/docs/en/next/babel-presettypescriptv)
  
  [更多配置](https://babeljs.io/docs/en/next/babel-presettypescriptv)

 

 ## @babel/plugin-transform-runtime

 一个插件，可重复使用Babel注入的帮助程序代码以节省代码大小。

 ```sh
 npm install --save-dev @babel/plugin-transform-runtime
 # 帮助程序是作为运行时需要的，作为 dependencies 安装
 npm install --save @babel/runtime
 ```

 [配置参考](https://babeljs.io/docs/en/next/babel-plugin-transform-runtime#corejs)


 ```json
//  .babelrc
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "helpers": true,
        "regenerator": true,
        "useESModules": false,
      }
    ]
  ]
}
 ```

