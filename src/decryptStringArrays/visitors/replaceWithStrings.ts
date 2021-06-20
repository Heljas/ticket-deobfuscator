import { NodePath, Visitor } from '@babel/traverse';
import { MemberExpression, stringLiteral } from '@babel/types';
import { EncryptionDetails } from '../types/EncryptionDetails';

export const REPLACE_WITH_STRINGS: Visitor<EncryptionDetails[]> = {
  MemberExpression: function (
    path: NodePath<MemberExpression>,
    state: EncryptionDetails[],
  ) {
    const object = path.get('object');
    if (!object.isIdentifier()) return;
    const id = object.node.name;
    const encryptionDetails = state.find((e) => e.identifier === id);
    if (!encryptionDetails) return;

    const property = path.get('property');
    if (!property.isNumericLiteral()) {
      throw new Error(`${path.toString()}: property is not numeric literal!`);
    }

    const index = property.node.value;
    if (index >= encryptionDetails.decodedStrings.length) {
      throw new Error(
        `${path.toString()}: index larger than decoded strings array's length!`,
      );
    }
    path.replaceWith(stringLiteral(encryptionDetails.decodedStrings[index]));
  },
};
