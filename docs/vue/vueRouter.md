---
title: vue-router 源码
sidebarDepth: 5
---

# SPA 单页应用
随着前端框架(React/Vue/Angular)等渐进式框架发展,配合 webpack 等打包工具,完成单页面的构建越来越简单.

  **对比传统多页面应用,单页面应用优势:**

  - 更好的交互体验
  - 更好的前后端分离开发

  **缺点:**

  - 首屏加载资源大
  - 不利于SEO
  - 需要配合前前端路由系统实现跳转

为了解决单页面系统中,页面跳转路由实现,和改变视图的同时不会向后端发出请求。引入了前端路由系统 React-Router-Dom/vue-router 等前端路由库.

通过浏览器地址栏的 hashChange 和 HTML5 提供的 History interface 实现的地址改变触发视图改变.

# 从vue-router看前端路由的两种实现
这是一段简单的示例程序, vue-router 在 vue 程序中的简单应用


## 示例

```html
<html>
<head>
  <meta charset="utf-8">
  <script src="https://unpkg.com/vue/dist/vue.js"></script>
  <script src="https://unpkg.com/vue-router/dist/vue-router.js"></script>
</head>

<body>
  <div id="app">
    <h1>Hello App!</h1>
    <router-link to="/foo">Go to Foo</router-link>
    <router-link to="/bar">Go to Bar</router-link>
    <router-view></router-view>
  </div>
  <div id="root">
    <h1>Hello root!</h1>
    <router-link to="/foo">Go to Foo</router-link>
    <router-link to="/bar">Go to Bar</router-link>
    <router-view></router-view>
  </div>

  <script>
    const Foo = { template: '<div>foo</div>' }
    const Bar = { template: '<div>bar</div>' }

    const routes = [{ path: '/foo', component: Foo }, { path: '/bar', component: Bar }]
    const router = new VueRouter({ routes })

    new Vue({ router }).$mount('#app')
    new Vue({ router }).$mount('#root')
  </script>
</body>
</html>
```

## Vue.use 注册

### script 加载
上面这段示例代码使用了 umd 模块的加载方式,直接 script 加载到 window 上

在加载 router 代码块的时候内部会判断加载方式,如果是 script 加载,会直接调用 Vue.use 方法初始化使用 Vue-router 插件

```javascript
// vue-router/src/index.js
if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}
```


### ES Module 加载
如果是基于 webpack 的打包方式的程序,还需要在引入了 vue-router 之后使用以下代码把 router 加载安装到我们的 vue 程序中,实际上这是一个 vue-router 集成的开始

```javascript
Vue.use(Router)
```

Vue.use 会调用 Router 内部实现的 install 方法,这是使用router 的入口


### install 实现

首先贴上删除了部分不做分析的部分的源代码

```javascript
import View from './components/view'
import Link from './components/link'

export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  const isDef = v => v !== undefined

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
}

```

这里的 install 中注册 router 到 Vue 的过程中,做了这几件事情

- 保证只注册一次 router 到 Vue 
- 混入了核心的 router 实现开始入口
- 定义了了 $router $route 的 getter
- 全局注册了 Link 和 View 组件 



### install 核心

核心的混入部分通过混入 beforeCreate 钩子中,实现了在每个组件中对根示例 _routerRoot 的访问.

isDef 方法判断了 Vue 实例的配置中是否有 router 定义,而 router 只在根示例中有定义,也就是:

```javascript
new Vue({ router }).$mount('#app')
```

进入根实例的条件之后,在根实例上定义了 _routerRoot 保持对本身的访问地址.在后面的所有组件中,给组件共享根组件的访问.

然后把 Router 实例挂载到根 Vue 实例上,保持 Router 实例的访问.

执行 Router 实例的init 方法, 该方法定义在 Router 的类定义中是 vue-router 的核心初始化流程,入参根组件.

调用 Vue.util.defineReactive 定义响应式对象,后续的组件更新依赖于 Vue 的响应式原理, 通过响应式对象的依赖收集,派发更新流程通知视图的更新


## vue-router 核心


vue-router 的核心实现是在 src/index.js 中定义的 VueRouter 类,类中实现了初始化逻辑,定义了实以下的例的属性和方法:

### VueRouter 构造器

这是 VueRouter 的构造函数.

```typescript
  constructor (options: RouterOptions = {}) {
    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher(options.routes || [], this)

    let mode = options.mode || 'hash'
    this.fallback =
      mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
      mode = 'hash'
    }
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode

    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }
```

构造函数里面做的事情很简单:
- 对参数进行了保存
- 定义了保存 Vue 根实例的 app apps 
- 定义了钩子函数的保存地址
- 构造出 matcher 路由匹配器
- 判断环境配置,绝对最后使用的路由模式
- 根据路由模式生成路由 History 对象


