import { NodePath, Visitor } from '@babel/traverse';
import { isIdentifier, VariableDeclarator } from '@babel/types';
import { VariablesMaskingState } from '../types/VariablesMaskingState';

export const FIND_MASKING_DECLARATOR: Visitor<VariablesMaskingState> = {
  VariableDeclarator: function (
    path: NodePath<VariableDeclarator>,
    state: VariablesMaskingState,
  ) {
    const scopeUid = path.getFunctionParent()?.node.start;
    if (scopeUid !== state.scopeUid) return;
    if (state.maskingDeclarator && state.declaratorName) return;
    const init = path.get('init') as NodePath;
    if (!init.isArrayExpression() || init.node.elements.length !== 1) return;
    const [arrayIdentifier] = init.node.elements;
    if (!isIdentifier(arrayIdentifier, { name: 'arguments' })) return;
    const declaratorIdentifier = path.get('id') as NodePath;
    if (!declaratorIdentifier.isIdentifier()) return;
    state.maskingDeclarator = path;
    state.declaratorName = declaratorIdentifier.node.name;
  },
};
