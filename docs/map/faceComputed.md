---
title: 简单重叠实心多边形的交集/并集计算
---


## 业务场景

先说说背景吧，之前在业务中实际上接触了某市街道网格数据，但是只有街道网格数据，当时就在想如何求解社区数据。后来衍生到如何求解网格数据交集并集。百度过程中发现沈阳工业大学的的一篇论文，

- [ 带孔洞的多边形求交集算法](http://read.pudn.com/downloads90/doc/project/344041/%B4%F8%BF%D7%B6%B4%B5%C4%B6%E0%B1%DF%D0%CE%C7%F3%BD%BB%BC%AF%CB%E3%B7%A8.pdf)

想到业务中可能会存在面的切割，求交，求并方法，高德地图目前并没有提供这些方法。于是查询相关的库的实现。其实有一部分想法是自己想实现一个几何图形的编辑类库，**Too Young too simple!!!!**
一顿百度搜索猛如虎，实际上查到有效的库并不多，嗯   顿时觉得机会来了。


- [ 基于Turf.js教你快速实现地理围栏的合并拆分](https://juejin.im/post/6844904159641075726)




## 思路

需要了解的数学知识
- 法向量，是一条垂直于面的法向量，对于逆时针顺序的有序点集合，法向量为正直，对于顺时针法向量为负值
- 法向量通过向量叉积求的，A x B 为负值，实际几何意义为A向量在B 向量的逆时针方向上，反之。
- 面的面积可以通过法向量和求解，法向量和为正，有序数组为顺时针排列



## 流程
在**带孔洞的多边形求交集算法**中的实心面的求交中，总结下来分为以下流程

- 一般吧多边形表示为环，一组有序点的集合。定义为二维数组，存放顶点数据，
- 环的顶点集合应该采用二维笛卡尔，符合右手法则，即右手握拳，逆时针转动，Z轴指向屏幕面向自己的方向
- 交点是产生新边界的关键，必须求出所有交点的值
- 把交点分别插入两个环中，并记录该点是出点还是入点。并记录出点对应另一个面的入点索引。
- 查找集合，经过一个出点 ==> 入点/跳转另一个面出点 ==>入点/跳转另一个面出点 这样的循环过程，就可以求交求并。


## 实现


::: danger 浮点数问题
通过上面的分析，这是一个复杂的数学求解过程，必然涉及到的就有浮点型小数的问题，需要通过有效小数问题尽量规避问题
:::


定义浮点小数计算方法
```javascript
// 通过保留有效小数实现解决浮点数问题
const _ignoreFloatNum = 10
function _toFixed (num) {
  return num.toFixed(_ignoreFloatNum) * 1
}
```


首先需要满足二维笛卡尔坐标的要求，把坐标转换为逆时针有序数组,通过计算所有三角形面的法相和，负值为逆时针，正为顺时针，返回整理后的有序集合
```javascript
/**
 * 校验面数据点位顺逆方向，返回方向后的数据
 * 通过法相和/叉积和判断顺时针还是逆时针
 * @param {Array2} list 点位二维数组
 * @param {Boolean} clockLeft 是否返回逆时针
 */
function clockComputed (list, clockLeft = true) {
  // 面数据不少于三个点
  if (list.length < 3) return
  // 记录叉积和，即法相Z
  let count = 0
  const [x0, y0] = list[0]._p
  for (let i = 1; i < list.length - 2; i++) {
    const [x1, y1] = list[i]._p
    const [x2, y2] = list[i + 1]._p
    const res = _toFixed((((x1 - x0) * (y2 - y0)) - ((x2 - x0) * (y1 - y0))))
    count += res
  }

  // 叉积为0 则点在一条直线上
  if (count === 0) {
    throw Error('所有点在一条直线上')
  }


  if (clockLeft) { //逆时针，面积为正值
    return count > 0 ? list : list.reverse()
  } else { // 顺时针
    return count < 0 ? list : list.reverse()
  }
}
```

对两个面的求交求并，首先需要查找交点，生成出入信息。然后循环的取出点信息

```javascript
/**
 * 
 * @param {Array} listA 实心面A
 * @param {Array} listB 实心面B
 */
function Intersection () {

  // const faceA = [[0, 0], [5, 0], [5, 5], [0, 5]]
  // const faceB = [[2.5, 2.5], [10, 2.5], [10, 10], [2.5, 5]]

  // const faceA = [[0, 0], [1, 0], [2, 2], [1, 3], [0, 3]]
  // const faceB = [[3, 0], [1, 0], [1, 2], [1, 3], [3, 3]]

  // const faceA = [[0, 0], [5, 0], [5, 10], [0, 10]]
  // const faceB = [[5, 0], [10, 0], [10, 10], [5, 10], [8, 5]]

  // const faceA = [[0, 0], [3, 0], [3, 3], [0, 3]]
  // const faceB = [[2, 0], [6, 0], [6, 6], [2, 3]]

  const faceA = [[0, 0], [3, 0], [3, 3], [0, 3]]
  const faceB = [[6, 0], [6, 3], [2, 2], [4, 2], [2, 1]]


  // 生成记录交点信息的数据
  const [_faceA, _faceB] = insertPointOfTwoFace(faceA, faceB)

  console.log(_faceA);
  console.log('--------');
  console.log(_faceB);

  // 查找可以开始的第一个点
  // 正值开始，求并，对应循环里的判断正值，实际上循环是一个 正 ==> 负/正 ==> 负
  // 负值开始，求交，对应循环里的判断为负值，实际上循环是一个 fu ==> 正/负 ==> 正
  const _aIdx = _faceA.findIndex(item => { return item.normal < 0 })

  const res = []

  // 循环取点过程
  function getRes (aIdx) {
    for (let i = aIdx; i < _faceA.length * 2; i++) {
      // 拿到交点
      const pA = _faceA[i % _faceA.length]
      // 如果遇到反向值，开始循环面B，并打断A循环，否则添加数据
      if (pA.normal ? pA.normal > 0 : false) {
        let bIdx = pA.bIndex
        for (let j = bIdx; j < _faceB.length * 2; j++) {
          const pB = _faceB[j % _faceB.length]
          // 再次远到反向值，获取对应A 的索引，判断是否是开始索引，不是开始下一循环，直到到起点，
          // 否则添加数据
          if (pB.normal ? pB.normal > 0 : false) {
            let aIdx2 = pB.aIndex
            if (aIdx2 !== _aIdx) {
              getRes(aIdx2)
            }
            break
          } else {
            res.push(pB)
          }
        }
        break
      } else {
        res.push(pA)
      }
    }
  }

  getRes(_aIdx)


  console.log('-----------');
  console.log(res);

}
```



接下来则需要实现的就是我们的插入交点信息的方法，该方法接受有序点集合，返回生成的带交点信息的有序集合


```javascript
/**
 * 求实心面A 和实心面B 的交点并生成该交点的法向量Z,标记了出口还是入口，负值为入口（进入内部），正值为出口（从内部出去）
 * @param {Array} listA 实心面A
 * @param {Array} listB 实心面B
 */
function insertPointOfTwoFace (listA, listB) {

  // 生成可记录对象
  listA = listA.map(item => { return { _p: item, normal: null } })
  listB = listB.map(item => { return { _p: item, normal: null } })

  // 把点转换为逆时针数组
  listA = clockComputed(listA);
  listB = clockComputed(listB);

  // 遍历面A，拿到索引为i和i++点的线段，超出则闭环连接到起始点
  for (let i = 0; i < listA.length; i++) {
    const m = (i + 1) % listA.length
    const lineA = [listA[i]._p, listA[m]._p]

    // 记录点在最后生成的带交点的面中的索引index
    listA[i]._aIndex = i

    // 遍历面B，生成线段，记录索引
    for (let j = 0; j < listB.length; j++) {
      const n = (j + 1) % listB.length
      const lineB = [listB[j]._p, listB[n]._p]

      listB[j]._bIndex = j

      // 获得线段与线段交点，null 为不想交
      const point = getPoint(lineA, lineB)

      if (point) {

        // 入口判断下个向量是不是马上出去，是的话忽略
        if (point.normal < 0) {
          const lineC = [listB[n]._p, listB[(n + 1) % lineB.length]._p]
          const lastNormal = getNormal(lineA, lineC)
          

          //这里需要增加入点即出点的情况
        }

        // 用于记录插入交点的索引
        let aIndex = m
        let bIndex = n

        if (
          (listA[i]._p[0] === point._p[0]) && (listA[i]._p[1] === point._p[1])
        ) {
          // 这里不进，因为获取交点时排除了起点为交点

          // 如果交点是起点，直接记录法相，交点索引不需要更新
          listA[i].normal = point.normal
        } else if ((listA[m]._p[0] === point._p[0]) && (listA[m]._p[1] === point._p[1])) {

          // 交点是终点，记录法相，更新交点索引
          listA[m].normal = point.normal
          aIndex = m
        } else {
          // 否则在线段之间插入交点，更新记录的索引 
          // ++i 之后 i就是新的索引
          listA.splice(m, 0, { ...point, _aIndex: m })
          i++
        }

        if ((listB[j]._p[0] === point._p[0]) && (listB[j]._p[1] === point._p[1])
        ) {
          // 这里不进，因为获取交点时排除了起点为交点

          listB[j].normal = -1 * point.normal
        } else if ((listB[n]._p[0] === point._p[0]) && (listB[n]._p[1] === point._p[1])) {
          listB[n].normal = -1 * point.normal
          bIndex = n
        } else {
          listB.splice(n, 0, { ...point, normal: -1 * point.normal, _bIndex: n })
          j++
        }


        // 双向记录交点对应另外一个面的起点索引
        listA[aIndex].bIndex = bIndex
        listB[bIndex].aIndex = aIndex

      }
    }

  }

  return [listA, listB]

}

```



然后要实现的就是基础的求交点，求法相的方法。


```javascript
/**
 * 获取法相normal Z
 */
function getNormal (lineA, lineB) {
  const [[x1, y1], [x2, y2]] = lineA
  const [[x3, y3], [x4, y4]] = lineB

  return (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3)
}

/**
 * 求两个向量是否有交点有则返回点和点的法向量z，没有返回null
 * @param {Array} lineA 向量A
 * @param {Array} lineB 向量B
 */
function getPoint (lineA, lineB) {

  const [[x1, y1], [x2, y2]] = lineA
  const [[x3, y3], [x4, y4]] = lineB


  // 求解两条直线的交点
  const x0 = _toFixed(((x1 * y2 - y1 * x2) * (x3 - x4)) - ((x3 * y4 - y3 * x4) * (x1 - x2))) / ((x1 - x2) * (y3 - y4) - (x3 - x4) * (y1 - y2))
  const y0 = _toFixed(((x1 * y2 - y1 * x2) * (y3 - y4)) - ((x3 * y4 - y3 * x4) * (y1 - y2))) / ((x1 - x2) * (y3 - y4) - (x3 - x4) * (y1 - y2))

  // console.log(x0,y0);

  let res = null

  // 判断点在不在线上第三个参数固定了线段起点不可能设置为和其他线段交点，实际上排除了同一个点作为起点和终点被多次添加交点
  if (pointIsOnLine([x0, y0], lineA, true) && pointIsOnLine([x0, y0], lineB, true)) {
    const normal = getNormal(lineA, lineB)
    res = { _p: [x0, y0], normal }
  };

  // console.log(res);


  return res


}
```



求解交点的过程中，需要满足交点要在两个线段上，才能算是交点，为了避免端点重复添加的问题，这里把起点没有算在线段内

```javascript
/**
 * 判断点在不在线上
 * @param {Array} point [x,y]
 * @param {Array2} line  [[x,y],[x,y]]
 * @param {Boolean} ignoreStart 忽略起点在起点上的情况
 * @param {Boolean} needOnArea 是否需要必须在线段内
 * 
 */
function pointIsOnLine (point, line, ignoreStart = false, needOnArea = true) {

  const [x0, y0] = point
  const [[x1, y1], [x2, y2]] = line

  // 点为向量line 的起点时，该计算因x0，x1相等，y0 = y1 所以不能判断在不在线上
  // 计算通过计算点和线段起点的斜率，和线段斜率是否相等
  let onLine = _toFixed((y0 - y1) / (x0 - x1)) === _toFixed((y2 - y1) / (x2 - x1))

  // 实际上在计算时有时候需要起点不算在内，终点算在内，能避免重复取点问题
  // 引入ignoreStart，为true时，起点算在内，为false 时，起点不算在向量上，默认不算，避免重复添加
  if (!ignoreStart && x0 == x1 && y0 == y1) { onLine = true }

  // 判断在不在区域内，不在的话false
  const onArea = x0 >= Math.min(x1, x2) && x0 <= Math.max(x1, x2) && y0 >= Math.min(y1, y2) && y0 <= Math.max(y1, y2)

  // 如果需要必须在线段上，需同时满足online&&onArea，否则返回在不在直线上
  return needOnArea ? onLine && onArea : onLine
}
```



然后执行`Intersection`方法，就能得到求解的交集。

脑力有限，还不能处理岛式交集，复杂情况也有很多限制，共边不交的形状，会拿到共边线段，需要通过索引判断是否为连续索引区分是不是交集多边形。

该方法历时一天，实现了简单重叠多边形求交求并的实现，但是后续的边界情况逻辑复杂。

进一步思考，通过碰撞检测方法可能会能够实现更加完整的实现。

so ！！！ do it next time。