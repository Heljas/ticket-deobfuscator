import { NodePath, Visitor } from '@babel/traverse';
import { LogicalExpression } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';

export const CLEAN_LOGICAL_EXPRESSIONS: Visitor<GlobalState> = {
  LogicalExpression: function (path: NodePath<LogicalExpression>) {
    const left = path.get('left');
    const right = path.get('right');
    const operator = path.node.operator;
    if (operator != '||' && operator != '&&') return;
    if (!left.isBooleanLiteral() && !right.isBooleanLiteral()) return;

    let booleanValue: boolean;
    let otherSide: NodePath;

    if (left.isBooleanLiteral()) {
      booleanValue = left.node.value;
      otherSide = right;
    } else if (right.isBooleanLiteral()) {
      booleanValue = right.node.value;
      otherSide = left;
    } else {
      return;
    }

    if (operator === '&&' && !booleanValue) return;
    if (operator === '||' && booleanValue) return;
    path.replaceWith(otherSide);
  },
};
