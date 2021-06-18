import { NodePath, Visitor } from '@babel/traverse';
import { ForStatement, isNodesEquivalent } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { ControlFlowStatement } from './types/ControlFlowStatement';
import { getControlFlowConfig } from './utils/getControlFlowState';

export const ENTRY_POINT: Visitor<GlobalState> = {
  ForStatement: function (path: NodePath<ForStatement>, global: GlobalState) {
    const controlFlowConfig = getControlFlowConfig(path);

    if (!controlFlowConfig) return;

    const unflattenedNodes = new ControlFlowStatement(
      global,
      controlFlowConfig,
    ).getUnflattend();
    if (!unflattenedNodes) return;
    console.log(unflattenedNodes.length);
    path.replaceWithMultiple(unflattenedNodes);
  },
};
