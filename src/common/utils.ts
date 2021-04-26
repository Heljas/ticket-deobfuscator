import fs from 'fs';
import * as parser from '@babel/parser';
import {
  File,
  isBooleanLiteral,
  isNullLiteral,
  isNumericLiteral,
  isStringLiteral,
  Node,
} from '@babel/types';
import traverse, { NodePath, TraverseOptions } from '@babel/traverse';
import generate from '@babel/generator';
import { DeobfuscatorStep } from './types/DeobfuscatorStep';
import { GlobalState } from './types/GlobalState';

export const utils = {
  loadAstFromFile: async (filepath: string) => {
    const code = await fs.promises.readFile(filepath, {
      encoding: 'utf-8',
    });
    const ast = parser.parse(code);
    return ast;
  },
  runVisitors: <T>(
    ast: Node | Node[],
    state: T,
    ...visitors: TraverseOptions<T>[]
  ): T => {
    for (const visitor of visitors) {
      traverse<T>(ast, visitor, undefined, state);
    }
    return state;
  },
  runPathVisitors: <T>(
    path: NodePath,
    state: T,
    ...visitors: TraverseOptions<T>[]
  ): T => {
    for (const visitor of visitors) {
      path.traverse(visitor, state);
    }
    return state;
  },
  generateOutput: async (ast: File, outputFilename: string) => {
    const { code } = generate(ast);
    const outDir = './out';
    if (!fs.existsSync(outDir)) {
      await fs.promises.mkdir(outDir);
    }
    await fs.promises.writeFile(`${outDir}/${outputFilename}.js`, code);
  },
  isPrimitiveLiteral: (node: Node) => {
    return (
      isStringLiteral(node) ||
      isNumericLiteral(node) ||
      isBooleanLiteral(node) ||
      isNullLiteral(node)
    );
  },
  isStringOrNumericLiteral: (node: Node) => {
    return isStringLiteral(node) || isNumericLiteral(node);
  },
  isPathPrimitiveLiteral: (path: NodePath) => {
    return (
      path.isStringLiteral() ||
      path.isNumericLiteral() ||
      path.isBooleanLiteral() ||
      path.isNullLiteral()
    );
  },
  isPathStringOrNumericLiteral: (path: NodePath) => {
    return path.isStringLiteral() || path.isNumericLiteral();
  },
  regenerate: (ast: File) => {
    return parser.parse(generate(ast).code);
  },
  run: (
    ast: File,
    globalState: GlobalState,
    ...steps: DeobfuscatorStep[]
  ): File => {
    for (const step of steps) {
      ast = step(ast, globalState);
    }
    return ast;
  },
};
