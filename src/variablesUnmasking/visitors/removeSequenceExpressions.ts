import { isNumericLiteral } from '@babel/types';
import { NodePath } from '@babel/traverse';

export const REMOVE_SEQUENCE_EXPRESSIONS = {
  SequenceExpression(path: NodePath) {
    if (!path.isSequenceExpression()) return;
    if (path.node.expressions.length !== 2) return;
    const [first, second] = path.node.expressions;
    if (!isNumericLiteral(first)) return;
    path.replaceWith(second);
  },
};
