import { NodePath, Scope, Visitor } from "@babel/traverse";
import {
  identifier,
  MemberExpression,
  variableDeclaration,
  variableDeclarator,
} from "@babel/types";
import { getMaskedVariableIndex } from "../getMaskedVariableIndex";
import { generateIdentifier } from "../generateIdentifier";
import { VariablesMaskingState } from "../types/VariablesMaskingState";

export const GENERATE_VARIABLES_DECLARATIONS: Visitor = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState
  ) {
    const index = getMaskedVariableIndex(path, state);
    if (index === -1) return;
    const maskedVariable = state.maskedVariables.find((m) => m.index === index);
    if (maskedVariable) return; //Already created variable declaration
    const parent = path.parentPath;
    if (!parent.isAssignmentExpression({ operator: "=" })) return;
    const name = generateIdentifier(state.globalScope);
    state.maskedVariables.push({
      name,
      index,
    });
    const initialValue = parent.node.right;
    const id = identifier(name);
    const declarator = variableDeclarator(id, initialValue);
    const declaration = variableDeclaration("var", [declarator]);
    if (!parent.parentPath.isForStatement()) {
      parent.insertAfter(declaration);
      parent.remove();
    } else {
      parent.replaceWith(declaration);
    }
  },
};
