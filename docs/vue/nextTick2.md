---
title: VUE nextTick 原理解析
---


## 前言
  `nextTick` 是 VUE 官方提供的延迟执行的方法，官方给出的描述是

  > 将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。它跟全局方法 Vue.nextTick 一样，不同的是回调的 this 自动绑定到调用它的实例上。

  谈延迟执行，更新循环，那么就不得不说一说 Tasks, microtasks, queues and schedules（javascript 事件循环机制），这是 javascript 任务排队和执行的实现。

  本文先通过代码演示的形式，解析事件循环机制的过程。然后通过对 VUE2 和 VUE3 的 nextTick 源码实现分析。

  那么，开始我们的事件循环机制吧。


## 事件循环机制 Event Loop

  首先让我们来思考这样的一段代码

  ```javascript
console.log('script start');

setTimeout(function () {
  console.log('setTimeout');
}, 0);

Promise.resolve()
  .then(function () {
    console.log('promise1');
  })
  .then(function () {
    console.log('promise2');
  });

console.log('script end');
  ```

相信很多程序员都能准确的答出执行顺序,如果不知道，test it！


### **那么为什么会这样呢？**

要了解这一点，我们必须理解事件循环如何处理任务和微任务

> ES6 规范中，microtask 称为 jobs，macrotask 称为 task, 本文中 task 指宏任务， microtask 指微任务。

js 引擎是单线程运行的，每个“线程”都有自己的事件循环，因此每个Web工作者都有自己的事件循环，因此可以独立执行，而同一源上的所有窗口都可以共享事件循环，因为它们可以同步通信。 事件循环持续运行，执行所有排队的任务。 事件循环具有多个任务源，这些任务源保证了该源中的执行顺序，但浏览器可以在循环的每个循环中选择从哪个源执行任务。 这个选择的实现就是我们的 事件循环机制核心。

计划了任务，以便浏览器可以从其内部切换 JavaScript / DOM领域，并确保这些操作顺序发生。 在任务之间，浏览器可以呈现更新。 从鼠标单击进入事件回调需要安排任务，解析HTML也是这样，在上面的示例中是setTimeout。

setTimeout等待给定的延迟，然后为其回调安排新任务。 这就是为什么在脚本结束之后打印 setTimeout 的原因，因为打印 script end 是第一个 task 的一部分，而setTimeout被记录在单独的 task 中。浏览器线程在两个 task 之间执行 DOM 的更新渲染等宿主环境需要执行的任务。

到这一步总结就是宿主环境在运行时的顺序是： 
- `task ==> 宿主环境任务 ==> task ==> 宿主环境任务 ==> done`


通常，微任务是当前正在执行的 `task` 发生的事情安排的，例如对一批动作做出反应，或使某些事情异步而不作为一个新 task ，仅仅作为一个小的副作用被立马实现。 只要当前 `task` 没有其他 `JavaScript` 在执行，微任务队列就会在回调之后进行处理，也就是在每个任务结束时进行处理。 在微任务期间排队的任何其他微任务都将添加到队列的末尾并进行处理。 微任务包括变异观察者回调 `MutaionObserver` ， `promise` 回调， 以及 `process.nextTick（Node.js）`。

一旦 `promise` 得以解决，或者如果 `promise` 已经解决，它就会将微任务排队以进行反动回调。 这样可以确保即使promise已经解决，promise回调也是异步的。 因此，针对已解决的Promise调用.then（yey，nay）会立即将微任务排队。 这就是为什么在脚本结束后记录 `promise1` 和 `promise2` 的原因，因为当前运行的脚本必须在处理微任务之前完成。 因为微任务总是在下一个任务之前发生，所以 `promise1` 和 `promise2` 在 `setTimeout` 之前记录

到这一步总结就是宿主环境在运行时的顺序是： 
- `task ==> microtask ==> 宿主环境任务 ==> task ==> microtask ==> 宿主环境任务 ==> done`

总是在下一个 `task` 之前把 上一个任务的副作用 `microtask` 执行完毕，然后执行宿主环境任务后开始下一个 `task`


### 一些浏览器的不一样的处理

