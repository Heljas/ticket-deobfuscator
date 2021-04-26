import { NodePath } from '@babel/traverse';

export interface ReassignedVariable {
  name: string;
  value: string | number;
  paths: NodePath[];
}