构造器的核心就是根据环境和配置生成路由模式

这里可以看到优先使用配置项中的 mode 如果没有配置则使用 hash

```javascript
let mode = options.mode || 'hash'
```

然后当配置中使用了 history 模式的时候,判断是否支持 history ,不支持则降级使用 hash
```javascript
this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
if (this.fallback) {
  mode = 'hash'
}
```

不是在浏览器环境中则使用自己构造的路由事件系统来实现 History
```javascript
if (!inBrowser) {
  mode = 'abstract'
}
```

### VueRouter init 初始化方法

```javascript
init (app: any /* Vue component instance */) {
    process.env.NODE_ENV !== 'production' &&
      assert(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
          `before creating root instance.`
      )
    // 对照本文档开始示例,一个 router 对象可能被多个 app 所使用,在后续的路由变更的时候,通过更改 apps 中所有 app 的响应式路由数据,触发视图变更.
    this.apps.push(app)
    
    // this.app 保存了是否还有在使用该 router 实例的 app ,也就是 VUE 应用
    if (this.app) {
      return
    }

    this.app = app

    const history = this.history

    // 针对 hash 和 history 模式做滚动行为处理,初始化路由监听器,跳转第一个路由触发响应视图  
    if (history instanceof HTML5History || history instanceof HashHistory) {
      const handleInitialScroll = routeOrError => {
        const from = history.current
        const expectScroll = this.options.scrollBehavior
        const supportsScroll = supportsPushState && expectScroll

        if (supportsScroll && 'fullPath' in routeOrError) {
          handleScroll(this, routeOrError, from, false)
        }
      }
      const setupListeners = routeOrError => {
        history.setupListeners()
        handleInitialScroll(routeOrError)
      }
      history.transitionTo(
        history.getCurrentLocation(),
        setupListeners,
        setupListeners
      )
    }
    // 添加路由变化回调函数,这个回调函数是  路由变化最终响应到视图的关键步骤.也就是给响应式对象重新赋值.
    history.listen(route => {
      this.apps.forEach(app => {
        app._route = route
      })
    })
  }
```
**小结**
这里初始化函数做了几件事情:
- 保证在创造 VUE 实例之前安装了 router 也就是 Vue.use(Router)
- 记录调用了 router 实例的 init 的 vue 实例
- 开始初始化路由变化监听器
- 初始化变化监听回调,以触发响应视图
- 调用第一次跳转当前路由,初始化视图.


### VueRouter 实例属性
- router.app
- router.mode
- router.currentRoute

### VueRouter 实例API

  这里的 API 一部分对路由操作的都是对 History 对象上具体的方法的代理.

- router.beforeEach
- router.beforeResolve
- router.afterEach
- router.push
- router.replace
- router.go
- router.back
- router.forward
- router.getMatchedComponents
- router.resolve
- router.addRoutes
- router.onReady
- router.onError




## HTML5History 


这是基于原生的 HTML5 History interface 的路由监听器实现(删减不做分析部分)

这里 HTML5History 派生自 History

History 类实现了路由的核心跳转处理.后面会做分析

HTML5History类实现了:
- 初始化 HTML5History 监听的方法
- 路由跳转操作方法
- history 模式下的获取完整路由方法

其实就是对 各种mode 之间的不同点提取到这里进行特殊处理,基础能力都定义在基类 History 中


```javascript
/* @flow */

import type Router from '../index'
import { History } from './base'
import { cleanPath } from '../util/path'
import { setupScroll, handleScroll } from '../util/scroll'
import { pushState, replaceState, supportsPushState } from '../util/push-state'

export class HTML5History extends History {
  constructor (router: Router, base: ?string) {
    super(router, base)
  }

  // 定义了初始化监听路由变化的方法
  setupListeners () {
    if (this.listeners.length > 0) {
      return
    }

    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    // 滚动行为处理
    if (supportsScroll) {
      this.listeners.push(setupScroll())
    }

    // 路由变化响应函数,调用核心跳转实现 transitionTo
    const handleRoutingEvent = () => {
      const current = this.current

      this.transitionTo(location, route => {
        if (supportsScroll) {
          handleScroll(router, route, current, true)
        }
      })
    }
    //监听 popstate ⌚事件
    window.addEventListener('popstate', handleRoutingEvent)
    this.listeners.push(() => {
      window.removeEventListener('popstate', handleRoutingEvent)
    })
  }

  go (n: number) {
    window.history.go(n)
  }

  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      pushState(cleanPath(this.base + route.fullPath))
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    }, onAbort)
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      replaceState(cleanPath(this.base + route.fullPath))
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    }, onAbort)
  }

  // 确定路由是否正确,不正确向state 里面推入正确路由
  ensureURL (push?: boolean) {
    if (getLocation(this.base) !== this.current.fullPath) {
      const current = cleanPath(this.base + this.current.fullPath)
      push ? pushState(current) : replaceState(current)
    }
  }

  getCurrentLocation (): string {
    return getLocation(this.base)
  }
}

export function getLocation (base: string): string {
  let path = decodeURI(window.location.pathname)
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}

```


