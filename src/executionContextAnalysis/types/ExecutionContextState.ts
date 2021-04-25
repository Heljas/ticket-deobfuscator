import { PrimitiveMemberExpression } from './PrimitiveMemberExpression';
import { StringsEncryptFunction } from './StringsEncryptFunction';

export type ExecutionContextState = {
  globalMemberExpressionsPrimitives: Set<PrimitiveMemberExpression>;
  stringsEncryptFunctions: Set<StringsEncryptFunction>;
  globalFunctions: Set<string>;
};
