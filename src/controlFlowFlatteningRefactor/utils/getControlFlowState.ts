import { NodePath } from '@babel/traverse';
import {
  BinaryExpression,
  Expression,
  ForStatement,
  isNodesEquivalent,
  SwitchStatement,
} from '@babel/types';
import { getPrevSibling } from '../../common/babelExtensions';
import { GlobalState } from '../../common/types/GlobalState';
import { ControlFlowConfig } from '../types/ControlFlowConfig';
import { Step } from '../types/Step';

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

  const endValue = getEndValue(discriminant, test);
  if (!endValue || !endValue.isExpression()) return null;

  const initialValue = getInitialValue(discriminant, getPrevSibling(path));
  if (!initialValue || !initialValue.isExpression()) return null;

  return {
    switchStatement: firstStatement,
    discriminant,
    startExpression: initialValue,
    endExpression: endValue,
  };
};

const getInitialValue = (
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

const getEndValue = (
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
