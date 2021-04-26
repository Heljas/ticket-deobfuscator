import { NodePath, Visitor } from '@babel/traverse';
import * as t from '@babel/types';
import { ObfuscatedBlock } from './obfuscatedBlock';
import { GlobalState } from '../common/types/GlobalState';

export const ENTRY_POINT: Visitor = {
  ForStatement: function (path: NodePath, state: GlobalState) {
    if (!path.isForStatement()) return;
    if (!t.isForStatement(path.node, { init: null, update: null })) return;
    if (path.parentPath.isProgram()) return;

    const testPath = path.get('test') as NodePath;
    if (!t.isBinaryExpression(testPath)) return;

    const discriminantPath = testPath.get('left') as NodePath;
    if (!t.isIdentifier(discriminantPath.node)) return;

    const switchStatement = (path.node.body as t.BlockStatement).body[0];
    if (!t.isSwitchStatement(switchStatement)) return;
    if (!t.isIdentifier(switchStatement.discriminant)) return;

    const discriminantName = discriminantPath.node.name;
    if (switchStatement.discriminant.name !== discriminantName) return;

    new ObfuscatedBlock(path, discriminantName, state).replaceWithFinalNode();
  },
};
