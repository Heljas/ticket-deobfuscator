import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { ObfuscatedBlock } from '../obfuscatedBlock';

export const GET_INITIAL_VALUE = {
  VariableDeclarator(path: NodePath, state: ObfuscatedBlock) {
    if (!path.isVariableDeclarator()) return;
    if (!t.isIdentifier(path.node.id, { name: state.discriminant })) return;
    state.discriminantDeclarator = path;
    state.initialValue = path.get('init').toString();
  },
};
