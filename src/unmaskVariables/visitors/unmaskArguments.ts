import { NodePath, Visitor } from '@babel/traverse';
import { identifier, MemberExpression } from '@babel/types';
import { getMaskedVariableIndex } from '../getMaskedVariableIndex';
import { VariablesMaskingState } from '../types/VariablesMaskingState';

export const UNMASK_ARGUMENTS: Visitor<VariablesMaskingState> = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState,
  ) {
    const object = path.get('object') as NodePath;
    if (!object.isMemberExpression()) return;
    const memberIndex = getMaskedVariableIndex(object, state);
    if (memberIndex === -1) return;
    if (memberIndex !== 0) {
      throw new Error(
        `Detected ${path.toString()} with index ${memberIndex}. At this point only packed arguments should be left!`,
      );
    }
    const property = path.get('property') as NodePath;
    if (!property.isNumericLiteral()) {
      throw new Error(
        `Detected ${path.toString()} which property is not number literal. At this point only packed arguments should be left!`,
      );
    }
    const argumentIndex = property.node.value;
    let maskedArgument = state.arguments.find((m) => m.index === argumentIndex);
    if (!maskedArgument) {
      maskedArgument = {
        name: `${state.arrayName}_arg${argumentIndex + 1}`,
        index: argumentIndex,
      };
      state.arguments.push(maskedArgument);
    }
    path.replaceWith(identifier(maskedArgument.name));
  },
};
