import { Binding, NodePath } from '@babel/traverse';
import { AssignmentExpression, Literal } from '@babel/types';

export interface MergableBinding {
  binding: Binding;
  mergableViolations: NodePath<AssignmentExpression>[];
  lastLiteral: NodePath<Literal>;
}
