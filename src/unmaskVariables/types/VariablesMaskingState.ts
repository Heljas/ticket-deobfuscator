import { NodePath, Scope } from '@babel/traverse';
import { FunctionParent, VariableDeclarator } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { MaskedArgument } from './MaskedArgument';
import { MaskedVariable } from './MaskedVariable';

export interface VariablesMaskingState {
  global: GlobalState;
  argumentsDeclarator: NodePath<VariableDeclarator> | null;
  arrayName: string;
  arguments: MaskedArgument[];
  variables: MaskedVariable[];
  parent: NodePath<FunctionParent>;
  globalScope: Scope;
  detectedErrors: boolean;
}
