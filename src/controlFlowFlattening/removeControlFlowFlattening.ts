import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { ENTRY_POINT } from './entryPoint';

export const removeControlFlowFlattening = (
  ast: File,
  globalState: GlobalState,
) => {
  utils.runVisitors(ast, globalState, ENTRY_POINT);
  return ast;
};
