import { ExecutionContextState } from './types/ExecutionContextState';
import { PrimitiveMemberExpression } from './types/PrimitiveMemberExpression';

import { FIND_GLOBAL_MEMBER_EXPRESSIONS } from './visitors/findGlobalMemberExpressions';
import { FIND_GLOBAL_FUNCTIONS } from './visitors/findGlobalFunctions';
import { utils } from '../common/utils';
import { StringsEncryptFunction } from './types/StringsEncryptFunction';

export const analyseExecutionContext = async (filepath: string) => {
  const ast = await utils.loadAstFromFile(filepath);

  const initialState: ExecutionContextState = {
    globalMemberExpressionsPrimitives: new Set<PrimitiveMemberExpression>(),
    stringsEncryptFunctions: new Set<StringsEncryptFunction>(),
    globalFunctions: new Set<string>(),
  };

  return utils.runVisitors<ExecutionContextState>(
    ast,
    initialState,
    FIND_GLOBAL_MEMBER_EXPRESSIONS,
    FIND_GLOBAL_FUNCTIONS,
  );
};
