import { NodePath, Visitor } from '@babel/traverse';
import {
  isBooleanLiteral,
  isIdentifier,
  isNumericLiteral,
  isStringLiteral,
  isUnaryExpression,
  VariableDeclarator,
} from '@babel/types';

import { InlineConstantsState } from '../types/InlineConstantsState';

export const FIND_DECLARATORS: Visitor<InlineConstantsState> = {
  VariableDeclarator: function (
    path: NodePath<VariableDeclarator>,
    state: InlineConstantsState,
  ) {
    if (!isIdentifier(path.node.id)) return;

    const init = path.node.init;
    if (
      !isStringLiteral(init) &&
      !isNumericLiteral(init) &&
      !isBooleanLiteral(init) &&
      !isUnaryExpression(init, { operator: '-' })
    )
      return;

    const name = path.node.id.name;
    const binding = state.constantBindings.find((b) => b === name);
    if (!binding) return;
    const initPath = path.get('init');
    if (isUnaryExpression(initPath.node, { operator: '-' })) {
      const argument = initPath.get('argument');
      if (!isNumericLiteral(argument)) return;
    }
    try {
      const value = isStringLiteral(init)
        ? init.value
        : eval(initPath.toString());

      if (!path.parentPath.isVariableDeclaration()) return;
      state.variables.push({ name, value, declaration: path.parentPath });
    } catch {
      state.global.errors.push('[findDeclarators.ts] Unexpected error!');
      state.unexpectedError = true;
    }
  },
};
