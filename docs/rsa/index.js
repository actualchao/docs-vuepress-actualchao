
//前序遍历得到的字符串

function createBitree (string) {
  let strArr = string.split('');

  function BiNode (val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }

  var newTree = new BiNode('#');

  function createNode (biTree) {
    if (strArr.length == 0) return;
    let str = strArr.shift();
    if (str == '#') return;
    biTree.val = str;
    if (strArr[0] != '#') {
      biTree.left = new BiNode('#')
    }
    // 前序递归创建,可调整中序后序
    createNode(biTree.left);
    if (strArr[0] != '#') {
      biTree.right = new BiNode('#')
    }
    createNode(biTree.right);
  }
  createNode(newTree)
}

createBitree('AB#D##C##')