import { NodePath, Visitor } from '@babel/traverse';
import { identifier, MemberExpression } from '@babel/types';
import { generateIdentifier } from '../generateIdentifier';
import { getMaskedVariableIndex } from '../getMaskedVariableIndex';
import { VariablesMaskingState } from '../types/VariablesMaskingState';

export const REPLACE_WITH_VARIABLES: Visitor<VariablesMaskingState> = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState,
  ) {
    const index = getMaskedVariableIndex(path, state);
    if (index < 1) return;
    const maskedVariable = state.maskedVariables.find((m) => m.index === index);
    if (!maskedVariable) {
      if (path.key === 'right') {
        path.replaceWith(identifier('undefined'));
      } else {
        state.global.errors.push(
          `[replaceWithVariables.ts] Couldn't replace ${path.toString()} with undefined - key is ${
            path.key
          }. Something went wrong earlier!`,
        );
      }
      return;
    }
    path.replaceWith(identifier(maskedVariable.name));
  },
};
