import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { MASKING_ENTRY_POINT } from './visitors/maskingEntryPoint';

export const unmaskVariables = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, MASKING_ENTRY_POINT);
  return ast;
};
