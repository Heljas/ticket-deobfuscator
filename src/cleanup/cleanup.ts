import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { BRACKET_TO_DOT_NOTATION } from './visitors/bracketToDotNotation';

export const cleanUp = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, BRACKET_TO_DOT_NOTATION);
  return ast;
};
