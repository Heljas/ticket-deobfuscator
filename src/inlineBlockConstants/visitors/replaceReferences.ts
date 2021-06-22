import { NodePath, Visitor } from '@babel/traverse';
import {
  booleanLiteral,
  Identifier,
  isIdentifier,
  numericLiteral,
  Scopable,
  stringLiteral,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';

export const REPLACE_REFERENCES: Visitor<GlobalState> = {
  Scopable(path: NodePath<Scopable>) {
    if (path.parentPath?.isFunctionParent()) return;

    for (const binding of Object.values(path.scope.bindings)) {
      if (binding.kind !== 'var' || !binding.constant) continue;
      const bindingPath = binding.path;
      if (!bindingPath.isVariableDeclarator()) continue;
      const init = bindingPath.get('init');
      if (!init.isLiteral()) continue;
      binding.referencePaths.forEach((ref) => {
        ref.replaceWith(init);
      });
      bindingPath.remove();
    }
  },
};
