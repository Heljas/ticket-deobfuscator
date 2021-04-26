import { NodePath, Visitor } from '@babel/traverse';
import {
  BinaryExpression,
  booleanLiteral,
  isBinaryExpression,
  isMemberExpression,
  isUnaryExpression,
  numericLiteral,
  stringLiteral,
  UnaryExpression,
} from '@babel/types';

function handler(path: NodePath) {
  const source = path.toString();

  try {
    const value = eval(source);
    if (typeof value === 'number') {
      path.replaceWith(numericLiteral(value));
    }
    if (typeof value === 'boolean') {
      path.replaceWith(booleanLiteral(value));
    }
    if (typeof value === 'string') {
      path.replaceWith(stringLiteral(value));
    }
  } catch (ex) {
    //Couldn't eval expression. It shouldn't be replaced.
  }
}

export const REPLACE_UNARY_AND_BINARY: Visitor = {
  BinaryExpression: function (path: NodePath<BinaryExpression>) {
    if (!isBinaryExpression(path.node)) return;
    if (isUnaryExpression(path.node.left, { operator: 'typeof' })) return;
    if (isMemberExpression(path.node.left)) return;
    handler(path);
  },
  UnaryExpression: function (path: NodePath<UnaryExpression>) {
    if (isUnaryExpression(path.node, { operator: 'typeof' })) return;
    handler(path);
  },
};
