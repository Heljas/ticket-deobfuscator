import { NodePath, Visitor } from '@babel/traverse';
import {
  ArrowFunctionExpression,
  ClassMethod,
  FunctionDeclaration,
  FunctionExpression,
  identifier,
  isIdentifier,
  isNumericLiteral,
  isStringLiteral,
  NumericLiteral,
  numericLiteral,
  ObjectMethod,
  StringLiteral,
  stringLiteral,
  variableDeclaration,
  variableDeclarator,
} from '@babel/types';
import { ReassignedVariable } from '../types/ReassignedVariable';

const pushVariable = (
  container: ReassignedVariable[],
  child: NodePath,
  name: string,
  init: StringLiteral | NumericLiteral,
) => {
  let variable = container.find((v) => v.name == name);
  if (!variable) {
    variable = {
      name,
      paths: [],
      value: -1,
    };
    container.push(variable);
  }
  variable.value = init.value;
  variable.paths.push(child);
};

const handler = (
  path:
    | NodePath<FunctionDeclaration>
    | NodePath<FunctionExpression>
    | NodePath<ClassMethod>
    | NodePath<ArrowFunctionExpression>
    | NodePath<ObjectMethod>,
) => {
  if (!path.node.start) return;
  const program = path.find((p) => p.isProgram());
  if (!program) return;

  const body = path.get('body') as NodePath;
  if (!body.isBlockStatement()) return;
  const variables: ReassignedVariable[] = [];
  const blockChilds = body.get('body') as NodePath[];
  for (const child of blockChilds) {
    if (!child.isVariableDeclaration() && !child.isExpressionStatement()) {
      break;
    }
    if (child.isVariableDeclaration()) {
      const [declaration] = child.get('declarations') as NodePath[];
      if (!declaration.isVariableDeclarator()) continue;
      const id = declaration.node.id;
      if (!isIdentifier(id)) continue;
      const init = declaration.node.init;
      if (!isStringLiteral(init) && !isNumericLiteral(init)) continue;
      pushVariable(variables, child, id.name, init);
    } else {
      const expression = child.get('expression') as NodePath;
      if (!expression.isAssignmentExpression({ operator: '=' })) continue;
      const id = expression.node.left;
      if (!isIdentifier(id)) continue;
      const init = expression.node.right;
      if (!isStringLiteral(init) && !isNumericLiteral(init)) continue;
      pushVariable(variables, child, id.name, init);
    }
  }
  variables.forEach((variable) => {
    const [firstPath, ...otherPaths] = variable.paths;
    otherPaths.forEach((p) => p.remove());
    const init =
      typeof variable.value === 'string'
        ? stringLiteral(variable.value)
        : numericLiteral(variable.value);
    firstPath.replaceWith(
      variableDeclaration('var', [
        variableDeclarator(identifier(variable.name), init),
      ]),
    );
  });
};

export const FIND_AND_REMOVE_REASSIGNMENTS: Visitor = {
  FunctionDeclaration: function (path: NodePath<FunctionDeclaration>) {
    handler(path);
  },
  FunctionExpression: function (path: NodePath<FunctionExpression>) {
    handler(path);
  },
  ArrowFunctionExpression: function (path: NodePath<ArrowFunctionExpression>) {
    handler(path);
  },
  ObjectMethod: function (path: NodePath<ObjectMethod>) {
    handler(path);
  },
  ClassMethod: function (path: NodePath<ClassMethod>) {
    handler(path);
  },
};
