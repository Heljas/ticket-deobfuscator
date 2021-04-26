import { NodePath } from '@babel/traverse';
import { VariableDeclaration } from '@babel/types';

export interface ConstantVariable {
  name: string;
  value: number | boolean | string;
  declaration: NodePath<VariableDeclaration>;
}
