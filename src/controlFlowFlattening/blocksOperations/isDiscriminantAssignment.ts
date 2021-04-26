import * as t from "@babel/types";
import { ObfuscatedBlock } from "../obfuscatedBlock";

export function isDiscriminantAssignment(this: ObfuscatedBlock, node: t.Node) {
  if (t.isBreakStatement(node)) return true;
  if (t.isExpressionStatement(node) && t.isAssignmentExpression(node.expression)) {
    if (t.isIdentifier(node.expression.left, { name: this.discriminant })) return true;
  }
  return false;
}
