import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { MASKING_ENTRY } from './visitors/maskingEntry';

export const unmaskVariables = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, MASKING_ENTRY);
  return ast;
};