部分浏览器会打印 `script start`, `script end`, `setTimeout`, `promise1`, `promise2`.

他们在 `setTimeout` 之后运行 `promise` 回调。 他们可能将 `promise` 回调称为 `task` 的一部分，而不是微任务 `microtask` 。

将 `promise` 作为 `task` 的一部分会导致性能问题，因为回调可能会因与任务相关的宿主任务（例如渲染）而不必要地延迟。 它还会由于与其他任务源的交互而导致不确定性，并可能中断与其他API的交互。

ECMAScript具有类似于微任务的“作业”概念，普遍的共识是，应将 `promise` 作为微任务队列的一部分，这是有充分理由的。WebKit 内核始终都能正确的处理任务之间的关系。


### 一个更复杂的例子

让我们来创建一个 `HTML` 文档，并思考一下的代码。

```html
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Untitled Document</title>
</head>

<body>
  <div class="outer" style="width: 200px;height: 200px;background: #888888;">
    <div class="inner" style="width: 160px;height: 160px;background: #444444;"></div>
  </div>
</body>

<script>
  // 获取两个元素
  var outer = document.querySelector('.outer');
  var inner = document.querySelector('.inner');

  // 监听 outer 的元素属性变化
  new MutationObserver(function () {
    console.log('mutate');
  }).observe(outer, {
    attributes: true,
  });

  // 点击回调
  function onClick() {
    console.log('click');

    setTimeout(function () {
      console.log('timeout');
    }, 0);

    Promise.resolve().then(function () {
      console.log('promise');
    });

    outer.setAttribute('data-random', Math.random());
  }

  
  inner.addEventListener('click', onClick);
  outer.addEventListener('click', onClick);
</script>

</html>
```

结合上面对 `task` 和 `microtask` 的分析，我们很容易作出以下分析：

  - 点击回调是一项 `task`
  - `promise` 和 `MutationObserver` 回调作为 `microtask` 排队
  - `setTimeout` 作为一个新的 `task` 放到队列中。


所以是这么回事
```javascript
// click
// promise
// mutate
// click
// promise
// mutate
// timeout
// timeout
```


这里需要注意的，实际在于微任务在点击回调之后被处理，

这来自于 HTML 的规范
> If the stack of script settings objects is now empty, perform a microtask checkpoint
> 
> — HTML: Cleaning up after a callback step 3
> 
> 如果脚本执行堆栈被设置为空，请执行微任务检查点

同样，ECMAScript对作业 jobs （ECMAScript 将微任务称之为 jobs ）进行说明：

> Execution of a Job can be initiated only when there is no running execution context and the execution context stack is empty…
>
> ECMAScript: Jobs and Job Queues
>
> 仅当没有正在运行的执行上下文并且执行上下文堆栈为空时才可以启动作业的执行。


这里的点击回调是浏览器处理的,实际被宿主环境在某个循环结束的时候，作为下一个 `task` 被推入堆栈执行。所以执行回调完毕，即出栈。进行对应微任务检查点。

有兴趣可以使用浏览器控制台 `debugger` 回调执行时，堆栈只有 回调执行的堆栈。不存在其他执行堆栈。所以点击回调属于直接被宿主浏览器推入堆栈执行。

这与 ECMAScript 的规范上下文堆栈为空时才能被执行相呼应。


**那么让我们做点别的事情**

在上面测试代码的 script 最后加入代码触发点击事件。并思考会有什么样的变化。

```javascript
inner.click()
```

那么可以看到的是执行输出：
```javascript
// click
// click
// promise
// mutate
// promise
// timeout
// timeout
```

根据上面提到的 HTML 和 ECMAScript 规范对 执行堆栈与微任务执行的描述

以前，微任务在侦听器回调之间运行，但是 `.click()` 导致事件同步分派，调用 `.click()` 的脚本仍在回调之间的堆栈中。 上面的规则确保微任务不会中断执行中的 `JavaScript` 。 这意味着我们不在侦听器回调之间处理微任务队列，而是在两个侦听器之后对它们进行处理。我们可以理解为，因为 `.click()` 的堆栈保留，导致宿主环境把两次的回调，作为一次 `task` 执行。



