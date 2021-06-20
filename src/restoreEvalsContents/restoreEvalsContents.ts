import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { FIND_AND_DECODE_EVALS } from './visitors/findAndDecodeEvals';

export const restoreEvalsContents = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, FIND_AND_DECODE_EVALS);
  return ast;
};
