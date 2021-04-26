import { NodePath } from '@babel/traverse';
import { ExpressionStatement } from '@babel/types';

export interface StringPart {
  path: NodePath<ExpressionStatement>;
  value: string;
}
