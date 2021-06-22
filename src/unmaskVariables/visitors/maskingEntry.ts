import { NodePath, Visitor } from '@babel/traverse';
import {
  identifier,
  isIdentifier,
  variableDeclarator,
  variableDeclaration,
  FunctionParent,
  MemberExpression,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { utils } from '../../common/utils';
import { VariablesMaskingState } from '../types/VariablesMaskingState';
import { FIND_MASKED_VARIABLES } from './findMaskedVariables';
import { FIND_MASKING_DECLARATOR } from './findMaskingDeclarator';
import { UNMASK_ARGUMENTS } from './unmaskArguments';

export const MASKING_ENTRY: Visitor<GlobalState> = {
  FunctionParent: function (
    path: NodePath<FunctionParent>,
    globalState: GlobalState,
  ) {
    const program = path.find((p) => p.isProgram());
    if (!program) return;

    const state: VariablesMaskingState = {
      global: globalState,
      argumentsDeclarator: null,
      arrayName: 'not-found',
      parent: path,
      variables: [],
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
      FIND_MASKED_VARIABLES,
    );

    if (!state.argumentsDeclarator) return;

    state.variables.forEach((variable) => {
      const [firstReference] = variable.references;

      const isParentScopeConstant = variable.references.every((ref) =>
        ref.find((p) => p.scope === firstReference.scope),
      );

      const positionStatement = (isParentScopeConstant
        ? firstReference
        : state.argumentsDeclarator
      )?.getStatementParent();

      if (!positionStatement) {
        throw new Error(
          "Couldn't get a statement to insert variable declaration",
        );
      }

      const initialValue = isParentScopeConstant
        ? getInitialValue(firstReference)
        : null;
      const id = identifier(variable.name);
      const declarator = variableDeclarator(id, initialValue);
      const declaration = variableDeclaration('var', [declarator]);

      if (isParentScopeConstant && initialValue) {
        positionStatement.replaceWith(declaration);
      } else {
        positionStatement.insertBefore(declaration);
      }

      variable.references.forEach((p) => {
        p.replaceWith(identifier(variable.name));
      });
    });

    utils.runPathVisitors<VariablesMaskingState>(path, state, UNMASK_ARGUMENTS);

    const functionParamsLength = path.node.params.length;
    state.arguments.forEach((argument, index) => {
      if (index < functionParamsLength) {
        path.scope.rename(argument.name, `${state.arrayName}_arg${index + 1}`);
        return;
      }
      path.node.params.push(identifier(argument.name));
    });

    if (state.detectedErrors) return;
    state.argumentsDeclarator.remove();
  },
};

const getInitialValue = (path: NodePath<MemberExpression>) => {
  const statementParent = path.getStatementParent();
  if (!statementParent?.isExpressionStatement()) return null;
  const expression = statementParent.get('expression');
  if (
    !expression.isAssignmentExpression({ operator: '=' }) ||
    path.key !== 'left'
  )
    return null;

  return expression.get('right').node;
};
