import { NodePath, Visitor } from '@babel/traverse';
import {
  ArrowFunctionExpression,
  BlockStatement,
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


export const FIND_AND_REMOVE_REASSIGNMENTS: Visitor = {
  BlockStatement: function (path: NodePath<BlockStatement>) {
    if (!path.node.start) return;
    const program = path.find((p) => p.isProgram());
    if (!program) return;

    const variables: ReassignedVariable[] = [];
    const blockChilds = path.get('body') as NodePath[];
    for (const child of blockChilds) {
      if (!child.isVariableDeclaration() && !child.isExpressionStatement()) {
        continue;
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
  },
};
