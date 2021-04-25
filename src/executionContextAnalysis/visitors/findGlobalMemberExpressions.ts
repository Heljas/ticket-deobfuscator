import { NodePath, Visitor } from "@babel/traverse";
import { AssignmentExpression, memberExpression } from "@babel/types";
import { ExecutionContextState } from "../types/ExecutionContextState";
import {
  isAssignmentExpression,
  isMemberExpression,
  isStringLiteral,
  isNumericLiteral,
  isBooleanLiteral,
  isNullLiteral,
  isFunctionExpression,
  isIdentifier,
} from "@babel/types";

export const FIND_GLOBAL_MEMBER_EXPRESSIONS: Visitor = {
  AssignmentExpression: function (
    path: NodePath<AssignmentExpression>,
    state: ExecutionContextState
  ) {
    if (path.scope.block.type !== "Program") return;
    if (!isAssignmentExpression(path.node, { operator: "=" })) return;
    if (!isMemberExpression(path.node.left)) return;

    const memberExpression = path.node.left;
    if (!isIdentifier(memberExpression.object)) return;

    if (
      !isIdentifier(memberExpression.property) &&
      !isNumericLiteral(memberExpression.property)
    )
      return;

    const right = path.node.right;
    if (
      !isStringLiteral(right) &&
      !isNumericLiteral(right) &&
      !isBooleanLiteral(right) &&
      !isNullLiteral(right) &&
      !isFunctionExpression(right)
    )
      return;

    const objectName = memberExpression.object.name;
    const property = isNumericLiteral(memberExpression.property)
      ? memberExpression.property.value
      : memberExpression.property.name;

    if (isFunctionExpression(right)) {
      if (typeof property !== "string") return;
      state.stringsEncryptFunctions.add({
        objectName,
        property,
      });
    } else {
      if (isNullLiteral(right)) {
        state.globalMemberExpressionsPrimitives.add({
          objectName,
          property,
          value: null,
        });
        return;
      }

      const value = right.value;
      state.globalMemberExpressionsPrimitives.add({
        objectName,
        property,
        value,
      });
    }
  },
};
