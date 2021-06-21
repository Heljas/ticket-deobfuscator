import { Binding, NodePath } from '@babel/traverse';
import { AssignmentExpression, Literal } from '@babel/types';
import { MergableBinding } from '../types/MergableBinding';

export const getMergeableBindings = (
  bindings: Binding[],
  operators = ['='],
) => {
  const mergable: MergableBinding[] = [];
  for (const binding of bindings) {
    if (!binding.referenced) continue;
    const [firstReference] = binding.referencePaths;
    const firstReferencePosition = firstReference.node.start;
    if (!firstReferencePosition) continue;

    const mergableViolations: NodePath<AssignmentExpression>[] = [];
    let lastLiteral: NodePath<Literal> | null = null;

    for (const violation of binding.constantViolations) {
      if (
        !violation.node.start ||
        violation.node.start >= firstReferencePosition
      )
        break;

      if (violation.scope !== binding.path.scope) break;
      if (!violation.isAssignmentExpression()) break;
      if (!operators.includes(violation.node.operator)) break;

      const value = violation.get('right');
      if (!value.isLiteral()) break;
      mergableViolations.push(violation);
      lastLiteral = value;
    }
    if (mergableViolations.length == 0 || !lastLiteral) continue;
    mergable.push({
      binding,
      mergableViolations,
      lastLiteral,
    });
  }
  return mergable;
};
