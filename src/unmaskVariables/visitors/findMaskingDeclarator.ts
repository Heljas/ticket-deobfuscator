import { NodePath, Visitor } from '@babel/traverse';
import { isIdentifier, VariableDeclarator } from '@babel/types';
import { VariablesMaskingState } from '../types/VariablesMaskingState';

export const FIND_MASKING_DECLARATOR: Visitor<VariablesMaskingState> = {
  VariableDeclarator: function (
    path: NodePath<VariableDeclarator>,
    state: VariablesMaskingState,
  ) {
    const functionParent = path.getFunctionParent();
    if (functionParent !== state.parent) return;
    if (state.argumentsDeclarator && state.arrayName) return;
    const init = path.get('init');
    if (!init.isArrayExpression() || init.node.elements.length !== 1) return;
    const [arrayIdentifier] = init.node.elements;
    if (!isIdentifier(arrayIdentifier, { name: 'arguments' })) return;
    const declaratorIdentifier = path.get('id');
    if (!declaratorIdentifier.isIdentifier()) return;
    state.argumentsDeclarator = path;
    state.arrayName = declaratorIdentifier.node.name;
  },
};
