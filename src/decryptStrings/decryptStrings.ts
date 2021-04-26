import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { REPLACE_UNARY_AND_BINARY } from './visitors/replaceUnaryAndBinary';
import { utils } from '../common/utils';
import { EVALUATE_ENCRYPT_FUNCTIONS } from './visitors/evaluateEncryptFunctions';
import { MERGE_STRING_PARTS } from './visitors/mergeStringsParts';

export const decryptStrings = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(
    ast,
    globalState,
    REPLACE_UNARY_AND_BINARY,
    EVALUATE_ENCRYPT_FUNCTIONS,
    MERGE_STRING_PARTS,
  );
  return utils.regenerate(ast);
};
