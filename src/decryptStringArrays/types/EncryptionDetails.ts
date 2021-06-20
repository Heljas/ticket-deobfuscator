import { NodePath } from '@babel/traverse';
import { Function } from '@babel/types';

export interface EncryptionDetails {
  uri: string;
  key: string;
  separator: number;
  decodedStrings: string[];
  identifier?: string;
}
