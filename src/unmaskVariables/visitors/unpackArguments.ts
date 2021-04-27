import { NodePath, Visitor } from '@babel/traverse';
import { identifier, MemberExpression } from '@babel/types';
import { getMaskedVariableIndex } from '../getMaskedVariableIndex';
import { VariablesMaskingState } from '../types/VariablesMaskingState';

export const UNPACK_ARGUMENTS: Visitor = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState,
  ) {
    const object = path.get('object') as NodePath;
    if (!object.isMemberExpression()) return;
    const memberIndex = getMaskedVariableIndex(object, state);
    if (memberIndex === -1) return;
    if (memberIndex !== 0) {
      state.detectedErrors = true;
      state.global.errors.push(
        `[unpackArguments.ts] Detected ${path.toString()} with index ${memberIndex}. At this point only packed arguments should be left!`,
      );
      return;
    }
    const property = path.get('property') as NodePath;
    if (!property.isNumericLiteral()) {
      state.detectedErrors = true;
      state.global.errors.push(
        `[unpackArguments.ts] Detected ${path.toString()} which property is not number literal. At this point only packed arguments should be left!`,
      );
      return;
    }
    const argumentIndex = property.node.value;
    let maskedArgument = state.arguments.find((m) => m.index === argumentIndex);
    if (!maskedArgument) {
      maskedArgument = {
        name: `${state.declaratorName}_arg${argumentIndex + 1}`,
        index: argumentIndex,
      };
      state.arguments.push(maskedArgument);
    }
    path.replaceWith(identifier(maskedArgument.name));
  },
};
