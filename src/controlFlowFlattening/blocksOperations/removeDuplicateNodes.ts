import * as t from '@babel/types';
import { ObfuscatedBlock } from '../obfuscatedBlock';

export function removeDuplicateNodes(
  this: ObfuscatedBlock,
  node: t.IfStatement,
) {
  if (!node.alternate || !t.isBlockStatement(node.alternate)) return;
  if (node.alternate.body.length === 0 || !t.isBlockStatement(node.consequent))
    return;

  const reversedAlternate = [...node.alternate.body].reverse();
  const reversedConsequent = [...node.consequent.body].reverse();
  const duplicateNodes: t.Statement[] = [];

  for (
    let i = 0;
    i < reversedAlternate.length && i < reversedConsequent.length;
    i++
  ) {
    if (!t.isNodesEquivalent(reversedAlternate[i], reversedConsequent[i]))
      break;
    duplicateNodes.push(reversedAlternate[i]);
  }

  duplicateNodes.reverse();

  if (duplicateNodes.length === 0) return;

  node.alternate.body = node.alternate.body.slice(0, -duplicateNodes.length);
  node.consequent.body = node.consequent.body.slice(0, -duplicateNodes.length);
  return duplicateNodes;
}
