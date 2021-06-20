import traverse, { NodePath, Visitor } from '@babel/traverse';
import {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  FunctionExpression,
  isProgram,
  VariableDeclarator,
} from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';
import { utils } from '../../common/utils';
import { EncryptionMethod } from '../types/EncryptionMethod';
import { EvalDecoder } from '../types/EvalDecoder';

export const FIND_AND_DECODE_EVALS: Visitor<GlobalState> = {
  CallExpression: function (
    path: NodePath<CallExpression>,
    state: GlobalState,
  ) {
    const callee = path.get('callee');
    if (!callee.isFunctionExpression()) return;
    const args = path.get('arguments');
    if (args.length !== 1) return;
    const [uriPath] = args;
    if (!uriPath.isStringLiteral()) return;
    const functionParams = callee.get('params');
    if (functionParams.length !== 1) return;
    const [uriParam] = functionParams;

    if (!uriParam.isIdentifier()) return;
    if (uriPath.node.value.length < 16) return;

    const encryptionDetails: {
      uriIdentifierName: string;
      callPath: NodePath<CallExpression> | null;
      method: EncryptionMethod | null;
    } = {
      uriIdentifierName: uriParam.node.name,
      callPath: null,
      method: null,
    };

    callee.get('body').traverse(
      {
        Identifier(path, state) {
          if (path.node.name !== state.uriIdentifierName) return;

          const declarator = path.findParent((p) => p.isVariableDeclarator());
          if (!declarator || !declarator.isVariableDeclarator()) return;
          const init = declarator.get('init');
          if (!init.isCallExpression()) return;
          const argsAmount = init.get('arguments').length;

          state.method =
            argsAmount === 3 ? EncryptionMethod.V1 : EncryptionMethod.V2;
          state.callPath = init;
        },
      },
      encryptionDetails,
    );

    if (encryptionDetails.method === null || !encryptionDetails.callPath)
      return;

    const decryptionFunctions = {
      [EncryptionMethod.V1]: decryptV1,
      [EncryptionMethod.V2]: decryptV2,
    };

    const encodedURI = uriPath.node.value;
    const encoderFunctionString = callee.toString();
    let decodedEvalString = decryptionFunctions[encryptionDetails.method](
      encodedURI,
      encoderFunctionString,
      encryptionDetails.callPath,
    );

    if (!decodedEvalString) return;

    /*
      * Sometimes JScrambler uses Function constructor instead of eval:
        new Function(`return (function() {
            return function(P2s, R2s) {
                var P6v = [arguments];;
            };
        })()`)();
      * if that's the case we need to remove "return " from the beginning
    */
    if (decodedEvalString.startsWith('return ')) {
      decodedEvalString = decodedEvalString.replace('return ', '');
    }

    const evalAst = utils.astFromString(decodedEvalString);
    traverse(evalAst, {
      FunctionExpression(evalTraversePath: NodePath<FunctionExpression>) {
        const parent = evalTraversePath.parentPath;
        if (!parent.isReturnStatement()) return;
        const outerStatement = parent.getFunctionParent()?.getStatementParent();
        if (!isProgram(outerStatement?.parent)) return;
        path.replaceWith(evalTraversePath);
      },
    });
  },
};

const decryptV1 = (
  encodedURI: string,
  encoderFunctionString: string,
  callPath: NodePath<CallExpression>,
) => {
  const args = callPath.get('arguments');
  const seedsAmountPath = args[2];
  if (!seedsAmountPath.isNumericLiteral()) return;
  const seedsAmount = seedsAmountPath.node.value;
  return EvalDecoder.decodeV1(encodedURI, encoderFunctionString, seedsAmount);
};

const decryptV2 = (
  encodedURI: string,
  encoderFunctionString: string,
  callPath: NodePath<CallExpression>,
) => {
  const functionParent = callPath.getFunctionParent();
  if (!functionParent) return;

  let variableName: string | null = null;
  functionParent.traverse({
    BinaryExpression(path: NodePath<BinaryExpression>) {
      if (path.node.operator !== '^') return;
      if (!path.parentPath.isBinaryExpression({ operator: '^' })) return;
      const right = path.get('right');
      if (!right.isIdentifier()) return;
      variableName = right.node.name;
    },
  });

  if (!variableName) return;

  let initial: number | null = null;
  let increment: number | null = null;
  let modulo: number | null = null;
  functionParent.traverse({
    AssignmentExpression(path: NodePath<AssignmentExpression>) {
      const left = path.get('left');
      if (!left.isIdentifier({ name: variableName })) return;
      const right = path.get('right');
      if (!right.isNumericLiteral()) return;
      const operator = path.node.operator;
      const value = right.node.value;
      if (operator === '+=') {
        increment = value;
      } else if (operator === '%=') {
        modulo = value;
      }
    },
    VariableDeclarator(path: NodePath<VariableDeclarator>) {
      const id = path.get('id');
      if (!id.isIdentifier({ name: variableName })) return;
      const init = path.get('init');
      if (!init.isNumericLiteral()) return;
      initial = init.node.value;
    },
  });

  if (initial === null || increment === null || modulo === null) return;
  return EvalDecoder.decodeV2(
    encodedURI,
    encoderFunctionString,
    initial,
    increment,
    modulo,
  );
};
