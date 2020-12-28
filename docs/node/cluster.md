---
title: 多进程集群 Cluster
sidebarDepth: 5
---


# Node 多进程集群

本文分析 node 子进程,多进程,多进程集群架构原理,以及多进程应用示例.

## 进程和线程, NodeJS 单进程

### 进程线程分析

- 进程：指在系统中正在运行的一个应用程序；程序一旦运行就是进程；或者更专业化来说：进程是指程序执行时的一个实例，即它是程序已经执行到课中程度的数据结构的汇集。从内核的观点看，进程的目的就是担当分配系统资源（CPU时间、内存等）的基本单位。
- 线程：系统分配处理器时间资源的基本单元，或者说进程之内独立执行的一个单元执行流。进程——资源分配的最小单位，线程——程序执行的最小单位。


#### 多任务和进程
操作系统可以同时运行多个任务。打个比方，你一边在用浏览器上网，一边在听MP3，一边在用Word赶作业，这就是多任务，至少同时有3个任务正在运行。还有很多任务悄悄地在后台同时运行着，只是桌面上没有显示而已。

对于操作系统来说，一个任务就是一个进程（Process），比如打开一个浏览器就是启动一个浏览器进程，打开一个记事本就启动了一个记事本进程，打开两个记事本就启动了两个记事本进程，打开一个Word就启动了一个Word进程。

有些进程还不止同时干一件事，比如Word，它可以同时进行打字、拼写检查、打印等事情。在一个进程内部，要同时干多件事，就需要同时运行多个“子任务”，我们把进程内的这些“子任务”称为线程（Thread）。

由于每个进程至少要干一件事，所以，一个进程至少有一个线程。当然，像Word这种复杂的进程可以有多个线程，多个线程可以同时执行，多线程的执行方式和多进程是一样的，也是由操作系统在多个线程之间快速切换，让每个线程都短暂地交替运行，看起来就像同时执行一样。当然，真正地同时执行多线程需要多核CPU才可能实现。


#### 多任务实现
多任务的实现有3种方式：

- 多进程模式；
- 多线程模式；
- 多进程+多线程模式。


#### 进程线程的区别

  - 进程是资源分配的最小单位，线程是程序执行的最小单位（资源调度的最小单位）
  - 进程有自己的独立地址空间，每启动一个进程，系统就会为它分配地址空间，建立数据表来维护代码段、堆栈段和数据段，这种操作非常昂贵。
而线程是共享进程中的数据的，使用相同的地址空间，因此CPU切换一个线程的花费远比进程要小很多，同时创建一个线程的开销也比进程要小很多。
  - 线程之间的通信更方便，同一进程下的线程共享全局变量、静态变量等数据，而进程之间的通信需要以通信的方式（IPC)进行。不过如何处理好同步与互斥是编写多线程程序的难点。
  - 但是多进程程序更健壮，多线程程序只要有一个线程死掉，整个进程也死掉了，而一个进程死掉并不会对另外一个进程造成影响，因为进程有自己独立的地址空间。

### node 单进程单线程
NodeJs 是基于 Google Chrome 提供支持的 JavaScript V8引擎 实现的 JavaScript 运行时环境. Node.js 应用程序运行于单个进程中，无需为每个请求创建新的线程. 在其标准库中提供了一组基于 libuv 的异步的 I/O 原生功能

libuv 的实现是一个很经典生产者-消费者模型。 libuv 在整个生命周期中，每一次循环都执行每个阶段（phase）维护的任务队列。逐个执行节点里的回调，在回调中，不断生产新的任务，从而不断驱动libuv。


NodeJs 只在主线程上执行,它是单线程单进程模式.这样可以减少进线程之间的切换导致的性能开销,并且不用考虑锁和线程池的问题。

严格意义上来说, NodeJS 是存在多线程的,基于 libuv 核心库维护任务队列的机制,控制世纪执行回调的形式实现的异步 I/O 功能.例如: Promise ,定时器,js 回调等.libuv存在着一个Event Loop,通过 Event Loop（事件循环）来切换实现类似多线程的效果。


#### 单进程单线程基于事件驱动的问题

单进程单线程基于事件驱动的模式，使用单线程的优点是：避免内存开销和上下文切换的开销。
所有的请求都在单线程上执行的，其他的异步IO和事件驱动相关的线程是通过libuv中的事件循环来实现内部的线程池和线程调度的。可伸缩性比之前的都好，但是影响事件驱动服务模型性能的只有CPU的计算能力，但是只能使用单核的CPU来处理事件驱动，但是我们的计算机目前都是多核的，我们要如何使用多核CPU呢？如果我们使用多核CPU的话，那么CPU的计算能力就会得到一个很大的提升。



