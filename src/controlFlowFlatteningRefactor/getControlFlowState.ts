import { NodePath } from '@babel/traverse';
import {
  BinaryExpression,
  Expression,
  ForStatement,
  isNodesEquivalent,
} from '@babel/types';
import { getPrevSibling } from '../common/babelExtensions';
import { ControlFlowConfig } from './types/ControlFlowConfig';

export const getControlFlowConfig = (
  path: NodePath<ForStatement>,
): ControlFlowConfig | null => {
  if (!path.isForStatement({ init: null, update: null })) return null;

  const test = path.get('test');
  if (!test.isBinaryExpression({ operator: '!==' })) return null;

  const forStatementBody = path.get('body');
  if (!forStatementBody.isBlockStatement()) return null;

  const [firstStatement] = forStatementBody.get('body');
  if (!firstStatement.isSwitchStatement()) return null;

  const discriminant = firstStatement.get('discriminant');

  const endExpression = getEndExpression(discriminant, test);
  if (!endExpression || !endExpression.isExpression()) return null;

  const stateHolderInitializer = getPrevSibling(path);
  const startExpression = getStartExpression(
    discriminant,
    stateHolderInitializer,
  );
  if (!startExpression || !startExpression.isExpression()) return null;

  return {
    switchStatement: firstStatement,
    stateHolderInitializer,
    startExpression,
    endExpression,
  };
};

const getStartExpression = (
  discriminant: NodePath<Expression>,
  sibling: NodePath,
) => {
  if (sibling.isVariableDeclaration()) {
    const [declarator] = sibling.get('declarations');
    const id = declarator.get('id');
    if (!isNodesEquivalent(discriminant.node, id.node)) return null;
    return declarator.get('init');
  }

  if (sibling.isExpressionStatement()) {
    console.log(sibling.toString());
    const expression = sibling.get('expression');
    if (!expression.isAssignmentExpression()) return null;
    const left = expression.get('left');
    if (!isNodesEquivalent(discriminant.node, left.node)) return null;
    return expression.get('right');
  }

  return null;
};

const getEndExpression = (
  discriminant: NodePath<Expression>,
  test: NodePath<BinaryExpression>,
) => {
  if (isNodesEquivalent(discriminant.node, test.node.left)) {
    return test.get('right');
  }

  if (isNodesEquivalent(discriminant.node, test.node.right)) {
    return test.get('left');
  }

  return null;
};
