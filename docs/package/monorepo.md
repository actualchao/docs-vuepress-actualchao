---
title: Repo-package-template
---

# 基于 monorepo 管理的前端组件模块化开发库管理模版

:::tip 特别
**本文从为什么,是什么,怎么做分析 monorepo 包管理方式,文章中有具体的实现方法,附源码.**
:::

## Why Repo?

首先看这篇文章之前,问一下自己,你是否进行过 package 开发,如果是,那么你应该知道的  在进行包开发的时候,难以避免的就是要测试包的可用性,或者在开发的时候的调试 demo 很大程度上都是以下两种方式

- npm link
- 在内部 example 直接引用文件

#### npm link
这种方式使用 npm link 创建软连接的形式, 将包连接到全局的node_modules 中,在 需要用到 package 的地方 npm link package 的方式,在从项目中软连接到项目中的 node_modules 中, 在开发中这种模式,我遇到的两个问题就是

1. 多依赖开发的时候,开发完一个包需要重新 npm link 避免代码还是没改之前的问题.这样就无法创建统一的工作流.
2. 因为软连接在解析的时候,会被解析为绝对路径,也就是你当前的包代码所在的位置, 这样的路径会绕过项目的 eslint 校验,出现eslint 报错无法绕过的问题

#### example 方式

这种方式在内部直接使用源码或者打包出来的代码,绕过了 npm 包管理方式, 使你在发布版本的时候,需要额外的时间来确定是否是安全的配置包.


:::tip 总结
可以看到传统的 单repo 的包管理方式:
1. 无法实现代码的快速 code Sharking
2. 无法实现完整的多依赖包开发工作流
:::



## What Repo ?

**Monorepo——大型前端项目的代码管理方式**

Monorepo 是管理项目代码的一个方式，指在一个项目仓库 (repo) 中管理多个模块/包 (package)，不同于常见的每个模块建一个 repo。

monorepo 最主要的好处是统一的工作流和Code Sharing。比如我想看一个 pacakge 的代码、了解某段逻辑，不需要找它的 repo，直接就在当前 repo；当某个需求要修改多个 pacakge 时，不需要分别到各自的 repo 进行修改、测试、发版或者 npm link，直接在当前 repo 修改，统一测试、统一发版。只要搭建一套脚手架，就能管理（构建、测试、发布）多个 package。

目前有不少大型开源项目采用了这种方式，如 Babel，React, Meteor, Ember, Angular,Jest, Umijs, Vue, 还有 create-react-app, react-router 等。几乎我们熟知的仓库，都无一例外的采用了monorepo 的方式，可以看到这些项目的第一级目录的内容以脚手架为主，主要内容都在 packages目录中、分多个 package 进行管理。

***当仓库内容出现关联时，没有任何一种调试方式比源码放在一起更高效。***

**monorepo 项目结构**

```
├── packages
|   ├── package1
|   |   ├── package.json
|   ├── package2
|   |   ├── package.json
├── package.json
```

## How Repo?

monorepo 的实现依赖于实现两大问题的技术:

**1. 包依赖管理 code Sharking(基于Yarn workspace)**

**2. 统一发版,更新时依赖更新(基于 lerna 或者 自实现的发布工作流)**

#### Yarn workspace

> [lerna](https://lernajs.bootcss.com/)  也提供了依赖关系管理的能力, 但是需要使用 [lerna](https://lernajs.bootcss.com/)  特定的方式进行依赖安装等操作.这里直接使用 yarn 作为包版本工具.本文不涉及到 [lerna](https://lernajs.bootcss.com/) 的包版本控制方法. 

