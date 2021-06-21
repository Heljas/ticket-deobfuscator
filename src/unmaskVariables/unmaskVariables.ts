import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { MASKING_ENTRY } from './visitors/maskingEntry';
import { REMOVE_REASSIGNMENTS } from './visitors/removeReassignments';

export const unmaskVariables = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, MASKING_ENTRY);

  ast = utils.regenerate(ast);
  utils.runVisitors(ast, globalState, REMOVE_REASSIGNMENTS);
  return utils.regenerate(ast);
};
