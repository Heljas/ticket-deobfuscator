import { Binding, NodePath, Visitor } from '@babel/traverse';
import {
  ArrowFunctionExpression,
  ClassMethod,
  FunctionDeclaration,
  FunctionExpression,
  ObjectMethod,
} from '@babel/types';
import { utils } from '../../common/utils';
import { InlineConstantsState } from '../types/InlineConstantsState';
import { FIND_DECLARATORS } from './findDeclarators';
import { REPLACE_WITH_LITERALS } from './replaceWithLiterals';

const isBindingConstant = (binding: Binding) => {
  if (binding.constant) return true;
  const bindingPath = binding.path;
  if (!bindingPath.isVariableDeclarator()) return false;
  const init = bindingPath.get('init');
  if (!init.isStringLiteral()) return false;
  const initialValue = init.node.value;
  return binding.constantViolations.every((violation) => {
    if (!violation.isVariableDeclarator()) return false;
    const violationInit = bindingPath.get('init');
    if (!violationInit.isStringLiteral({ value: initialValue })) return false;
    const violationId = bindingPath.get('id');
    return violationId.isIdentifier({ name: binding.identifier.name });
  });
};

function handler(
  path: NodePath<
    | FunctionDeclaration
    | FunctionExpression
    | ArrowFunctionExpression
    | ObjectMethod
    | ClassMethod
  >,
) {
  const constantBindings = Object.values(path.scope.bindings)
    .filter((binding) => binding.kind === 'var' && isBindingConstant(binding))
    .map((binding) => binding.identifier.name);

  const state: InlineConstantsState = {
    constantBindings,
    variables: [],
    unexpectedError: false,
  };

  utils.runPathVisitors<InlineConstantsState>(
    path,
    state,
    FIND_DECLARATORS,
    REPLACE_WITH_LITERALS,
  );
  if (state.unexpectedError) return;
  state.variables.forEach((v) => v.declaration.remove());
}

export const INLINE_CONSTANS_ENTRY_POINT: Visitor = {
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
