import { NodePath, Visitor } from '@babel/traverse';
import { identifier, MemberExpression } from '@babel/types';
import { generateIdentifier } from '../generateIdentifier';
import { getMaskedVariableIndex } from '../getMaskedVariableIndex';
import { VariablesMaskingState } from '../types/VariablesMaskingState';

export const REPLACE_WITH_VARIABLES: Visitor = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState,
  ) {
    const index = getMaskedVariableIndex(path, state);
    if (index < 1) return;
    const maskedVariable = state.maskedVariables.find((m) => m.index === index);
    if (!maskedVariable) {
      if (path.key !== 'object') {
        path.replaceWith(identifier('undefined'));
      } else {
        console.error(
          `Couldn't replace ${path.toString()} with undefined - key is object. Something went wrong earlier!`,
        );
      }
      return;
    }
    path.replaceWith(identifier(maskedVariable.name));
  },
};
