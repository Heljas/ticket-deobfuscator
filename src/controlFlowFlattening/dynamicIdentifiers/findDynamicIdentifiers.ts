import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { ObfuscatedBlock } from "../obfuscatedBlock";

export function addToDynamicIdentifiers(this: ObfuscatedBlock, name: string) {
  if (this.dynamicIdentifiers.some(i => i.name === name)) return;

  this.dynamicIdentifiers.push({
    name,
    value: null
  });
}

export const FIND_DYNAMIC_IDENTIFIERS = {
  AssignmentExpression(path: NodePath, state: ObfuscatedBlock) {
    if (!t.isAssignmentExpression(path.node, { operator: "=" })) return;
    if (
      !t.isIdentifier(path.node.left, {
        name: state.discriminant
      })
    )
      return;

    const rightNode = path.get("right") as NodePath;
    if (!t.isConditionalExpression(rightNode)) return;
    const testExpression = rightNode.get("test") as NodePath;
    if (!t.isBinaryExpression(testExpression.node)) return;
    if (testExpression.node.operator !== "===" && testExpression.node.operator !== "!==") return;

    const callExpression = testExpression.get("left") as NodePath;
    if (!t.isCallExpression(callExpression)) return;

    const right = testExpression.get("right") as NodePath;
    if (t.isIdentifier(right.node)) {
      state.addToDynamicIdentifiers(right.node.name);
    }

    const args = callExpression.get("arguments") as NodePath[];
    args.forEach(arg => {
      arg.traverse(
        {
          MemberExpression(path) {
            if (!t.isMemberExpression(path)) return;
            const object = path.get("object") as NodePath;
            const property = path.get("property") as NodePath;
            if (
              !t.isIdentifier(property.node, {
                name: "toString"
              })
            )
              return;
            if (!t.isIdentifier(object.node)) return;
            state.addToDynamicIdentifiers(object.node.name);
          }
        },
        { state }
      );
    });
  }
};
