import { ObfuscatedBlock } from '../obfuscatedBlock';
import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';

export function updateDynamicIdentifiers(this: ObfuscatedBlock, path: NodePath) {
  const dynamicIdentifiers = this.dynamicIdentifiers;
  if (t.isVariableDeclaration(path.node)) {
    const declarations = path.get('declarations') as NodePath<t.VariableDeclarator>[];
    declarations.forEach((declaration) => {
      if (!t.isVariableDeclarator(declaration.node)) return;
      const identifier = declaration.node.id;
      if (!t.isIdentifier(identifier)) return;
      const dynamicIdentifier = dynamicIdentifiers.find((i) => i.name === identifier.name);
      if (!dynamicIdentifier) return;

      try {
        const initialValue = Number(declaration.get('init').toString());
        dynamicIdentifier.value = initialValue;
      } catch {}
    });
  }

  if (t.isExpressionStatement(path.node)) {
    const expression = path.node.expression;
    if (t.isUpdateExpression(expression)) {
      const identifier = expression.argument;
      if (!t.isIdentifier(identifier)) return;
      const dynamicIdentifier = dynamicIdentifiers.find((i) => i.name === identifier.name);
      if (!dynamicIdentifier) return;
      if (!dynamicIdentifier.value) return;
      const operator = expression.operator;

      if (operator === '++') {
        dynamicIdentifier.value++;
      }
      if (operator === '--') {
        dynamicIdentifier.value--;
      }
    }

    if (t.isAssignmentExpression(expression)) {
      const identifier = expression.left;
      if (!t.isIdentifier(identifier)) return;
      const dynamicIdentifier = dynamicIdentifiers.find((i) => i.name === identifier.name);
      if (!dynamicIdentifier) return;
      try {
        const expressionPath = path.get('expression') as NodePath;
        const updatedValue = Number(expressionPath.get('right').toString());
        if (!dynamicIdentifier.value) return;
        dynamicIdentifier.value += updatedValue;
      } catch {}
    }
  }
}