### NodeJS的实现多进程架构

NodeJs 运行在单进程的主线程上,基于这种架构设计,为了扩展 NodeJS 的多核心利用能力, 只能实现多进程运行我们的程序,通过进程之间的通信机制,实现多核心多进程.


#### Master-Worker 架构
NodeJS 提供了 Child_process 和 Cluster 模块创建子进程,实现多进程和子进程的管理.进程分为 Master(主进程)和 Worker(子进程),master进程负责调度或管理worker进程，那么worker进程负责具体的业务处理。对于一个 B/S 架构的后端程序而言, master 就负责接受请求,然后分发给 worker 进程进行对应的业务处理. 多个 worker 就相当于多台服务器工作.也就是一个集群.同事 master 还负责监控 worker 的运行状态和管理操作.




## child_process（子进程）

### child_process API

child_process 提供了开启子进程执行代码或命令的能力,分别是:

- `child_process.exec(command[, options][, callback])` 子进程中执行的是非node程序，提供一串shell命令，执行的结果以回调的形式返回。
- `child_process.execFile(file[, args][, options][, callback])` 子进程中执行的是非node程序，提供 shell 脚本文件，执行的结果以回调的形式返回。
- `child_process.fork(modulePath[, args][, options])` 子进程执行 node 程序,执行的结果以流的形式返回。 该模块已建立了 IPC 通信通道，可以在父进程与子进程之间发送消息。
- `child_process.spawn(command[, args][, options])` 子进程中执行的是非node程序，提供一组参数后，执行的结果以流的形式返回。 


child_process.spawn()、child_process.fork()、child_process.exec() 和 child_process.execFile() 方法都遵循其他 Node.js API 惯用的异步编程模式。

每个方法都返回一个 ChildProcess 实例。 这些对象实现了 Node.js 的 EventEmitter API，允许父进程注册监听器函数，在子进程的生命周期中当发生某些事件时会被调用。

child_process.exec() 和 child_process.execFile() 方法还允许指定可选的 callback 函数，当子进程终止时会被调用。


### child_process.exec
`child_process.exec(command[, options][, callback])`

通过衍生新的 shell  执行命令

```javascript
const childI = require('child_process').exec('echo hello',(err,data)=>{
  // console.log(data)
})

childI.stdout.on('data',data=>{
  console.log(data,'stream---------')// hello stream--------
})
```
### child_process.execFile
`child_process.execFile(file[, args][, options][, callback])`

直接运行程序可执行文件,理论上效率比 exec 要好

```javascript
const childI = require('child_process').execFile('echo', ['hello'], (err,data)=>{
  // console.log(data)
})

childI.stdout.on('data',data=>{
  console.log(data,'stream---------')// hello stream--------
})
```

### child_process.spawn
`child_process.fork(modulePath[, args][, options])`

子进程模块最终实现, exec , execFile ,以及 fork 最终都会使用 spawn 异步的开启子进程运行程序.

```javascript
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});
```

### child_process.fork
`child_process.spawn(command[, args][, options])`

child_process.fork() 方法是 child_process.spawn() 的特例，专门用于衍生新的 Node.js 进程。 与 child_process.spawn() 一样返回 ChildProcess 对象。 返回的 ChildProcess 会内置额外的通信通道，允许消息在父进程和子进程之间来回传递。

记住，衍生的 Node.js 子进程独立于父进程，但两者之间建立的 IPC 通信通道除外。 每个进程都有自己的内存，带有自己的 V8 实例。 由于需要额外的资源分配，因此不建议衍生大量的 Node.js 子进程。

通过使用fork方法在单独的进程中执行node程序，通过使用fork新建worker进程，上下文都复制主进程。并且通过父子之间的通信，子进程接收父进程的信息，并执行子进程后结果信息返回给父进程。降低了大数据运行的压力。

接下来看一段示例代码:

```
|------ 项目
|  |--- master.js
|  |--- worker.js
```

```javascript
// master.js
const childProcess = require('child_process');
const cpus = require('os').cpus().length;

for (let i = 0; i < cpus; ++i) {
  childProcess.fork('./worker.js');
}

console.log('Master fork done!');
```

```javascript
// worker.js
console.log('Worker-' + process.pid);
```

打印:
```
Master fork done!
Worker-99017
Worker-99016
Worker-99018
Worker-99019
Worker-99020
Worker-99021
Worker-99023
Worker-99022
Worker-99026
Worker-99024
Worker-99025
Worker-99027
```


这里可以看到的开启了 12 个子进程运行了 worker.js 程序.那么开启了多进程运行程序,那么进程之间通信机制是如何做的呢?


## 父子进程通信

