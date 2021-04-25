import { NodePath, Visitor } from '@babel/traverse';
import { ClassMethod, FunctionDeclaration, FunctionExpression, identifier, isIdentifier } from '@babel/types';
import { utils } from '../../utils';
import { VariablesMaskingState } from '../types/VariablesMaskingState';
import { FIND_MASKING_DECLARATOR } from './findMaskingDeclarator';
import { GENERATE_VARIABLES_DECLARATIONS } from './generateVariablesDeclarations';
import { REMOVE_SEQUENCE_EXPRESSIONS } from './removeSequenceExpressions';
import { REPLACE_WITH_VARIABLES } from './replaceWithVariables';
import { UNPACK_ARGUMENTS } from './unpackArguments';

const handler = (path: NodePath<FunctionDeclaration> | NodePath<FunctionExpression> | NodePath<ClassMethod>) => {
  if (!path.node.start) return;
  const program = path.find((p) => p.isProgram());
  if (!program) return;

  const state: VariablesMaskingState = {
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
    REMOVE_SEQUENCE_EXPRESSIONS,
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

export const MASKING_ENTRY_POINT: Visitor = {
  FunctionDeclaration: function (path: NodePath<FunctionDeclaration>) {
    handler(path);
  },
  FunctionExpression: function (path: NodePath<FunctionExpression>) {
    handler(path);
  },
  ClassMethod: function (path: NodePath<ClassMethod>) {
    handler(path);
  },
};
