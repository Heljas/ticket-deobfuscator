import { StringLiteral } from '@babel/types';

export interface StringLiteralExtra extends StringLiteral {
  extra: {
    raw: string;
    rawValue: string;
  };
}
