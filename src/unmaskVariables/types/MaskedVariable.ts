import { NodePath } from '@babel/traverse';
import { MemberExpression } from '@babel/types';

export interface MaskedVariable {
  name: string;
  index: number;
  references: NodePath<MemberExpression>[];
}
