import { NodePath } from '@babel/traverse';
import { Expression } from '@babel/types';

export interface ReassignedVariable {
  name: string;
  paths: NodePath[];
  value: Expression | null;
}
