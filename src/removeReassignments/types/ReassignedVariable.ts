import { NodePath } from '@babel/traverse';
import { Expression } from '@babel/types';

export interface ReassignedVariable {
  name: string;
  value: Expression;
  paths: NodePath[];
}
