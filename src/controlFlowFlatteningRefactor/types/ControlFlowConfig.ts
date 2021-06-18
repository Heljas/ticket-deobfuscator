import { NodePath } from '@babel/traverse';
import { Expression, PrivateName, SwitchStatement } from '@babel/types';

export interface ControlFlowConfig {
  discriminant: NodePath<Expression>;
  startExpression: NodePath<Expression>;
  endExpression: NodePath<Expression>;
  switchStatement: NodePath<SwitchStatement>;
}
