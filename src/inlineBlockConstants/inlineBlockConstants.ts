import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { INLINE_CONSTANS_ENTRY_POINT } from './visitors/inlineConstantsEntryPoint';

export const inlineBlockConstants = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, INLINE_CONSTANS_ENTRY_POINT);
  return ast;
};
