import { NodePath, Scope } from '@babel/traverse';
import { AssignmentExpression } from '@babel/types';

export interface StringGroup {
  scope: Scope;
  mergedValue: string;
}