父子进程在创建的时候 node 就帮我们建立了 IPC 通信机制,实现了消息队列形式的父子通信
- 父进程通过 `subprocess.send(msg)` 向子进程发送消息, 通过 `subprocess.on('message',callback)` 监听消息
- 子进程通过 `process.send(msg)` 向子进程发送消息, 通过 `process.on('message',callback)` 监听消息


修改上面的例子:



```
|------ 项目
|  |--- master.js
|  |--- worker.js
```

```javascript
// master.js
const childProcess = require('child_process');
const cpus = require('os').cpus().length;

const workers = []
for (let i = 0; i < cpus; ++i) {
  workers.push(childProcess.fork('./worker.js'))
}

workers.forEach(worker => {
  worker.on('message', m => {
    console.log('father-:', m);
  })
  worker.send('hello world!')
})

console.log('Master fork done!');

```

```javascript
// worker.js
process.on('message', m => {
  console.log('worker-:', m, 'pid:', process.pid);
  process.send('halle father!')
})

```

打印:
```
Master fork done!
worker-: hello world! pid: 99494
worker-: hello world! pid: 99495
father-: halle father!
father-: halle father!
worker-: hello world! pid: 99496
father-: halle father!
worker-: hello world! pid: 99500
father-: halle father!
worker-: hello world! pid: 99504
worker-: hello world! pid: 99501
father-: halle father!
father-: halle father!
worker-: hello world! pid: 99499
worker-: hello world! pid: 99498
father-: halle father!
father-: halle father!
worker-: hello world! pid: 99497
father-: halle father!
worker-: hello world! pid: 99502
father-: halle father!
worker-: hello world! pid: 99503
father-: halle father!
worker-: hello world! pid: 99505
father-: halle father!
```

这里可以看到子进程被创建之后执行顺序是异步且无序的.



## 实现 master 请求分发到 worker



上面是一段简单的父子进程之间通过消息队列的形式传递信息的示例代码.下面我们将基于消息队列实现 master 分发请求到 worker 处理.并添加进程重启功能.

这基于父子间通信的时候传递的值可以是普通值,也可以是句柄值,也就是引用类型的值.引用到同一个被标识的资源.

对于一个业务处理的 tcp server 来说,我们可以在 master 进程上处理连接,然后将套接字传递给子进程,由子进程来处理业务,最后返回数据.

以下是一段实例的代码

```
| ------ project
|   |---  master.js   // 主程序入口
|   |---  worker.js   // 子进程
|   |---  client.js   // 客户端
```


```javascript
// master.js

const childProcess = require('child_process')
const net = require('net')
const cpus = require('os').cpus().length


const workers = []
for (let i = 0; i < cpus; i++) {
  workers.push(childProcess.fork('./worker.js'))
}

const tcpServer = net.createServer()

let workerId = 0
tcpServer.on('connection', socket => {
  workers[workerId % 10].send('socket', socket)
  workerId++
})

tcpServer.listen(8089, (err => {
  console.log('master and workers is ok!');
}))
```
```javascript
// worker.js

process.on('message', (msg, socket) => {
  if (msg !== 'socket') return
  socket.end(`handle by worker: ${process.pid}`)
})
```
```javascript
// client.js
const net = require('net');
const cpus = require('os').cpus().length * 2

for (let i = 0; i < cpus; ++i) {
  net.createConnection({
    port: 8089,
    host: '127.0.0.1'
  }).on('data', (d) => {
    console.log(d.toString());
  })
}
```


接下来用node 运行 master.js ,然后在运行客户端程序 client.js ,我们可以看到输出:

```
handle by worker: 3531
handle by worker: 3532
handle by worker: 3533
handle by worker: 3534
handle by worker: 3535
handle by worker: 3536
handle by worker: 3527
handle by worker: 3528
handle by worker: 3529
handle by worker: 3530
handle by worker: 3531
handle by worker: 3532
handle by worker: 3533
handle by worker: 3534
handle by worker: 3535
handle by worker: 3536
handle by worker: 3527
handle by worker: 3528
handle by worker: 3529
handle by worker: 3530
handle by worker: 3531
handle by worker: 3532
handle by worker: 3533
handle by worker: 3534
```


这里因为是主程序分发套接字到子进程处理,所以分发策略由主程序定制.我们这里定义的策略是循环的以相同权重调用子进程来处理业务.



## 子进程重启

worker 进程可能会因为其他的原因导致异常而退出，为了提高集群的稳定性，我们的 master 进程需要监听每个 worker 进程的存活状态，当我们的任何一个 worker 进程退出之后，master 进程能监听到并且能够重启新的子进程。在我们的 Node 中，子进程退出时候，我们可以在父进程中使用 exit 事件就能监听到。在该事件内部做出对应的处理，比如说重启子进程等操作。


