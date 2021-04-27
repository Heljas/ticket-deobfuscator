import { NodePath, Scope, Visitor } from '@babel/traverse';
import {
  identifier,
  MemberExpression,
  variableDeclaration,
  variableDeclarator,
} from '@babel/types';
import { getMaskedVariableIndex } from '../getMaskedVariableIndex';
import { generateIdentifier } from '../generateIdentifier';
import { VariablesMaskingState } from '../types/VariablesMaskingState';

export const GENERATE_VARIABLES_DECLARATIONS: Visitor = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState,
  ) {
    const index = getMaskedVariableIndex(path, state);
    if (index === -1) return;
    const maskedVariable = state.maskedVariables.find((m) => m.index === index);
    if (maskedVariable) return; //Already created variable declaration
    const parent = path.parentPath;

    //Make sure we are on the left side of the assignment expression
    if (
      parent.isAssignmentExpression({ operator: '=' }) &&
      path.key === 'left'
    ) {
      handleAssignmentExpression(path, state, index);
    } else if (parent.isForOfStatement() || parent.isForInStatement()) {
      handleForLoops(path, state, index);
    }
  },
};

function handleAssignmentExpression(
  path: NodePath<MemberExpression>,
  state: VariablesMaskingState,
  index: number,
) {
  const parent = path.parentPath;
  if (!parent.isAssignmentExpression()) {
    return;
  }
  const outerPath = parent.parentPath;
  /*
      ExpressionStatement/ForStatement (outerPath)
        AssignmentExpression
          MemberExpression <- we are here
  */

  if (!outerPath.isExpressionStatement() && !outerPath.isForStatement()) {
    return;
  }

  const name = generateIdentifier(state.globalScope);
  state.maskedVariables.push({
    name,
    index,
  });
  const initialValue = parent.node.right;
  const id = identifier(name);
  const declarator = variableDeclarator(id, initialValue);
  const declaration = variableDeclaration('var', [declarator]);

  if (outerPath.isExpressionStatement()) {
    outerPath.replaceWith(declaration);
  } else {
    //outerPath is ForStatement, we only need to replace AssignmentExpression
    parent.replaceWith(declaration);
  }
}

function handleForLoops(
  path: NodePath<MemberExpression>,
  state: VariablesMaskingState,
  index: number,
) {
  const name = generateIdentifier(state.globalScope);
  state.maskedVariables.push({
    name,
    index,
  });
  const id = identifier(name);
  const declarator = variableDeclarator(id);
  const declaration = variableDeclaration('const', [declarator]);
  path.replaceWith(declaration);
}
