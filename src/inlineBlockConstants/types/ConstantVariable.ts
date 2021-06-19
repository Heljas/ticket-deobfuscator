import { NodePath } from '@babel/traverse';
import { Expression, VariableDeclarator } from '@babel/types';

export interface ConstantVariable {
  name: string;
  value: NodePath<Expression | null | undefined>;
  declarator: NodePath<VariableDeclarator>;
}
