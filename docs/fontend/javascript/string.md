---
title: string
sidebarDepth: 5
---


## String 类型

生成字符串类型方法


```javascript
let aa = '123'
// "123"

let aa = String('123')
// "123"

let aa = new String('123')
// 字符串对象包裹，使用操作符计算的时候  aa 是 "123"

let aa = String([1,2,3])
// 字符串  "1,2,3"
// 类似 [1,2,3].join(',')

let aa = String({})
// "[object Object]"
// toString()方法本质就是调用 String({})
```



### 属性

- `length`

  返回字符串的长度。


### 查询


--------------------

- `search(regexp|string)`


  返回匹配给定正则表达式或子串的索引值（位置），未找到返回 -1 

  ```javascript
  let aa = '123456'
  // undefined
  aa.search('12')
  // 0
  aa.search(/23/)
  // 1
  ```

--------------------

- `indexOf(searchValue[, fromIndex])`

  返回字符串中指定文本首次出现的索引（位置），未找到返回 -1 

  可选的起始位置索引

--------------------  
- `laseIndexOf(searchValue[, fromIndex])`

  返回指定文本在字符串中最后一次出现的索引（位置），未找到返回 -1 

  可选的起始位置索引

  向后进行检索（从尾到头），这意味着：假如第二个参数是 50，则从位置 50 开始检索，直到字符串的起点。
--------------------
- `includes(searchString[, position])`

  返回布尔值，判断原字符串是否包含给定的字符串。position表示开始查找的索引，默认为 0 。  
--------------------
- `starts​With(searchString [, position])`

  返回布尔值，判断原字符串是否是以另外一个给定的子字符串“开头”。 `position` 表示开始查找的索引，默认为 0 。

  设置 `position` 相当于先调用 `slice` 截取字符串后 看是否与给定字符串**开头**
--------------------
- `end​With(searchString [, position])`

  返回布尔值，判断原字符串是否是以另外一个给定的子字符串“结尾”。 `position` 表示开始查找的索引，默认为 0 。

  设置 `position` 相当于先调用 `slice` 截取字符串后 看是否与给定字符串**结尾**
--------------------
- `match(regexp)`

  检索返回原字符串匹配正则表达式的结果。

  正则有全局匹配标识符 g 的时候，返回每个匹配到的子串。

  ```javascript
  let aa = '123123123'
  // "123123123"
  aa.match(/123/)
  // ["123", index: 0, input: "123123123", groups: undefined]
  aa.match(/123/g)
  // (3) ["123", "123", "123"]
  aa.match(/1231/g)
  // ["1231"]
  ```
- `matchAll(regexp)`

  返回一个包含所有匹配正则表达式及分组捕获结果的迭代器。

  正则表达式必须有 全局匹配标识符 g

  ```javascript
  let aa = '123123123'
  // "123123123"
  aa.matchAll(/1231/)
  // String.prototype.matchAll called with a non-global RegExp argument

  let cc = aa.matchAll(/123/g)
  for(let dd of cc ){console.log(dd)}
  // VM1548:1 ["123", index: 0, input: "123123123", groups: undefined]
  // VM1548:1 ["123", index: 3, input: "123123123", groups: undefined]
  // VM1548:1 ["123", index: 6, input: "123123123", groups: undefined]
  ```




### 截取

字符串截取方法


- `slice(begin[, end])`

  返回截取的索引之间的字符串，没有则返回孔字符串

  begin end 如果是负值，则从后往前数的索引。

  ```javascript
  aa = 'abcdefghi'
  aa.slice(0,3)
  // "abc"
  aa.slice(0,-3)
  // "abcdef"
  aa.slice(-3,-1)
  // "gh"
  ```

-----------------
- `substring(start[, end])`

  返回截取的索引之间的字符串，没有则返回孔字符串, 与 slice 基本上一致。

  begin end 不能是负值。

  ```javascript
  aa = 'abcdefghi'
  aa.substring(0)
  // "abcdefghi"
  aa.substring(0,3)
  //  "abc"   
  ```
-----------------
- `substr(start[, length])`

  返回从开始索引 start 开始截取的指定长度 length 的字符串

  length 缺省则截取到末尾。

  ```javascript
  aa = 'abcdefghi'
  aa.substr(0)
  // "abcdefghi"
  aa.substr(0,4)
  // "abcd"
  aa.substr(-3)
  // "ghi"
  aa.substr(-3,2)
  // "gh"
  ```
-----------------
- `split(separator,howmany)`

  `separator`	必需。字符串或正则表达式，从该参数指定的地方分割 `stringObject。`

  `howmany`	可选。该参数可指定返回的数组的最大长度。如果设置了该参数，返回的子串不会多于这个参数指定的数组。如果没有设置该参数，整个字符串都会被分割，不考虑它的长度。
-----------------
- `trim()`

  返回一个将原字符的两端删除空白字符。
-----------------
- `trim​Right()`

  返回一个将原字符的右端删除空白字符。
-----------------
- `trim​Left()`

  返回一个将原字符的左端删除空白字符。
-----------------
- `chartAt(index)`

  从原字符串中返回指定索引的字符。


### 拼接

- `concat(stringX,stringX,...,stringX)`

  `stringX`	必需。将被连接为一个字符串的一个或多个字符串对象。

  方法将把它的所有参数转换成字符串，然后按顺序连接到字符串 `stringObject` 的尾部，并返回连接后的字符串。

  不改变原字符串



--------------
- `pad​Start(targetLength [, padString])`

  返回用给定的字符串填充原字符串的末尾，以达到指定长度。 `padString` 表示用于填充的字符串，默认为`" "`。

-------------------
- `padEnd(targetLength [, padString])`

  返回用给定的字符串填充原字符串的开头，以达到指定长度。 `padString` 表示用于填充的字符串，默认为`" "`。

-----------
- `repeat(count)`

  重复 `count` 次字符串，返回新的字符串



### 查找替换 （replace）

replace() 方法用于在字符串中用一些字符替换另一些字符，或替换一个与正则表达式匹配的子串。

`stringObject.replace(regexp/substr,replacement)`

  `regexp/substr`

  必需。规定子字符串或要替换的模式的 RegExp 对象。

  请注意，如果该值是一个字符串，则将它作为要检索的直接量文本模式，而不是首先被转换为 RegExp 对象。

  `replacement`	必需。一个字符串值。规定了替换文本或生成替换文本的函数。

##### 说明
字符串 `stringObject` 的 `replace()` 方法执行的是查找并替换的操作。它将在 `stringObject` 中查找与 `regexp` 相匹配的子字符串，然后用 `replacement` 来替换这些子串。如果 `regexp` 具有全局标志 `g`，那么 `replace()` 方法将替换所有匹配的子串。否则，它只替换第一个匹配子串。

`replacement` 可以是字符串，也可以是函数。如果它是字符串，那么每个匹配都将由字符串替换。但是 `replacement` 中的 `$` 字符具有特定的含义。如下表所示，它说明从模式匹配得到的字符串将用于替换。

|字符	|替换文本|
|----|----|
$1、$2、...、$99|	与 regexp 中的第 1 到第 99 个子表达式相匹配的文本。|
$&	|与 regexp 相匹配的子串。|
$`|	位于匹配子串左侧的文本。|
$'|	位于匹配子串右侧的文本。|
$$|	直接量符号。|





### 转换大小写
- `toLower​Case()`

  返回一个将原字符串转化成小写的字符串。

- `toUpper​Case()`

  返回一个将原字符串转化成大写的字符串。