### 总结

- 任务按顺序执行，浏览器可以在它们之间进行渲染
- 微任务按顺序执行，并：
  - 在每次回调之后，只要没有其他JavaScript在执行中间
  - 在每个任务结束时



**流程分析**

`task` ==> `clear call stack` ==> `microtask` ==> `宿主环境任务` ==> `task`





## VUE 2.x 的 ntxtTick 实现


在浏览器环境中

> 常见的 `macrotask` 有 
  - `MessageChannel`
  - `setTimeout`
  - `postMessage`
  - `setImmediate`


> 常见的 `microtask` 有 
  - `MutationObsever`
  - `Promise.then`


在 `Vue2.5` 版本以上，单独维护了一个 `nextTick` 实现的文件 `src/core/util/next-tick.js`。 src 目录下存放着 Vue 的源代码实现，下面是 src 目录下的核心代码的目录组织。

- `compiler` ：编译器代码，生成render函数
- `core` ：核心代码，与平台无关的核心部分
- `platforms` ：平台支持，分平台特有代码，相关入口文件
- `serve` ：服务端渲染
- `sfc` ：单文件系统实现
- `shard` ：共享代码，整个代码库通用代码



**接下来看看 `nextTick` 的源码**


```javascript
import { noop } from 'shared/util'
import { handleError } from './error'
import { isIOS, isNative } from './env'

const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// Here we have async deferring wrappers using both microtasks and (macro) tasks.
// In < 2.4 we used microtasks everywhere, but there are some scenarios where
// microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using (macro) tasks everywhere also has subtle problems
// when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use microtask by default, but expose a way to force (macro) task when
// needed (e.g. in event handlers attached by v-on).
let microTimerFunc
let macroTimerFunc
let useMacroTask = false

// Determine (macro) task defer implementation.
// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
/* istanbul ignore if */
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  // PhantomJS
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc
}

/**
 * Wrap a function so that if any code inside triggers state change,
 * the changes are queued using a (macro) task instead of a microtask.
 */
export function withMacroTask (fn: Function): Function {
  return fn._withTask || (fn._withTask = function () {
    useMacroTask = true
    const res = fn.apply(null, arguments)
    useMacroTask = false
    return res
  })
}

export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```


在这里， Vue 同时声明了 
- `microTimerFunc` （微任务实现）
- `macroTimerFunc` （宏任务实现）
- `useMacroTask` （是否使用宏任务标志位）

从上往下，我们先看到的是对宏任务实现的代码逻辑

- 首先判断是否存在 `setImmediate` 可以使用
- 再判断是否存在 `MessageChannel` 可以使用
- 否则降级使用 `setTimeout`

能看到的是 这里宏任务实现采用方式的优先级，和 `Vue` 会判断是否是这些实现方式的方法是否为原生实现。避免第三方 `profill` 的不一致的行为。

接下来是 `microTimerFunc` 微任务实现，可以看到 `Vue` 会判断是否存在原生的 `Promise` 实现，存在则直接使用 `Promise.resolve` 处理，不存在则指向宏任务的实现了。

**这里 Vue 导出了两个函数**

- `nextTick`
- `withMacroTask`


#### nextTick

这里使用闭包的方法，缓存了在同一个 `tick` 中多次执行 `nextTick` 传入的回调函数，将这些回调函数压成同一个同步任务在下一个 `tick` 中一次性执行，保证了多次执行的准确性。
同时根据状态，标识位使用对应的实现方式。


#### withMacroTask

导出的 `withMacroTask` 实际上是一个装饰函数，它将传入的函数包装成一个新的函数，返回值还是原来的函数执行的结果，在函数执行时将 useMacroTask 置为 true ，使执行时的 nextTick 将强制走 宏任务实现。

::: tip 装饰器模式
装饰器模式（Decorator Pattern）允许向一个现有的对象添加新的功能，同时又不改变其结构。这种类型的设计模式属于结构型模式，它是作为现有的类的一个包装。

这种模式创建了一个装饰类，用来包装原有的类，并在保持类方法签名完整性的前提下，提供了额外的功能。
:::











## VUE 3 的 ntxtTick 实现