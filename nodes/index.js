class Node {
  constructor() {
    this.nodes = [];
  }

  handleNodes(node) {
    const index = this.nodes.indexOf(node);
    if (index !== -1) {
      console.log("found");
      this.nodes.slice(0, index);
    } else {
      console.log("not found");
      this.nodes.push(node);
    }
    console.log("Log: Nodes -> setNodes -> this.nodes", this.nodes);
  }

  replaceNodes(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      handleNodes(nodes[i]);
    }
  }
}
module.exports = Node;
