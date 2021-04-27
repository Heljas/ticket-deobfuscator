import { NodePath, Scope } from '@babel/traverse';
import { VariableDeclarator } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { MaskedVariable } from './MaskedVariable';

export interface VariablesMaskingState {
  global: GlobalState;
  maskingDeclarator: NodePath<VariableDeclarator> | null;
  declaratorName: string;
  maskedVariables: MaskedVariable[];
  scopeUid: number;
  arguments: MaskedVariable[];
  globalScope: Scope;
  detectedErrors: boolean;
}
