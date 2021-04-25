import { NodePath, Scope } from "@babel/traverse";
import { VariableDeclarator } from "@babel/types";
import { MaskedVariable } from "./MaskedVariable";

export interface VariablesMaskingState {
  maskingDeclarator: NodePath<VariableDeclarator> | null;
  declaratorName: string;
  maskedVariables: MaskedVariable[];
  scopeUid: number;
  arguments: MaskedVariable[];
  globalScope: Scope;
  detectedErrors: boolean;
}
