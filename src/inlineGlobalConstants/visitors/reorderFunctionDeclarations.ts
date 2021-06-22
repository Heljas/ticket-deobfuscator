import { NodePath, Visitor } from '@babel/traverse';
import { blockStatement, FunctionParent, Statement } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';

export const REORDER_FUNCTION_DECLARATIONS: Visitor<GlobalState> = {
  FunctionParent: function (
    path: NodePath<FunctionParent>,
    state: GlobalState,
  ) {
    const body = path.get('body');
    if (!body.isBlockStatement()) return;
    const statements = body.get('body');
    const functions: Statement[] = [];
    const other: Statement[] = [];
    for (const statement of statements) {
      if (statement.isFunctionDeclaration()) {
        functions.push(statement.node);
        continue;
      }
      other.push(statement.node);
    }

    if (functions.length === 0) return;

    body.replaceWith(blockStatement([...other, ...functions]));
  },
};
