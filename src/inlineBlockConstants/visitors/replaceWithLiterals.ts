import { NodePath, Visitor } from '@babel/traverse';
import {
  booleanLiteral,
  Identifier,
  isIdentifier,
  numericLiteral,
  stringLiteral,
} from '@babel/types';

import { InlineConstantsState } from '../types/InlineConstantsState';

export const REPLACE_WITH_LITERALS: Visitor<InlineConstantsState> = {
  Identifier: function (
    path: NodePath<Identifier>,
    state: InlineConstantsState,
  ) {
    const name = path.node.name;
    if (path.key === 'id') return;
    const variable = state.variables.find((v) => v.name === name);
    if (!variable) return;
    switch (typeof variable.value) {
      case 'string':
        path.replaceWith(stringLiteral(variable.value.replace(/\"/g, '')));
        break;
      case 'number':
        //Avoid 5.toString() calls, convert it to "5".toString()
        if (path.parentPath.isMemberExpression() && path.key === 'object') {
          path.replaceWith(stringLiteral(variable.value.toString()));
          break;
        }
        path.replaceWith(numericLiteral(variable.value));
        break;
      case 'boolean':
        path.replaceWith(booleanLiteral(variable.value));
        break;
    }
  },
};
