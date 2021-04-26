import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';

export namespace CFF {
  export interface Block {
    endCase: string;
    condition: string;
    testNode: NodePath;
    isConsequent: boolean;
    dynamicIdentifiers: DynamicIdentifier[];
    isValidLoop: boolean;
  }

  export interface Step {
    case: string;
    blocks: Block[];
    visited: boolean;
    nodes: t.Statement[];
    isConsequent: boolean;
    caseNode: NodePath<t.SwitchCase> | null;
  }
  export interface DynamicIdentifier {
    name: string;
    value: number | null;
  }
  export interface State {
    discriminant: string;
    discriminantDeclarator: NodePath<t.VariableDeclarator> | null;
    initialValue: string;
    cases: NodePath<t.SwitchCase>[];
    steps: Step[];
    finalNode: t.BlockStatement | null;
    endValue: string;
    dynamicIdentifiers: DynamicIdentifier[];
    dynamicIdentifiersInit?: DynamicIdentifier[];
    exception?: boolean;
  }
}
