import { File } from '@babel/types';
import { GlobalState } from '../common/types/GlobalState';
import { utils } from '../common/utils';
import { BRACKET_TO_DOT_NOTATION } from './visitors/bracketToDotNotation';
import { CLEAN_IF_STATEMENTS } from './visitors/cleanIfStatements';
import { CLEAN_LOGICAL_EXPRESSIONS } from './visitors/cleanLogicalExpressions';
import { EVALUATE_EXTENDED_PREDICATES } from './visitors/evaluateExtendedPredicates';
import { REMOVE_SEQUENCE_EXPRESSIONS } from './visitors/removeSequenceExpressions';

export const cleanUp = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(
    ast,
    globalState,
    BRACKET_TO_DOT_NOTATION,
    EVALUATE_EXTENDED_PREDICATES,
    CLEAN_LOGICAL_EXPRESSIONS,
    CLEAN_IF_STATEMENTS,
    REMOVE_SEQUENCE_EXPRESSIONS,
  );
  return ast;
};
