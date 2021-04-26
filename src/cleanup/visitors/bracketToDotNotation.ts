import { NodePath, Visitor } from '@babel/traverse';
import { identifier, StringLiteral } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { StringLiteralExtra } from '../types/StringLiteralExtra';

export const BRACKET_TO_DOT_NOTATION: Visitor<GlobalState> = {
  StringLiteral: function (path: NodePath<StringLiteral>) {
    if (
      !path.parentPath.isMemberExpression() &&
      !path.parentPath.isObjectProperty()
    )
      return;

    if (path.parentPath.isObjectProperty() && path.key !== 'key') return;

    const node = path.node as StringLiteralExtra;
    if (node.extra) {
      if (node.extra.rawValue.indexOf('"') >= 0) return;
      node.extra.raw = `"${node.extra.rawValue}"`;
    }

    if (!path.node.value.match('^[a-zA-Z_$][0-9a-zA-Z_$]*$')) return;
    path.parentPath.node.computed = false;
    path.replaceWith(identifier(path.node.value));
  },
};
