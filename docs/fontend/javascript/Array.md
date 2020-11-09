---
title: Array 
sidebarDepth: 5
---



## 数组属性




### `length`

- **说明：**

  返回数组长度。

------------------





## 数组操作



### concat
`concat(Array)`

- **是否改变原数组：** 否
  
- **说明：**

  将原数组与参数数组连接，返回连接后的新数组。不改变原数组。

------------------


### push
`push(item[,item1[,item2...]])`

- **是否改变原数组：** 是
  
- **说明：**

  方法（在数组结尾处）向数组添加一个新的元素：
------------------


### unshift
`unshift(item)`

- **是否改变原数组：** 是
  
- **说明：**

  方法（在数组开头处）向数组添加新的元素, 返回添加后的数组长度。

------------------


### pop
`pop()`

- **是否改变原数组：** 是
  
- **说明：**

  弹出数组最后一项，返回弹出项。

------------------


### shift
`shift()`

- **是否改变原数组：** 是
  
- **说明：**

  移出数组第一项，索引前移。返回移出的项。
------------------


### slice
`slice([begin = 0 [, end = this.length - 1]])`

- **是否改变原数组：** 否
  
- **说明：**

  从数组中截取部分，默认截取全部。截取的新数组是原数组的浅拷贝数组。


------------------
### splice
`splice(start, deleteCount[, item1[, item2...])`

- **是否改变原数组：** 是
  
- **说明：**

  在指定位置删除数组元素并添加新元素。返回移除的元素数组。

  - start: 开始操作的索引
  - deleteCount: 要移除的数组元素的个数
  - itemN: 要添加进数组的元素，如果不指定，则splice只删除数组元素
------------------


### reverse
`reverse()`

- **是否改变原数组：** 是
  
- **说明：**

  反转原数组。返回数组。
------------------


### fill
`fill(value [,statrt = 0[, end = this.length]])`

- **是否改变原数组：** 是
  
- **说明：**

  向数组填充指定元素，不指定位置则默认全部填充。返回数组。
------------------


### copyWithin
`copyWithin(target, start [, end = this.length]）`

- **是否改变原数组：** 是
  
- **说明：**

  - target（必需）：从该位置开始替换数据。如果为负值，表示倒数。
  - start（可选）：从该位置开始读取数据，默认为 0。如果为负值，表示倒数。
  - end（可选）：到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。不包括 end 位置元素。
  
  从数组中截取 start 到 end 的元素，然后从 target 位置开始替换数组的元素，遇到没有需要替换，或者没有可替换的值时停止。

  ```javascript
  aa = [1,2,3,4,5,6]
  // (6) [1, 2, 3, 4, 5, 6]
  aa.copyWithin(0,3,5)
  // (6) [4, 5, 3, 4, 5, 6]
  ```
------------------


### sort
`sort(fn(a,b))`

- **是否改变原数组：** 是
  
- **说明：**

  - fn 返回 0 ,位置不变
  - fn 返回正值, ab 交换位置
  - fn 返回负值, ab 位置不变
  - fn `return a-b` 正序，反之
  
  ```javascript
  [1,2].sort((a,b)=>{return a-b})
  // (2) [1, 2]
  [1,2].sort((a,b)=>{return b-a})
  // (2) [2, 1]
  ```
------------------


### valueOf
`valueOf()`

- **是否改变原数组：** 否
  
- **说明：** 返回原数组
------------------


### flat
`flat(level)`

- **是否改变原数组：** 否
  
- **说明：** 
 
  接受要递归摊平的层级，默认为 1

  ```javascript
  const arr2 = [0, 1, 2, [[[3, 4]]]];

  console.log(arr2.flat(2));
  // expected output: [0, 1, 2, [3, 4]]
  ```
------------------


### flatMap
`flatMap(level)`

- **是否改变原数组：** 否
  
- **说明：** 
 
  对原数组的每个成员执行一个函数（相当于执行 `Array.prototype.map()` ），然后对返回值组成的数组执行 `flat()` 方法。该方法返回一个新数组，不改变原数组。
  
  注意：`flatMap()` 只能展开一层数组。
------------------





## 数组查询



### includes
`includes(searchItem, [, startIndex])`

- **返回值：** `boolean` 是否包含该项
  
- **说明：**
  - `searchItem` 要查找的数组项，内部使用严格等于 `===`
  -  `startIndex` 开始查找位置索引，负数从后面位置开始。
  
------------------


