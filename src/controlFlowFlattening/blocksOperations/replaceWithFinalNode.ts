import * as t from '@babel/types';
import { ObfuscatedBlock } from '../obfuscatedBlock';
export function replaceWithFinalNode(this: ObfuscatedBlock) {
  if (this.exception) {
    //path.addComment("Log", "call stack", true);
    return;
  }
  //Merge all blocks
  const currentStep = this.getCurrentStep();
  while (currentStep.nodes.length > 1) {
    this.mergeBlocks();
  }
  const [finalNode] = currentStep.nodes;
  if (!t.isBlockStatement(finalNode)) return;

  if (!finalNode || !this.discriminantDeclarator) return;
  this.path.replaceWithMultiple([...finalNode.body]);
  this.discriminantDeclarator.remove();
}
