import * as t from "@babel/types";
import { ObfuscatedBlock } from "../obfuscatedBlock";

export function mergeBlocks(this: ObfuscatedBlock) {
  const currentStep = this.getCurrentStep();
  let [currentNode] = currentStep.nodes;

  const nodesToAdd: t.Statement[] = [currentNode];

  if (t.isIfStatement(currentNode)) {
    const duplicateNodes = this.removeDuplicateNodes(currentNode);
    if (duplicateNodes) nodesToAdd.push(...duplicateNodes);
    if (t.isBlockStatement(currentNode.alternate) && currentNode.alternate.body.length === 0) {
      currentNode.alternate = null;
    }
  }

  const [, nextBlock] = currentStep.blocks;
  const [, nextNode] = currentStep.nodes;
  console.log("[BLOCK MERGE]");
  if (t.isBlockStatement(nextNode)) {
    nextNode.body.push(...nodesToAdd);
  }

  if (t.isIfStatement(nextNode)) {
    if (nextBlock.isConsequent) {
      (nextNode.consequent as t.BlockStatement).body.push(...nodesToAdd);
    } else {
      (nextNode.alternate as t.BlockStatement).body.push(...nodesToAdd);
    }
  }

  if (t.isWhileStatement(nextNode) && t.isBlockStatement(nextNode.body)) {
    nextNode.body.body.push(...nodesToAdd);
  }

  currentStep.nodes = currentStep.nodes.slice(1);
  currentStep.blocks = currentStep.blocks.slice(1);
}
