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

export const FIND_MASKED_VARIABLES: Visitor<VariablesMaskingState> = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState,
  ) {
    const index = getMaskedVariableIndex(path, state);

    //* Expressions with index 0 are arguments
    if (index < 1) return;

    const maskedVariable = state.variables.find((m) => m.index === index);
    if (maskedVariable) {
      maskedVariable.paths.push(path);
      return;
    }

    const name = generateIdentifier(state.globalScope);
    state.variables.push({
      name,
      index,
      paths: [path],
    });
  },
};
