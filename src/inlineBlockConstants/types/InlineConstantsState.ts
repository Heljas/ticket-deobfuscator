import { ConstantVariable } from './ConstantVariable';

export interface InlineConstantsState {
  constantBindings: string[];
  variables: ConstantVariable[];
  unexpectedError: boolean;
}
