import { NodePath } from '@babel/traverse';
import { Expression, Node, SwitchStatement } from '@babel/types';

export interface ControlFlowConfig {
  stateHolderInitializer?: NodePath<Node>;
  startExpression: NodePath<Expression>;
  endExpression: NodePath<Expression>;
  switchStatement: NodePath<SwitchStatement>;
}
