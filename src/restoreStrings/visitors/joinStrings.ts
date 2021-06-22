import { NodePath, Visitor } from '@babel/traverse';
import { Scopable, stringLiteral } from '@babel/types';
import { StringGroup } from '../types/StringGroup';

export const JOIN_STRINGS: Visitor = {
  Scopable: function (path: NodePath<Scopable>) {
    if (path.parentPath?.isFunctionParent()) return;
    Object.values(path.scope.bindings).forEach((binding) => {
      if (binding.kind !== 'var') return;
      if (!binding.path.isVariableDeclarator()) return;
      const initialPath = binding.path.get('init');

      if (initialPath.node && !initialPath.isStringLiteral()) return;
      const initialValue = initialPath.isStringLiteral()
        ? initialPath.node.value
        : '';

      const groups: StringGroup[] = [];
      for (const violation of binding.constantViolations) {
        if (!violation.isAssignmentExpression()) return;
        const valuePath = violation.get('right');
        if (!valuePath.isStringLiteral()) return;
        let group = groups.find((g) => g.scope === violation.scope);
        if (!group) {
          group = {
            scope: violation.scope,
            mergedValue: initialValue,
          };
          groups.push(group);
        }
        const operator = violation.node.operator;
        if (operator === '=') {
          group.mergedValue = valuePath.node.value;
        } else if (operator === '+=') {
          group.mergedValue += valuePath.node.value;
        }
      }
      if (groups.length === 0) return;
      const [baseGroup, ...otherGroups] = groups;
      const valuesMatch = otherGroups.every(
        (g) => g.mergedValue === baseGroup.mergedValue,
      );
      if (!valuesMatch) return;
      initialPath.replaceWith(stringLiteral(baseGroup.mergedValue));
      binding.constantViolations.forEach((v) =>
        v.getStatementParent()?.remove(),
      );
    });
  },
};
