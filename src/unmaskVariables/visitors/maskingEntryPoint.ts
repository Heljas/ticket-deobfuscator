import { NodePath, Visitor } from '@babel/traverse';
import {
  ArrowFunctionExpression,
  ClassMethod,
  FunctionDeclaration,
  FunctionExpression,
  identifier,
  isIdentifier,
  ObjectMethod,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { utils } from '../../common/utils';
import { VariablesMaskingState } from '../types/VariablesMaskingState';
import { FIND_MASKING_DECLARATOR } from './findMaskingDeclarator';
import { GENERATE_VARIABLES_DECLARATIONS } from './generateVariablesDeclarations';
import { REPLACE_WITH_VARIABLES } from './replaceWithVariables';
import { UNPACK_ARGUMENTS } from './unpackArguments';

const handler = (
  path: NodePath<
    | FunctionDeclaration
    | FunctionExpression
    | ArrowFunctionExpression
    | ObjectMethod
    | ClassMethod
  >,
  globalState: GlobalState,
) => {
  if (!path.node.start) return;
  const program = path.find((p) => p.isProgram());
  if (!program) return;

  const state: VariablesMaskingState = {
    global: globalState,
    maskingDeclarator: null,
    declaratorName: 'not-found',
    maskedVariables: [],
    scopeUid: path.node.start,
    arguments: [],
    globalScope: program.scope,
    detectedErrors: false,
  };

  //Get function params
  path.node.params.forEach((param, index) => {
    if (!isIdentifier(param)) return;
    state.arguments.push({
      index,
      name: param.name,
    });
  });

  utils.runPathVisitors<VariablesMaskingState>(
    path,
    state,
    FIND_MASKING_DECLARATOR,
    GENERATE_VARIABLES_DECLARATIONS,
    REPLACE_WITH_VARIABLES,
    UNPACK_ARGUMENTS,
  );

  if (!state.maskingDeclarator) return;

  const functionParamsLength = path.node.params.length;
  state.arguments.forEach((argument, index) => {
    if (index < functionParamsLength) return;
    path.node.params.push(identifier(argument.name));
  });

  if (state.detectedErrors) return;
  state.maskingDeclarator.remove();
};

export const MASKING_ENTRY_POINT: Visitor<GlobalState> = {
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
