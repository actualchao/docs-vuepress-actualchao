---
title: Array.sort 算法原理
sidebarDepth: 5
---




## javascript Array.sort 原理实现

- [v8 引擎排序算法源码(710 line)](https://link.zhihu.com/?target=https%3A//github.com/v8/v8/blob/ad82a40509c5b5b4680d4299c8f08d6c6d31af3c/src/js/array.js)
- [js sort原理](https://zhuanlan.zhihu.com/p/33626637)
- [十大经典算法](https://www.cnblogs.com/onepixel/articles/7674659.html)


js 提供了 `sort` 方法，方便对数组进行排序，然而不同引擎对 `js` 的 `sort` 方法解析可能存在差异，本文基于 `v8` 引擎对排序 `sort` 的实现，分析其使用的 `插入排序` 和 `快速排序` 。

本文不致力于分析 v8 引擎源码，仅分析内部使用的两种算法

-----------------------
### 插入排序

下面是一张动图演示。

<div align="center">
   <img style="width:60%;" loading="lazy"  src="https://images2017.cnblogs.com/blog/849589/201710/849589-20171015225645277-1151100000.gif" alt="插入排序动图" />
</div>

#### 基本思想
从左往右遍历数组，每次将遍历的项插入到前面的已经排序好的有序数组中，通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。

#### 算法步骤
  1. 默认第一项已经排序
  2. 从数组第二项开始遍历，取出当前遍历的新元素。
  3. 从当前项前一个往前查找，如果查找的项比新元素大，就向后移动一位
  4. 找到新元素在有序序列中的位置（查找的项比新元素小，那新元素因为位于该元素后，也就是空出的空位中）放入新元素
  5. 继续遍历，重复2-4.


#### 代码实现
```javascript
function InsertionSort(arr, from = 0, to = arr.length) {
  // 从数组第二项遍历
  for (var i = from + 1; i < to; i++) {
    // 取出新元素
    var element = arr[i];
    // 从新元素位置向前查找
    for (var j = i - 1; j >= from; j--) {
      // 缓存查找的项
      var tmp = arr[j];
      // 计算是否是需要插入的位置
      // 此处可修改插入逻辑，正序倒序
      var order = tmp - element;
      if (order > 0) {
        // 不是插入位置，查找项后移
        arr[j + 1] = tmp;
      } else {
        // 是插入位置，退出循环，插入元素
        break;
      }
    }
    // 退出循环插入元素
    arr[j + 1] = element;
  }
};
```


### 快速排序
 
快速排序，又称划分交换排序。以分治法为策略实现的快速排序算法。这里主要实现 in-place 思想的快速排序

#### 算法思想
快速排序的基本思想：通过一趟排序将待排记录分隔成独立的两部分，其中一部分记录的关键字均比另一部分的关键字小，则可分别对这两部分记录继续进行排序，以达到整个序列有序。

#### 算法步骤
1. 选基准：在数据结构中选择一个元素作为基准(pivot)
2. 划分区：参照基准元素值的大小，划分无序区，所有小于基准元素的数据放入一个区间，所有大于基准元素的数据放入另一区间，分区操作结束后，基准元素所处的位置就是最终排序后它应该所处的位置
3. 递归：对初次划分出来的两个无序区间，递归调用第 1步和第 2步的算法，直到所有无序区间都只剩下一个元素为止。




#### 代码实现

这里根据分区操作的实现方法分为下面两种实现方式

-------------------

- ##### 挖坑把基准元素往中间夹逼方式
  1. 取出第一项作为基准元素（可理解为第一项空出坑位）
  2. 从后往前找小于基准元素的元素，填入坑位，空出后面的坑位。
  3. 从前往后找大于基准元素的元素，填入后方空位，空出前面坑位
  4. 重复2-3
  5. 当位置正好到中间时结束，把基准元素放入最后空出的空位


```javascript
/**
 * https://www.runoob.com/w3cnote/quick-sort.html
 * 快速排序算法
 * @param {*} arr
 * @param {*} left
 * @param {*} right
 */

function quickSort(arr, left = 0, right = arr.length - 1) {

  function partition(arr, left, right) {
    const povit = arr[left];
    while (left < right) {
      while (left < right && arr[right] >= povit) {
        right--;
      }
      if (left < right) {
        arr[left] = arr[right]; //将s[right]填到s[left]中，s[right]就形成了一个新的坑
        left++;
      }

      while (left < right && arr[left] < povit) {
        left++;
      }

      if (left < right) {
        arr[right] = arr[left]; //将s[right]填到s[left]中，s[right]就形成了一个新的坑
        right--;
      }
    }

    arr[left] = povit;
    return left;
  }


  if (left < right) {
    // 分治
    const partitionIndex = partition(arr, left, right);
    quickSort(arr, left, partitionIndex);
    quickSort(arr, partitionIndex + 1, right);
  }
  return arr;
}
```
----------------



- ##### 顺序遍历分区思想
  1. 取最右边的元素为基准
  2. 记录已经比对后小于基准元素的数组最后位置
  3. 从左向右遍历数组
  4. 小于基准则移动到比对后的最后位置，并更新最后位置
  5. 遍历完成把基准元素添加到最后位置之后。

```javascript
function quickSort1(arr) {
  // 交换
  function swap(arr, a, b) {
    const temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
  }

  // 分区
  function partition(arr, left, right) {
    /**
     * 开始时不知最终pivot的存放位置，可以先将pivot交换到后面去
     * 这里直接定义最右边的元素为基准
     */
    const pivot = arr[right];
    /**
     * 存放小于pivot的元素时，是紧挨着上一元素的，否则空隙里存放的可能是大于pivot的元素，
     * 故声明一个storeIndex变量，并初始化为left来依次紧挨着存放小于pivot的元素。
     */
    let storeIndex = left;
    for (let i = left; i < right; i++) {
      if (arr[i] < pivot) {
        /**
         * 遍历数组，找到小于的pivot的元素，（大于pivot的元素会跳过）
         * 将循环i次时得到的元素，通过swap交换放到storeIndex处，
         * 并对storeIndex递增1，表示下一个可能要交换的位置
         */
        swap(arr, storeIndex, i);
        storeIndex++;
      }
    }
    // 最后： 将pivot交换到storeIndex处，基准元素放置到最终正确位置上
    swap(arr, right, storeIndex);
    return storeIndex;
  }

  function sort(arr, left, right) {
    if (left > right) return;

    const storeIndex = partition(arr, left, right);
    sort(arr, left, storeIndex - 1);
    sort(arr, storeIndex + 1, right);
  }

  sort(arr, 0, arr.length - 1);
  return arr;
}
```