还是上面的分发 socket 的是例子,做一些小的修改

在 master.js 中监听 worker 的 exit 事件,退出后重新创建子进程

```javascript
// master.js

const childProcess = require('child_process')
const net = require('net')
const cpus = require('os').cpus().length

function createExitFn (workers, i) {
  return () => {
    workers[i] = childProcess.fork('./worker.js')
    console.log(`进程重启完成,process id: ${workers[i].pid}`);
    workers[i].on('exit', createExitFn(workers, i))
  }
}

const workers = []
for (let i = 0; i < cpus; i++) {
  const worker = childProcess.fork('./worker.js')
  workers.push(worker)
  worker.on('exit', createExitFn(workers, i))
}

const tcpServer = net.createServer()

let workerId = 0
tcpServer.on('connection', socket => {
  workers[workerId % 10].send('socket', socket)
  workerId++
})

tcpServer.listen(8089, (err => {
  console.log('master and workers is ok!');
}))

```

在 worker.js 中随机的是进程退出,测试退出之后是否重新启动子进程.

```javascript
// worker.js

process.on('message', (msg, socket) => {
  if (msg !== 'socket') return

  if (Math.random() > 0.6) {
    console.log(`${process.pid} 进程退出了`);
    socket.end(`Error: ${process.pid}`)
    process.exit(1)
  }
  socket.end(`handle by worker: ${process.pid}`)
})
```


接下来用node 运行 master.js ,然后在运行客户端程序 client.js

我们可以在客户端的控制台中看到输出:

```
handle by worker: 4815
handle by worker: 4817
handle by worker: 4818
handle by worker: 4821
handle by worker: 4823
handle by worker: 4822
handle by worker: 4822
handle by worker: 4823
Error: 4815
Error: 4819
Error: 4817
Error: 4816
Error: 4818
Error: 4824
Error: 4820
Error: 4821
```


服务端控制台输出

```
4815 进程退出了
4819 进程退出了
4817 进程退出了
4816 进程退出了
4818 进程退出了
4824 进程退出了
4820 进程退出了
4821 进程退出了
进程重启完成,process id: 4828
进程重启完成,process id: 4829
进程重启完成,process id: 4830
进程重启完成,process id: 4831
进程重启完成,process id: 4832
进程重启完成,process id: 4833
进程重启完成,process id: 4834
进程重启完成,process id: 4835
```

## Worker监听同一个端口


我们之前已经实现了句柄可以发送普通对象及socket对象外，我们还可以通过句柄的方式发送一个server对象。我们在master进程中创建一个TCP服务器，将服务器对象直接发送给worker进程，让worker进程去监听端口并处理请求。因此master进程和worker进程就会监听了相同的端口了。当我们的客户端发送请求时候，我们的master进程和worker进程都可以监听到

那么在这种模式下，主进程和worker进程都可以监听到相同的端口，当网络请求到来的时候，会进行抢占式调度，监听了 connection 事件的处理程序会抢占处理,只有一个worker进程会抢到链接然后进行服务，由于是抢占式调度，可以理解为谁先来谁先处理的模式，因此就不能保证每个worker进程都能负载均衡的问题。



以下是一段实例的代码

```
| ------ project
|   |---  master.js   // 主程序入口
|   |---  worker.js   // 子进程
|   |---  client.js   // 客户端
```


```javascript
// master.js

const childProcess = require('child_process')
const cpus = require('os').cpus().length
const net = require('net')

const tcpServer = net.createServer()

tcpServer.listen(8089, (err) => {
  if (err) return
  for (let i = 0; i < cpus; i++) {
    childProcess.fork('./worker.js').send('tcpServer', tcpServer)
  }
})
```


```javascript
// worker.js

process.on('message', (msg, tcpServer) => {
  if (msg !== 'tcpServer') return
  tcpServer.on('connection', (socket) => {
    socket.end(`hello,i am ${process.pid}`)
  })
})
```
```javascript
// client.js
const net = require('net');
const cpus = require('os').cpus().length

for (let i = 0; i < cpus; ++i) {
  net.createConnection({
    port: 8089,
    host: '127.0.0.1'
  }).on('data', (d) => {
    console.log(d.toString());
  })
}
```


接下来用node 运行 master.js ,然后在运行客户端程序 client.js ,我们可以看到输出:

```
hello,i am 5136
hello,i am 5136
hello,i am 5137
hello,i am 5135
hello,i am 5136
hello,i am 5133
hello,i am 5132
hello,i am 5137
hello,i am 5136
hello,i am 5135
hello,i am 5137
hello,i am 5133
```


可以看到的是,编号 5136 的 worker 抢占到的处理较多.



