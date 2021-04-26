import { NodePath } from '@babel/traverse';
import { MemberExpression } from '@babel/types';
import { VariablesMaskingState } from './types/VariablesMaskingState';

export const getMaskedVariableIndex = (path: NodePath<MemberExpression>, state: VariablesMaskingState) => {
  const object = path.get('object') as NodePath;
  if (!object.isIdentifier({ name: state.declaratorName })) return -1;
  const property = path.get('property') as NodePath;
  if (!property.isNumericLiteral()) return -1;
  return property.node.value;
};
