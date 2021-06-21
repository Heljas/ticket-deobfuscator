import { NodePath, Visitor } from '@babel/traverse';
import { Scopable } from '@babel/types';
import { getMergeableBindings } from '../../common/utils/getMergableBindings';

export const REMOVE_REASSIGNMENTS: Visitor = {
  Scopable: function (path: NodePath<Scopable>) {
    if (path.parentPath?.isFunctionParent()) return;

    const mergableBindings = getMergeableBindings(
      Object.values(path.scope.bindings),
    );
    mergableBindings.forEach(({ binding, lastLiteral, mergableViolations }) => {
      const bindingPath = binding.path;
      if (!bindingPath.isVariableDeclarator()) return;
      const init = bindingPath.get('init');
      init.replaceWith(lastLiteral);
      mergableViolations.forEach((v) => v.remove());
    });
  },
};
