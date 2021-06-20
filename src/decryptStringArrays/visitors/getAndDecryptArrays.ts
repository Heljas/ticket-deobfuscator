import { NodePath, Visitor } from '@babel/traverse';
import { SequenceExpression, buildMatchMemberExpression } from '@babel/types';
import { EncryptionDetails } from '../types/EncryptionDetails';

export const GET_AND_DECRYPT_ARRAYS: Visitor<EncryptionDetails[]> = {
  SequenceExpression: function (
    path: NodePath<SequenceExpression>,
    state: EncryptionDetails[],
  ) {
    const expressions = path.get('expressions');
    const keyLiteral = expressions.find((e) => e.isStringLiteral());
    if (!keyLiteral || !keyLiteral.isStringLiteral()) return;
    const key = keyLiteral.node.value;

    let uri: string | null = null;
    for (const expression of expressions) {
      if (!expression.isAssignmentExpression()) continue;
      const right = expression.get('right');
      if (!right.isCallExpression()) continue;
      const callee = right.get('callee');
      if (!callee.isIdentifier({ name: 'decodeURI' })) continue;
      const [argument] = right.get('arguments');
      if (!argument.isStringLiteral()) continue;
      uri = argument.node.value;
    }
    if (!uri) return;

    const siblings = path.getStatementParent()?.getAllNextSiblings();
    if (!siblings) return;

    const isStringFromCharCode = buildMatchMemberExpression(
      'String.fromCharCode',
    );

    let separator: number | null = null;
    let identifier: string | null = null;

    for (const sibling of siblings) {
      if (!sibling.isVariableDeclaration()) continue;
      const declarators = sibling.get('declarations');
      if (declarators.length !== 1) continue;
      const declarator = declarators[0];
      const init = declarator.get('init');
      if (!init.isCallExpression()) continue;
      const callee = init.get('callee');
      if (!callee.isMemberExpression()) continue;
      const property = callee.get('property');
      if (!property.isIdentifier({ name: 'split' })) continue;
      const args = init.get('arguments');
      if (args.length !== 1) continue;
      const calleeArgument = args[0];

      if (!calleeArgument.isCallExpression()) continue;

      //* xyz.split( >>> String.fromCharCode(170) <<<)
      const innerCallee = calleeArgument.get('callee');
      if (!innerCallee.isMemberExpression()) continue;
      if (!isStringFromCharCode(innerCallee.node)) continue;
      const [separatorPath] = calleeArgument.get('arguments');
      if (!separatorPath.isNumericLiteral()) continue;

      const id = declarator.get('id');
      if (!id.isIdentifier()) continue;
      identifier = id.node.name;
      separator = separatorPath.node.value;
    }

    if (!separator || !identifier) return;
    state.push({
      uri,
      key,
      separator,
      identifier,
      decodedStrings: decodeArray(uri, key, separator),
    });
  },
};

const decodeArray = (uri: string, key: string, separator: number) => {
  const decodedURI = decodeURI(uri);
  let decodedString = '';
  let keyIndex = 0;
  for (let i = 0; i < decodedURI.length; i++) {
    if (keyIndex === key.length) {
      keyIndex = 0;
    }
    decodedString += String.fromCharCode(
      decodedURI.charCodeAt(i) ^ key.charCodeAt(keyIndex),
    );
    keyIndex++;
  }
  return decodedString.split(String.fromCharCode(separator));
};
