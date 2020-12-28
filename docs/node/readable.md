---
title: 可读流 Readable Stream
---





# 可读流`API`分析
--------
### 有哪些可读流
可读流是生产数据用来供程序消费的流。常见的数据生产方式有读取磁盘文件、读取网络请求内容等

```javascript
// fs 模块可读流
let rs = fs.createReadStream(filePath,options)

// http模块可读流
let server = http.createServer();
server.on('request',(req,res) => {})

// 控制台标准输入可读流
process.stdin.pipe(someWriteStream)
```
----------------
### 可读流的创建和两种模式
可读流有两种模式，并随时可以转换，我们可以通过监听可读流的事件来操作它。
- 流动模式
- 暂停模式

创建可读流默认是暂停模式，可以通过显式的在可读流的`readable`事件回调中调用`stream.read` 方法读取数据。
- 暂停模式读取第一次`highWaterMark `的示例
```javascript
let rs = fs.createReadStream(path.join(__dirname, '../1.txt'), { encoding: 'utf8', highWaterMark: 3 })
const readFn = () => {
  // read 方法需要参数readSize,
  // 不传默认为读取缓冲区中所有数据，随机触发下一次readable
  // 传入小于hightWaterMark 的值会读取部分缓冲区中的数据，等待缓冲区读空触发下一次readable事件
  console.log(rs.read());
  rs.off('readable', readFn)
}
rs.on('readable', readFn)

```

- 流动模式读取所有数据的示例
```javascript
let rs = fs.createReadStream(path.join(__dirname, '../1.txt'), { encoding: 'utf8', highWaterMark: 3 })
const resArr = []
rs.on('data', (data) => { resArr.push(data) })
rs.on('end', () => { console.log(resArr.join('')); })
```

-----------------
### 流动模式和暂停模式之间的切换
##### 暂停模式 `==>` 流动模式
- 添加 'data' 事件句柄。
- 调用 stream.resume() 方法。
- 调用 stream.pipe() 方法将数据发送到可写流。
```javascript
// resume触发flowing mode
Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
           debug('resume');
           state.flowing = true;
    resume(this, state);
  }
  return this;
}

// data事件触发flowing mode
Readable.prototype.on = function(ev, fn) {
    ...
    if (ev === 'data' && false !== this._readableState.flowing) {
        this.resume();
      }
      ...
}
// pipe方法触发flowing模式
Readable.prototype.resume = function() {
    if (!state.flowing) {
        this.resume()
    }
}
```

#####  流动模式 `==>`  暂停模式

- 如果不存在管道目标，调用stream.pause()方法
- 如果存在管道目标，调用 stream.unpipe()并取消'data'事件监听

```javascript
let rs = fs.createReadStream(path.join(__dirname, '../1.txt'), { encoding: 'utf8', highWaterMark: 3 })
const resArr = []
rs.on('data', (data) => {
  resArr.push(data)
  // 切换暂停
  rs.pause()
  setTimeout(() => {
    // 切换流动
    rs.resume()
  }, 200);
})
rs.on('end', () => { console.log(resArr.join('')); })
```
------------------
### 可读流的事件

```javascript
// 可读流输出数据事件
rs.on('data', res => {
  console.log(res, 'data');
})
// 可读流读完事件
rs.on('end', () => {
  console.log('end');
})
// 可读流发生错误
rs.on('error', err => {
  console.log(err);
})
// 缓冲区有可读区的数据事件
rs.on('readable', readFn)

// 创建文件可读流文件打开事件
rs.on('open', fd => {
  console.log(fd, '文件打开了');
})
// 可读流关闭事件，可在创建可读流时 传入 autoClose 控制是否触发
rs.on('close', err => {
  console.log('close');
})
```

----------
## 实现可读流`fs.createReadStream`
### 代码

``` javascript
/** fs.createReadStream.js */
/** 
 * 实现可读流
 * 支持data/open/close/error事件
 * 支持pause/resume 方法
 */

let EventEmitter = require('events');
let fs = require('fs')


class fsCreateReadStream extends EventEmitter {
  constructor(path, options) {
    super()
    // path is must be a path string. 
    if (!path || typeof path !== 'string') {
      this.emit('error', new Error('path is required as a path string'))
    }
    this.path = path
    this.flags = options.flags || 'r'
    this.highWaterMark = options.highWaterMark || 16
    this.start = options.start || 0
    this.posi = this.start
    this.end = options.end || null
    this.autoClose = options.autoClose !== false
    this.encoding = options.encoding || null
    // create a buffer to Avoid duplicate creation.
    this.buffer = Buffer.alloc(this.highWaterMark)

    this.open()

    this.on('newListener', (event, listener) => {
      if (event === 'data') {
        // flowing mode.
        this.flowing = true
        this.read()
      }
    })

  }

  read () {
    // not open file yet. wait this open functionemit the open event.
    if (typeof this.fd !== 'number') {
      this.once('open', () => {
        this.read()
      })
      return
    }
    // if has the end flag. need computed read how much bytes.
    const howMuchToRead = this.end ? Math.min(this.highWaterMark, this.end - this.posi) : this.highWaterMark
    fs.read(this.fd, this.buffer, 0, howMuchToRead, this.posi, (err, bytesRead, buffer) => {
      if (err) {
        this.emit('error', err)
        this.destory()
        return
      }
      if (bytesRead > 0) {
        // move the posi.
        this.posi += bytesRead
        // Aviod the previous buffer data
        buffer = buffer.slice(0, bytesRead)
        const data = this.encoding ? buffer.toString(this.encoding) : buffer
        this.emit('data', data)
        if (this.end && this.posi > this.end) {
          this.emit('end')
          this.destory()
        }
        // flow mode 
        if (this.flowing) {
          this.read()
        }
        return
      }
      this.emit('end')
      this.destory()
    })
  }
  pause () {
    this.flowing = false
  }
  resume () {
    this.flowing = true
    this.read()
  }
  open () {
    fs.open(this.path, this.flags, (err, fd) => {
      if (err) {
        this.emit('error', err)
        if (this.autoClose) {
          this.destory()
        }
        return
      }
      this.fd = fd
      this.emit('open', this.fd)

    })
  }
  destory () {
    if (typeof this.fd === 'number') {
      fs.close(this.fd, () => {
        this.emit('close')
      })
      return
    }
    this.emit('close')
  }

}

function createReadStream () {
  return new fs.ReadStream(...arguments)
}

module.exports = { createReadStream }
```


------------ 
#### 测试单元

```javascript

const fs = require(path.join(__dirname, '../src/fs.createReadStream.js'))

let rs = fs.createReadStream(
  path.join(__dirname, '../1.txt'),
  {
    encoding: 'utf8',
    highWaterMark: 3,
    autoClose: false
  }
)
...

```




