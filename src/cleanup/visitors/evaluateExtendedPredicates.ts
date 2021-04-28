import { NodePath, Visitor } from '@babel/traverse';
import {
  BinaryExpression,
  booleanLiteral,
  MemberExpression,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';

const isPredicateExpression = (
  path: NodePath<MemberExpression>,
  state: GlobalState,
) => {
  let child = path.get('object') as NodePath;
  while (!child.isCallExpression() && child.node) {
    child = child.get('object') as NodePath;
  }
  if (!child.isCallExpression()) return false;
  const callee = child.get('callee');
  if (!callee.isMemberExpression()) return false;
  const object = callee.get('object');
  const property = callee.get('property');
  if (!property.isIdentifier() || !object.isIdentifier()) return false;
  const objectName = object.node.name;
  return state.executionContext.globalFunctions.has(objectName);
};

export const EVALUATE_EXTENDED_PREDICATES: Visitor<GlobalState> = {
  BinaryExpression: function (
    path: NodePath<BinaryExpression>,
    state: GlobalState,
  ) {
    const operators = ['===', '!==', '==', '!='];
    if (!operators.includes(path.node.operator)) return;
    const left = path.get('left') as NodePath;
    const right = path.get('right') as NodePath;
    if (!left.isMemberExpression() || !right.isMemberExpression()) return;
    if (
      !isPredicateExpression(left, state) ||
      !isPredicateExpression(right, state)
    ) {
      return;
    }
    const value = state.evaluator.run(path.toString(), 'boolean');
    if (typeof value !== 'boolean') return;
    console.log(`${path.toString()} -> ${value}`);
    path.replaceWith(booleanLiteral(value));
  },
};
