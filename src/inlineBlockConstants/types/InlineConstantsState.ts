import { GlobalState } from '../../common/types/GlobalState';
import { ConstantVariable } from './ConstantVariable';

export interface InlineConstantsState {
  global: GlobalState;
  constantBindings: string[];
  variables: ConstantVariable[];
  unexpectedError: boolean;
}
