import { File } from '@babel/types';
import { FIND_AND_REMOVE_REASSIGNMENTS } from '../removeReassignments/visitors/findAndRemoveReassignments';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { INLINE_CONSTANS_ENTRY_POINT } from './visitors/inlineConstantsEntryPoint';

export const inlineBlockConstants = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, INLINE_CONSTANS_ENTRY_POINT);
  return ast;
};
