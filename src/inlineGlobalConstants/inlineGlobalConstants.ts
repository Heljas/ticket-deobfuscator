import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { REPLACE_WITH_GLOBAL_LITERALS } from './visitors/replaceWithGlobalLiterals';
import { RESTORE_GLOBAL_REFERENCES } from './visitors/restoreGlobalReferences';

export const inlineGlobalConstants = (
  ast: File,
  globalState: GlobalState,
): File => {
  utils.runVisitors(
    ast,
    globalState,
    RESTORE_GLOBAL_REFERENCES,
    REPLACE_WITH_GLOBAL_LITERALS,
  );
  return ast;
};
