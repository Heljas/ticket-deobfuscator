import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { EncryptionDetails } from './types/EncryptionDetails';
import { GET_AND_DECRYPT_ARRAYS } from './visitors/getAndDecryptArrays';
import { REPLACE_WITH_STRINGS } from './visitors/replaceWithStrings';

export const decryptStringArrays = (ast: File, globalState: GlobalState) => {
  const encryptionDetails: EncryptionDetails[] = [];
  utils.runVisitors(
    ast,
    encryptionDetails,
    GET_AND_DECRYPT_ARRAYS,
    REPLACE_WITH_STRINGS,
  );
  return ast;
};
