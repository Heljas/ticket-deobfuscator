import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { MERGE_REASSIGNMENTS } from './visitors/mergeReassignments';
import { REPLACE_REFERENCES } from './visitors/replaceReferences';

export const inlineBlockConstants = (ast: File, globalState: GlobalState) => {
  ast = utils.regenerate(ast);
  utils.runVisitors(ast, globalState, MERGE_REASSIGNMENTS);
  ast = utils.regenerate(ast);
  utils.runVisitors(ast, globalState, REPLACE_REFERENCES);
  return ast;
};
