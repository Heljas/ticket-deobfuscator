import { NodePath, Visitor } from '@babel/traverse';
import { Node, stringLiteral, VariableDeclaration } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { SplitString } from '../types/SplitString';
import { StringPart } from '../types/StringPart';

const getStringPart = (
  path: NodePath<Node>,
  identifierName: string,
): StringPart | null => {
  if (!path.isExpressionStatement()) return null;
  const expression = path.get('expression') as NodePath;
  if (!expression.isAssignmentExpression({ operator: '+=' })) return null;
  const left = expression.get('left');
  const right = expression.get('right');
  if (
    !left.isIdentifier({ name: identifierName }) ||
    !right.isStringLiteral()
  ) {
    return null;
  }
  return {
    path,
    value: right.node.value,
  };
};

export const MERGE_STRING_PARTS: Visitor<GlobalState> = {
  VariableDeclaration: function (path: NodePath<VariableDeclaration>) {
    const [declarator] = path.get('declarations');
    const initPath = declarator.get('init');
    if (!initPath.isStringLiteral()) return;
    const id = declarator.get('id');
    if (!id.isIdentifier()) return;

    const string: SplitString = {
      identifierName: id.node.name,
      initialValue: initPath.node.value,
      parts: [],
    };

    for (const sibling of path.getAllNextSiblings()) {
      const part = getStringPart(sibling, string.identifierName);
      if (!part) continue;
      string.parts.push(part);
    }

    const mergedValue = string.parts.reduce((value, part) => {
      value += part.value;
      part.path.remove();
      return value;
    }, '');

    initPath.replaceWith(stringLiteral(string.initialValue + mergedValue));
  },
};
