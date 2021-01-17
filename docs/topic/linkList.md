---
title: 有序链表合并问题
---


## 构建有序链表

```javascript




/**
 * 构造函数  表示链表的一个节点
 * 
 */
class Node {
  constructor(val) {
    this.value = val;  //节点的数据
    this.next = null;  //下一个节点的地址
  }
}

/**
 * 构造链表完整结构,生成插入,添加等方法
 */

class LinkList {
  constructor(list) {
    if (list.length < 1) return null
    let current;
    this.head = current = new Node(list.shift())
    this.length = list.length
    while (list.length) {
      current.next = new Node(list.shift())
      current = current.next
    }
  }

  getNodeAt (posi) {
    if (posi < 0 || posi > this.length) return null

    let current = this.head;
    while (posi > 0) {
      current = current.next
      posi--
    }
    return current
  }

  insertAt (posi, val) {
    if (posi < 0 || posi > this.length) return false

    let current = this.getNodeAt(posi)
    const temp = current.next
    current.next = new Node(val)
    current.next.next = temp
    this.length++
    return true
  }

  append (val) {
    return this.getNodeAt(this.length).next = new Node(val)
  }

  removeAt (posi) {
    if (posi < 0 || posi > this.length) return false

    if (posi === 0) {
      this.head = this.head.next
      return true
    }

    this.getNodeAt(posi - 1).next = this.getNodeAt(posi).next
    return true
  }



}



// 合并两个正序链表
const list = new LinkList([1, 3, 5])
const list2 = new LinkList([2, 4])

function combine (listA, listB) {
  function unio (a, b) {
    if (!a) return b
    if (!b) return a
    let head

    if (a.value <= b.value) {
      head = a
      head.next = unio(a.next, b)
    } else {
      head = b
      head.next = unio(b.next, a)
    }

    return head
  }

  let list = new LinkList([1])
  list.length = listA.length + listB.length
  list.head = unio(listA.head, listB.head)
  return list
}




```