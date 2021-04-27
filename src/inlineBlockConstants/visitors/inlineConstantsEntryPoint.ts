import { Binding, NodePath, Visitor } from '@babel/traverse';
import {
  ArrowFunctionExpression,
  ClassMethod,
  FunctionDeclaration,
  FunctionExpression,
  ObjectMethod,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
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
  globalState: GlobalState,
) {
  const constantBindings = Object.values(path.scope.bindings)
    .filter((binding) => binding.kind === 'var' && isBindingConstant(binding))
    .map((binding) => binding.identifier.name);

  const state: InlineConstantsState = {
    global: globalState,
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

export const INLINE_CONSTANS_ENTRY_POINT: Visitor<GlobalState> = {
  FunctionDeclaration: function (
    path: NodePath<FunctionDeclaration>,
    state: GlobalState,
  ) {
    handler(path, state);
  },
  FunctionExpression: function (
    path: NodePath<FunctionExpression>,
    state: GlobalState,
  ) {
    handler(path, state);
  },
  ArrowFunctionExpression: function (
    path: NodePath<ArrowFunctionExpression>,
    state: GlobalState,
  ) {
    handler(path, state);
  },
  ObjectMethod: function (path: NodePath<ObjectMethod>, state: GlobalState) {
    handler(path, state);
  },
  ClassMethod: function (path: NodePath<ClassMethod>, state: GlobalState) {
    handler(path, state);
  },
};
