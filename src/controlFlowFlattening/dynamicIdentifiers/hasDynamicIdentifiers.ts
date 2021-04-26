import { ObfuscatedBlock } from "../obfuscatedBlock";
import { NodePath } from "@babel/traverse";

export function hasDynamicIdentifiers(this: ObfuscatedBlock, path: NodePath) {
  let foundDynamicIdentifier = false;
  path.traverse(
    {
      Identifier(innerPath, state) {
        const name = innerPath.node.name;
        if (state.dynamicIdentifiers.some(d => d.name === name)) {
          foundDynamicIdentifier = true;
          innerPath.stop();
        }
      }
    },
    this
  );
  return foundDynamicIdentifier;
}
