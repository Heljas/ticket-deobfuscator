import { NodePath } from '@babel/traverse';
import { Expression, PrivateName, SwitchStatement } from '@babel/types';

export interface ControlFlowConfig {
  discriminant: NodePath<Expression>;
  startTransition: NodePath<Expression>;
  endTransition: NodePath<Expression>;
  switchStatement: NodePath<SwitchStatement>;
}
