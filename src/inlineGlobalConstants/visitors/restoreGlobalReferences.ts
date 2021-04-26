import { NodePath, Visitor } from '@babel/traverse';
import {
  isIdentifier,
  isVariableDeclaration,
  isVariableDeclarator,
  VariableDeclaration,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';

export const RESTORE_GLOBAL_REFERENCES: Visitor = {
  VariableDeclaration: function (
    path: NodePath<VariableDeclaration>,
    state: GlobalState,
  ) {
    if (!isVariableDeclarator(path.node.declarations[0])) return;
    const declarator = path.node.declarations[0];
    if (!isIdentifier(declarator.id)) return;
    if (!isIdentifier(declarator.init)) return;
    const name = declarator.init.name;
    const encryptFunctions = Array.from(state.executionContext.globalFunctions);
    const func = encryptFunctions.find((fn) => fn === name);
    if (!func) return;
    path.scope.path.traverse(
      {
        MemberExpression(path) {
          if (!isIdentifier(path.node.object, { name: this.orgName })) return;
          path.node.object.name = this.globalName;
        },
      },
      { orgName: declarator.id.name, globalName: declarator.init.name },
    );
    path.remove();
  },
};
