import { NodePath, Visitor } from '@babel/traverse';
import { identifier, MemberExpression } from '@babel/types';
import { getMaskedVariableIndex } from '../getMaskedVariableIndex';
import { VariablesMaskingState } from '../types/VariablesMaskingState';

export const REPLACE_WITH_VARIABLES: Visitor = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState,
  ) {
    const index = getMaskedVariableIndex(path, state);
    if (index === -1) return;
    const maskedVariable = state.maskedVariables.find((m) => m.index === index);
    if (!maskedVariable) return;
    path.replaceWith(identifier(maskedVariable.name));
  },
};