### indexOf
`indexOf(searchItem[, startIndex = 0])`

- **返回值：** 返回索引值，没有查找到则返回 -1
  
- **说明：**
  - `searchItem` 要查找的数组项，内部使用严格等于 `===`
  -  `startIndex` 开始查找位置索引，负数从后面位置开始。
  
------------------


### lastIndexOf
`lastIndexOf(searchItem[, startIndex = 0])`

- **返回值：** 返回索引值，没有查找到则返回 -1
  
- **说明：**
  和 indexOf 一样，从后面开始查找。
  
------------------




## 数组遍历


### findIndex
`findIndex((item,index)=>{return Boolean})`

- **返回值：** 查找到的索引
  
- **说明：**
  遍历数组，调用参数函数，查找到函数调用返回值为true 的项的索引，没有返回 -1
  
------------------


### find
`find((item,index)=>{return Boolean})`

- **返回值：** 查找到的数组项
  
- **说明：**
  遍历数组，调用参数函数，查找到函数调用返回值为true 的项，没有返回 undefined
  
------------------


### some
`some((item,index)=>{return Boolean})`

- **返回值：** `boolean` 是否存在符合要求的项
  
- **说明：**
  遍历数组，调用参数函数，若返回true 则查找到该项，停止遍历，返回 true
  
------------------


### every
`every((item,index)=>{return Boolean})`

- **返回值：** `boolean`是否所有项都满足条件
  
- **说明：**
  遍历数组，调用参数函数，返回所有调用函数返回值都为true ，则返回true
  
------------------


### filter
`filter((item,index)=>{return Boolean})`

- **返回值：** 查找到的子数组
  
- **说明：**
  遍历数组，调用参数函数，返回所有调用函数返回值为true 的项组成的新数组。
  
------------------


### forEach
`forEach((item,index)=>{ ... })`

- **返回值：** `undefined`
  
- **说明：**
  遍历数组，调用参数函数
  
------------------


### map
`map((item,index)=>{ return newItem })`

- **返回值：** 参数函数返回值组成的新数组
  
- **说明：**
  不改变原数组，生成新数组的方法。
  
------------------


### reduce
`reduce(callback[, initialValue])`

- **返回值：** 遍历调用函数之后的累加处理的值，任意类型
  
- **说明：**
  
  - `callback：` 累计器函数，接受四个参数 
    - `Accumulator` 累计器
    - `Current Value (cur)` (当前值)
    - `Current Index (idx)` (当前索引)
    - `Source Array (src)` (源数组)
  - `initValue` 累计器初始值

  累计器初始值可选，有初始值则遍历数组调用处理函数，没有初始值，则去数组第一项作为初始值，从第二项开始遍历累计器
  
------------------


### reduceRight
`reduceRight(callback[, initialValue])`

- **返回值：** 遍历调用函数之后的累加处理的值，任意类型
  
- **说明：**
  
  与 `reduce` 相同，从数组尾部开始遍历。

------------------


### keys
`keys()`

- **返回值：** 数组索引遍历器接口 `Iterator`
  
```javascript
for(let i of [5,5,5].keys()){console.log(i)}
// 0
// 1
// 2
//undefined
```

------------------


### values
`values()`

- **返回值：** 数组项遍历器接口 `Iterator`
  
```javascript
for(let i of [5,5,5].values()){console.log(i)}
// 5
// 5
// 5
//undefined
```

------------------


### entries
`entries()`

- **返回值：** 数组索引遍历器接口 `Iterator`
  
```javascript
for(let i of [5,5,5].entries()){console.log(i)}
// (2) [0, 5]
// (2) [1, 5]
// (2) [2, 5]
// undefined
```

------------------



## 其他方法


### toString
`toString()`

- **返回值：** `String`
  
- **说明：**
  
  内部先遍历数组，每一项调用 `Object.toString` 方法转化为字符串，然后 `join(',')`

------------------



### toLocaleString
`toLocaleString()`

- **返回值：** `String`
  
- **说明：**
  
  内部先遍历数组，每一项调用 `Object.toLocaleString` 方法转化为字符串，然后 `join(',')`

------------------



### hasOwnProperty
`hasOwnProperty(index)`

- **返回值：** `boolean`
  
- **说明：**
  
  是否存在索引项

------------------
### propertyIsEnumerable
`propertyIsEnumerable(index)`

- **返回值：** `boolean`
  
- **说明：**
  
  该索引项是否可枚举。

------------------

