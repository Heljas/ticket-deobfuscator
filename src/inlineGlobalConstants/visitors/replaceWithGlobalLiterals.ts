import { NodePath, Visitor } from '@babel/traverse';
import {
  booleanLiteral,
  isIdentifier,
  isMemberExpression,
  isNumericLiteral,
  MemberExpression,
  nullLiteral,
  numericLiteral,
  stringLiteral,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';

export const REPLACE_WITH_GLOBAL_LITERALS: Visitor<GlobalState> = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: GlobalState,
  ) {
    if (path.scope.block.type === 'Program') return;
    if (path.key === 'callee') return;
    if (!isIdentifier(path.node.object)) return;

    if (
      !isIdentifier(path.node.property) &&
      !isNumericLiteral(path.node.property)
    )
      return;

    const localObjectName = path.node.object.name;
    const localProperty = isNumericLiteral(path.node.property)
      ? path.node.property.value
      : path.node.property.name;

    const globalPrimitives = Array.from(
      state.executionContext.globalMemberExpressionsPrimitives,
    );
    const primitive = globalPrimitives.find(
      (me) =>
        me.objectName === localObjectName && me.property === localProperty,
    );
    if (!primitive) return;
    switch (typeof primitive.value) {
      case 'string':
        path.replaceWith(stringLiteral(primitive.value));
        break;
      case 'number':
        path.replaceWith(numericLiteral(primitive.value));
        break;
      case 'boolean':
        path.replaceWith(booleanLiteral(primitive.value));
        break;
      case 'object': //null
        path.replaceWith(nullLiteral());
        break;
    }
  },
};
