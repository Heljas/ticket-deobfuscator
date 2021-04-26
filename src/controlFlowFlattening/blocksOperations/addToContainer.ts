import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { ObfuscatedBlock } from '../obfuscatedBlock';

export function addToContainer(this: ObfuscatedBlock) {
  const step = this.getCurrentStep();
  const [currentNode] = step.nodes;
  if (!step.caseNode) return;
  const paths = step.caseNode.get('consequent') as NodePath<t.Statement>[];
  for (let path of paths) {
    this.updateDynamicIdentifiers(path);

    const node = path.node;
    if (this.isDiscriminantAssignment(node) || this.hasDynamicIdentifiers(path)) continue;

    if (t.isBlockStatement(currentNode)) {
      currentNode.body.push(node);
      continue;
    }

    if (t.isIfStatement(currentNode)) {
      if (step.blocks[0].isConsequent) {
        (currentNode.consequent as t.BlockStatement).body.push(node);
      } else {
        (currentNode.alternate as t.BlockStatement).body.push(node);
      }
      continue;
    }

    if (t.isWhileStatement(currentNode)) {
      (currentNode.body as any).body.push(node);
      continue;
    }
  }
}
