import { File } from '@babel/types';
import { GlobalState } from './GlobalState';

export type DeobfuscatorStep = (ast: File, state: GlobalState) => File;
