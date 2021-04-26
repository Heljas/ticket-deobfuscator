import { NodePath, Visitor } from '@babel/traverse';
import {
  CallExpression,
  isIdentifier,
  isMemberExpression,
  isNumericLiteral,
  stringLiteral,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';

export const EVALUATE_ENCRYPT_FUNCTIONS: Visitor = {
  CallExpression: function (
    path: NodePath<CallExpression>,
    state: GlobalState,
  ) {
    if (path.node.arguments.length != 1) return;
    const [argument] = path.node.arguments;
    const callee = path.node.callee;
    if (!isMemberExpression(callee) || !isNumericLiteral(argument)) return;
    if (!isIdentifier(callee.object) || !isIdentifier(callee.property)) return;
    const objectName = callee.object.name;
    const propertyName = callee.property.name;
    const encryptFunctions = Array.from(
      state.executionContext.stringsEncryptFunctions,
    );
    const encryptFunction = encryptFunctions.find(
      (fn) => fn.objectName == objectName && fn.property == propertyName,
    );
    if (!encryptFunction) return;

    const source = path.toString();
    const value = state.evaluator.run<string>(source, 'string');
    if (!value) return;
    path.replaceWith(stringLiteral(value));
  },
};
