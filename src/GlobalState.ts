import { Evaluator } from './evaluator';
import { ExecutionContextState } from './executionContextAnalysis/types/ExecutionContextState';

export interface GlobalState {
  executionContext: ExecutionContextState;
  evaluator: Evaluator;
}
