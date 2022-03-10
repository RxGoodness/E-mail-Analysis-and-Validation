import FileTree from "./fileTree";
export function createFileTree(input) {
  const fileTree = new FileTree();
  for (const inputNode of input) {
    const parentNode = inputNode.parentId
      ? fileTree.findNodeById(inputNode.parentId)
      : null;

    fileTree.createNode(
      inputNode.id,
      inputNode.name,
      inputNode.type,
      parentNode
    );
  }

  for (const inputNode of input) {
    if (!inputNode.parentId) {
      continue;
    }
    const node = fileTree.findNodeById(inputNode.id);
    const parentNode = fileTree.findNodeById(inputNode.parentId);
    parentNode.addChild(node);
  }

  for (const inputNode of input) {
    if (!inputNode.parentId) {
      continue;
    }
    const node = fileTree.findNodeById(inputNode.id);
    const parentNode = fileTree.findNodeById(inputNode.parentId);
    parentNode.addChild(node);
  }

  return fileTree;
}
