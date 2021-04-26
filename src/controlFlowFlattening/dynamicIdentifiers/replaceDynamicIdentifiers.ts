import { ObfuscatedBlock } from "../obfuscatedBlock";

export function replaceDynamicIdentifiers(this: ObfuscatedBlock, condition: string) {
  const availableIdentifiers = this.dynamicIdentifiers.filter(i => i.value);
  availableIdentifiers.forEach(identifier => {
    const toStringRegex = new RegExp(`${identifier.name}\.toString`, "g");
    condition = condition.replace(toStringRegex, `"${identifier.value}".toString`);

    const regularIdentifierRegex = new RegExp(`== ${identifier.name}`, "g");
    condition = condition.replace(regularIdentifierRegex, `== ${identifier.value}`);
  });
  return condition;
}