## HashHistory

HashHistory 实现中实现的方法实际上与 HTML5History 中实现的是一致的,只是在路由操作中 添加了对 hash 标识符 # 的判断,跳转路由的生成不一样,要多一些副作用的操作 hash 

这里不做过多的分析.

```javascript
/* @flow */

import type Router from '../index'
import { History } from './base'
import { cleanPath } from '../util/path'
import { getLocation } from './html5'
import { setupScroll, handleScroll } from '../util/scroll'
import { pushState, replaceState, supportsPushState } from '../util/push-state'

export class HashHistory extends History {
  constructor (router: Router, base: ?string, fallback: boolean) {
    super(router, base)
    // check history fallback deeplinking
    if (fallback && checkFallback(this.base)) {
      return
    }
    ensureSlash()
  }

  // this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
  setupListeners () {
    if (this.listeners.length > 0) {
      return
    }

    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
      this.listeners.push(setupScroll())
    }

    const handleRoutingEvent = () => {
      const current = this.current
      if (!ensureSlash()) {
        return
      }
      this.transitionTo(getHash(), route => {
        if (supportsScroll) {
          handleScroll(this.router, route, current, true)
        }
        if (!supportsPushState) {
          replaceHash(route.fullPath)
        }
      })
    }
    const eventType = supportsPushState ? 'popstate' : 'hashchange'
    window.addEventListener(
      eventType,
      handleRoutingEvent
    )
    this.listeners.push(() => {
      window.removeEventListener(eventType, handleRoutingEvent)
    })
  }

  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
      location,
      route => {
        pushHash(route.fullPath)
        handleScroll(this.router, route, fromRoute, false)
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
      location,
      route => {
        replaceHash(route.fullPath)
        handleScroll(this.router, route, fromRoute, false)
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  go (n: number) {
    window.history.go(n)
  }

  ensureURL (push?: boolean) {
    const current = this.current.fullPath
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current)
    }
  }

  getCurrentLocation () {
    return getHash()
  }
}

function checkFallback (base) {
  const location = getLocation(base)
  if (!/^\/#/.test(location)) {
    window.location.replace(cleanPath(base + '/#' + location))
    return true
  }
}

function ensureSlash (): boolean {
  const path = getHash()
  if (path.charAt(0) === '/') {
    return true
  }
  replaceHash('/' + path)
  return false
}

export function getHash (): string {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  let href = window.location.href
  const index = href.indexOf('#')
  // empty path
  if (index < 0) return ''

  href = href.slice(index + 1)
  // decode the hash but not the search or hash
  // as search(query) is already decoded
  // https://github.com/vuejs/vue-router/issues/2708
  const searchIndex = href.indexOf('?')
  if (searchIndex < 0) {
    const hashIndex = href.indexOf('#')
    if (hashIndex > -1) {
      href = decodeURI(href.slice(0, hashIndex)) + href.slice(hashIndex)
    } else href = decodeURI(href)
  } else {
    href = decodeURI(href.slice(0, searchIndex)) + href.slice(searchIndex)
  }

  return href
}

function getUrl (path) {
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  return `${base}#${path}`
}

function pushHash (path) {
  if (supportsPushState) {
    pushState(getUrl(path))
  } else {
    window.location.hash = path
  }
}

function replaceHash (path) {
  if (supportsPushState) {
    replaceState(getUrl(path))
  } else {
    window.location.replace(getUrl(path))
  }
}

```


## History 核心

上面提到的两个 HTML5History 和 HashHistory 实际上都是派生自 History 基类,在基类上定义了 路由监听的核心逻辑,接下来我们来分析这部分的核心代码

由于这部分代码辅助方法较多,不展示过多的代码,只摘录部分核心逻辑代码展示:

```javascript
/* @flow */

import { _Vue } from '../install'
import type Router from '../index'
import { inBrowser } from '../util/dom'
import { runQueue } from '../util/async'
import { warn } from '../util/warn'
import { START, isSameRoute } from '../util/route'
import {
  flatten,
  flatMapComponents,
  resolveAsyncComponents
} from '../util/resolve-components'
import {
  createNavigationDuplicatedError,
  createNavigationCancelledError,
  createNavigationRedirectedError,
  createNavigationAbortedError,
  isError,
  isNavigationFailure,
  NavigationFailureType
} from '../util/errors'

export class History {
  constructor (router: Router, base: ?string) {
    ...
  }

