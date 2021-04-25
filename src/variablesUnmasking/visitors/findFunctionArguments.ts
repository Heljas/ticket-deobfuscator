import { NodePath, Visitor } from "@babel/traverse";
import { identifier, MemberExpression } from "@babel/types";
import { getMaskedVariableIndex } from "../getMaskedVariableIndex";
import { VariablesMaskingState } from "../types/VariablesMaskingState";

export const FIND_FUNCTION_ARGUMENTS: Visitor = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: VariablesMaskingState
  ) {
    const object = path.get("id") as NodePath;
    if (!object.isMemberExpression()) return;
    const index = getMaskedVariableIndex(object, state);
    if (index === -1) return;
    if (index !== 0) {
      state.detectedErrors = true;
      console.error(
        `Detected ${path.toString()} with index ${index}. At this point only packed arguments should be left!`
      );
      return;
    }
    // const argument;
    const maskedVariable = state.maskedVariables.find((m) => m.index === index);
    if (!maskedVariable) return;
    path.replaceWith(identifier(maskedVariable.name));
  },
};
