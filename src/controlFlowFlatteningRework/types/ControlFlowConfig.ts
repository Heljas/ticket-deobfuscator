import { NodePath } from '@babel/traverse';
import { Expression, PrivateName, SwitchStatement } from '@babel/types';

export interface ControlFlowConfig {
  discriminant: NodePath<Expression>;
  initialValue: NodePath<Expression>;
  endValue: NodePath<Expression>;
  switchStatement: NodePath<SwitchStatement>;
}
