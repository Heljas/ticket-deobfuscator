import { CallExpression, objectExpression, objectProperty } from '@babel/types';
import { NodePath, Visitor } from '@babel/traverse';
import { GlobalState } from '../../common/types/GlobalState';

export const RECOVER_OBJECT_EXPRESSIONS: Visitor<GlobalState> = {
  CallExpression: function (path: NodePath<CallExpression>) {
    const args = path.get('arguments');
    if (args.length !== 2) return;
    const [expression, identifier] = args;
    if (
      !expression.isThisExpression() ||
      !identifier.isIdentifier({ name: 'arguments' })
    )
      return;

    const callee = path.get('callee');
    if (!callee.isMemberExpression()) return;
    const object = callee.get('object');
    const property = callee.get('property');
    if (!object.isFunctionExpression()) return;
    if (!property.isIdentifier({ name: 'apply' })) return;

    const functionBody = object.get('body');
    if (!functionBody.isBlockStatement()) return;
    const bodyChildren = functionBody.get('body');

    const [first, ...other] = bodyChildren;
    const [last] = other.splice(other.length - 1, 1);

    if (!first.isVariableDeclaration()) return;
    if (!last.isReturnStatement()) return;
    const declarators = first.get('declarations');
    if (declarators.length !== 1) return;
    const [objectDeclarator] = declarators;
    const objectInit = objectDeclarator.get('init');
    if (!objectInit.isObjectExpression()) return;
    if (objectInit.node.properties.length > 0) return;
    const objectIdentifier = objectDeclarator.get('id');
    if (!objectIdentifier.isIdentifier()) return;
    const objectName = objectIdentifier.node.name;
    const objectProperties = [];
    for (const path of other) {
      if (!path.isExpressionStatement()) return;
      const expression = path.get('expression');
      if (!expression.isAssignmentExpression()) return;
      const left = expression.get('left');
      if (!left.isMemberExpression()) return;
      const object = left.get('object');
      const property = left.get('property');
      if (!object.isIdentifier({ name: objectName })) return;
      if (!property.isIdentifier()) return;
      const right = expression.get('right');
      objectProperties.push(objectProperty(property.node, right.node));
    }
    path.replaceWith(objectExpression(objectProperties));
  },
};
