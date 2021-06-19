import { NodePath, Visitor } from '@babel/traverse';
import { ForStatement } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { ControlFlowStatement } from './types/ControlFlowStatement';
import { getControlFlowConfig } from './getControlFlowConfig';

export const ENTRY_POINT: Visitor<GlobalState> = {
  ForStatement: function (path: NodePath<ForStatement>, global: GlobalState) {
    const controlFlowConfig = getControlFlowConfig(path);

    if (!controlFlowConfig) return;

    try {
      const unflattened = new ControlFlowStatement(
        global,
        controlFlowConfig,
      ).getUnflattend();

      path.replaceWithMultiple(unflattened);
      controlFlowConfig.stateHolderInitializer?.remove();
    } catch (ex) {
      console.log(
        `Couldn't unflatten control flow statement with state: ${controlFlowConfig.stateHolderInitializer?.toString()}`,
      );
      console.log(ex.toString());
    }
  },
};
