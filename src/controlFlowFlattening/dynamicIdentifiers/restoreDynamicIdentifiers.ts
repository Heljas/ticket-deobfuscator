import { ObfuscatedBlock } from './../obfuscatedBlock';
import { CFF } from '../CFFTypes';

export function restoreDynamicIdentifiers(this: ObfuscatedBlock) {
  const currentBlock = this.getCurrentBlock();
  if (!currentBlock) return;
  this.dynamicIdentifiers = JSON.parse(JSON.stringify(currentBlock.dynamicIdentifiers)) as CFF.DynamicIdentifier[];
}
