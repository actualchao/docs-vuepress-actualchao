---
title: rollup 轻量化Library打包工具
sidebarDepth: 5
---

::: tip 本文引用参考文档地址
- [ Rollup 官方中文文档 ](https://www.rollupjs.com/)
- [ rollup 搭建打包 JS ](https://juejin.im/post/6844903896830181383#heading-7)
- [ rollup打包js的注意点 ](https://juejin.im/post/6844903713165803527)
- [ babel 7 的使用的个人理解 ](https://www.jianshu.com/p/cbd48919a0cc)
:::


## 简介

Rollup 是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码，例如 library 或应用程序。

Rollup 对代码模块使用新的标准化格式，这些标准都包含在 JavaScript 的 ES6 版本中，而不是以前的特殊解决方案，如 CommonJS 和 AMD。ES6 模块可以使你自由、无缝地使用你最喜爱的 library 中那些最有用独立函数，而你的项目不必携带其他未使用的代码。ES6 模块最终还是要由浏览器原生实现，但当前 Rollup 可以使你提前体验。

###  Why is rollup

`Rollup` 着眼于未来，采用原生的`ES` 标准的模块机制进行构建，未来`ES` 规范肯定会由浏览器实现，也是JavaScript语言明确的发展方向。机制更加优于`CommonJS`

`CommonJS` 是在`ES`规范之前被提出的一种暂时性性解决方案，是一种特殊的传统格式，

相比较`ES`模块允许进行静态分析，从而实现像 tree-shaking 的优化，并提供诸如循环引用和动态绑定等高级功能

`Tree-shaking`, 也被称为 "live code inclusion," 它是清除实际上并没有在给定项目中使用的代码的过程，但是它可以更加高效。

###  构建工具对比

| 打包工具       | 体积           | 注入代码  | code spliting     | dynamic import     | Tree-shaking    |
| ------------- |:-------------:| ------:  | -----------------:| -----------------: | ---------------: |
| webpack       | large         | more     |:white_check_mark: |:white_check_mark:  | :x:              |
| rollup        | small         | less     |:x:                |:x:                 | :white_check_mark:|



webpack 是一款强大的 `bundle` 构建工具，通过 `loader`机制可以处理各种类型的文件，良好的 `code splitting`和`dynamic import`支持使得`webpack` 成为了应用程序，单页应用的全能型的的打包工具。

但是因为其打包体积相对较大，注入代码更多，没有良好的`Tree-shaking`所以在`Library` 的打包工作中，不如`rollup`打包的精简。




## 配置

`rollup` 定位是一款轻量级的构建工具，其配置也相对很简单，但是由于不支持`CommonJs`，在配置`rollup-plugin-commonjs` 将`CommmonJS` 转化成`ES` 模块方式的时候，需要配置`babel` 转译

由于`babel 7+`升级改动比较大，命名空间改动，市面上的教程大部分说的不够清楚，而且基本上停留在`babel 6`的配置，导致一直抛`(plugin commonjs) SyntaxError: Unexpected token`


在后文中会着力介绍这个部分，分析`babel 7+`配置以及各个`presets` 和`plugins` 的作用。