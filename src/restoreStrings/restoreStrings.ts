import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { REPLACE_UNARY_AND_BINARY } from './visitors/replaceUnaryAndBinary';
import { utils } from '../common/utils';
import { EVALUATE_ENCRYPT_FUNCTIONS } from './visitors/evaluateEncryptFunctions';
import { JOIN_STRINGS } from './visitors/joinStrings';

export const decryptStrings = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(
    ast,
    globalState,
    REPLACE_UNARY_AND_BINARY,
    EVALUATE_ENCRYPT_FUNCTIONS,
    JOIN_STRINGS,
  );
  return utils.regenerate(ast);
};
