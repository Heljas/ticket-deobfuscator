import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { ObfuscatedBlock } from "../obfuscatedBlock";

export const GET_ALL_CASES = {
  SwitchStatement(path: NodePath, state: ObfuscatedBlock) {
    if (!path.isSwitchStatement()) return;
    if (!t.isIdentifier(path.node.discriminant)) return;
    if (path.node.discriminant.name !== state.discriminant) return;
    for (let i = 0; i < path.node.cases.length; i++) {
      const singleCase = path.get(`cases.${i}`) as NodePath<t.SwitchCase>;
      state.cases.push(singleCase);
    }
  }
};
