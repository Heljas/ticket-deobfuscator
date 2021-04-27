import { Evaluator } from '../evaluator';
import { ExecutionContextState } from '../../analyseExecutionContext/types/ExecutionContextState';

export interface GlobalState {
  executionContext: ExecutionContextState;
  evaluator: Evaluator;
  errors: string[];
}
