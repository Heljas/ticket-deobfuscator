import { File } from '@babel/types';
import { FIND_AND_REMOVE_REASSIGNMENTS } from './visitors/findAndRemoveReassignments';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';

export const removeReassignments = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, FIND_AND_REMOVE_REASSIGNMENTS);
  return utils.regenerate(ast);
};
