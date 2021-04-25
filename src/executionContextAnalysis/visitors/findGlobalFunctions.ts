import { NodePath, Visitor } from '@babel/traverse';
import { FunctionDeclaration, isIdentifier } from '@babel/types';
import { ExecutionContextState } from '../types/ExecutionContextState';

export const FIND_GLOBAL_FUNCTIONS: Visitor = {
  FunctionDeclaration: function (path: NodePath<FunctionDeclaration>, state: ExecutionContextState) {
    if (path.parent.type !== 'Program') return;
    if (!isIdentifier(path.node.id)) return;
    state.globalFunctions.add(path.node.id.name);
  },
};