  // 外部通过 listen 注册路由变化回调到这里,当路由跳转触发回调函数通知外部执行对应方法,入参跳转的 route 对象.
  listen (cb: Function) {
    this.cb = cb
  }

  onReady (cb: Function, errorCb: ?Function) { ... } 

  onError (errorCb: Function) { ... }

  // 路由跳转函数
  transitionTo (
    location: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) {
    let route
    try {
      //调用 match方法得到匹配的 route对象
      route = this.router.match(location, this.current)
    } catch (e) {...}
    // 核心跳转逻辑,会处理路由守卫钩子方法,生成钩子任务队列,处理过渡等.
    this.confirmTransition(
      route,
      () => {
        // 跳转处理完成回调中,调用 updateRoute 实现跳转,触发视图更新
        const prev = this.current
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()
        this.router.afterHooks.forEach(hook => {
          hook && hook(route, prev)
        })

        // fire ready cbs once
        if (!this.ready) { ... }
      },
      err => { ... }
    )
  }

  // 路由跳转前处理函数,处理过渡,钩子函数队列
  confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    const current = this.current
    const abort = err => {...}
    const lastRouteIndex = route.matched.length - 1
    const lastCurrentIndex = current.matched.length - 1

     // 如果当前路由和之前路由相同 确认url 直接return
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      this.ensureURL()
      return abort(createNavigationDuplicatedError(current, route))
    }

    // 通过异步队列来交叉对比当前路由的路由记录和现在的这个路由的路由记录 
    // 为了能准确得到父子路由更新的情况下可以确切的知道 哪些组件需要更新 哪些不需要更新
    const { updated, deactivated, activated } = resolveQueue(
      this.current.matched,
      route.matched
    )

    // 在异步队列中执行响应的勾子函数
    // 通过 queue 这个数组保存相应的路由钩子函数
    const queue: Array<?NavigationGuard> = [].concat(
      /// leave 的勾子
      extractLeaveGuards(deactivated),
      // 全局的 before 的勾子
      this.router.beforeHooks,
      // in-component update hooks
      extractUpdateHooks(updated),
      // 将要更新的路由的 beforeEnter勾子
      activated.map(m => m.beforeEnter),
      // 异步组件
      resolveAsyncComponents(activated)
    )

    this.pending = route

    // 队列执行的 iterator 遍历函数 
    const iterator = (hook: NavigationGuard, next) => {
      if (this.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      try {
        hook(route, current, (to: any) => {
          if (to === false) {
            // next(false) -> abort navigation, ensure current URL
            this.ensureURL(true)
            abort(createNavigationAbortedError(current, route))
          } else if (isError(to)) {
            this.ensureURL(true)
            abort(to)
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' &&
              (typeof to.path === 'string' || typeof to.name === 'string'))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort(createNavigationRedirectedError(current, route))
            if (typeof to === 'object' && to.replace) {
              this.replace(to)
            } else {
              this.push(to)
            }
          } else {
            // confirm transition and pass on the value
            next(to)
          }
        })
      } catch (e) {
        abort(e)
      }
    }

    // 递归回调方式运行队列函数
    runQueue(queue, iterator, () => {
      const postEnterCbs = []
      const isValid = () => this.current === route
      // wait until async components are resolved before
      // extracting in-component enter guards
      const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
      const queue = enterGuards.concat(this.router.resolveHooks)
      runQueue(queue, iterator, () => {
        if (this.pending !== route) {
          return abort(createNavigationCancelledError(current, route))
        }
        this.pending = null
        onComplete(route)
        if (this.router.app) {
          this.router.app.$nextTick(() => {
            postEnterCbs.forEach(cb => {
              cb()
            })
          })
        }
      })
    })
  }

  updateRoute (route: Route) {
    this.current = route
    this.cb && this.cb(route)
  }
}


function resolveQueue (
  current: Array<RouteRecord>,
  next: Array<RouteRecord>
): {
  updated: Array<RouteRecord>,
  activated: Array<RouteRecord>,
  deactivated: Array<RouteRecord>
} {
  let i
  const max = Math.max(current.length, next.length)
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}

```


**小结**

这里核心实现了路径切换的逻辑,是整个router 路由切换跳转的实现.主要实现了以下功能

- 注册跳转完成回调,以触发外部视图更新,入参 路由切换的 路由对象
- 实现了路由跳转函数 transitionTo ,在 transitionTo 完成回调中调用 updatRoute 触发 listen 注册的回调执行.
- 路由跳转前处理函数,处理过渡,钩子函数队列,运行钩子队列,递归判断路由改变等方法



## 路由更新流程

```
history.listen(callback) ==> $router.push() ==> HashHistory.push() ==> History.transitionTo() ==>
History.confirmTransition() ==> History.updateRoute() ==> {app._route = route} ==> vm.render()
```