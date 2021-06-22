import { removeControlFlowFlattening } from './controlFlowFlattening/removeControlFlowFlattening';
import { Evaluator } from './common/evaluator';
import { analyseExecutionContext } from './analyseExecutionContext/analyseExecutionContext';
import { GlobalState } from './common/types/GlobalState';
import { inlineBlockConstants } from './inlineBlockConstants/inlineBlockConstants';
import { inlineGlobalConstants } from './inlineGlobalConstants/inlineGlobalConstants';
import { decryptStrings } from './decryptStrings/decryptStrings';
import { utils } from './common/utils';
import { unmaskVariables } from './unmaskVariables/unmaskVariables';
import { cleanUp } from './cleanup/cleanup';
import { controlFlowFlattening } from './controlFlowFlatteningRefactor/controlFlowFlattening';
import { decryptStringArrays } from './decryptStringArrays/decryptStringArrays';
import { EvalDecoder } from './restoreEvalsContents/types/EvalDecoder';
import { restoreEvalsContents } from './restoreEvalsContents/restoreEvalsContents';

(async () => {
  const start = Date.now();
  const [executionContextFilename, targetFilename] = process.argv.slice(2);

  const executionContext = await analyseExecutionContext(
    `fixtures/${executionContextFilename}.js`,
  );

  const evaluator = new Evaluator(`fixtures/${executionContextFilename}.js`);

  const globalState: GlobalState = {
    executionContext,
    evaluator,
    errors: [],
  };

  const sourceAST = await utils.astFromFile(`fixtures/${targetFilename}.js`);

  const deofbuscatedAST = utils.run(
    sourceAST,
    globalState,
    //* Steps *
    // restoreEvalsContents,
    // inlineGlobalConstants,
    inlineBlockConstants, //Inline variables used to index masked variables
    // controlFlowFlattening,
    // // decryptStringArrays,
    // unmaskVariables,
    // // // // // removeControlFlowFlattening,
    // inlineBlockConstants,
    // decryptStrings,
    // inlineBlockConstants, //Inline again after strigs are decoded
    // cleanUp,
  );

  await utils.generateOutput(deofbuscatedAST, targetFilename);
  evaluator.stop();
  console.log(`Finished in ${Date.now() - start}ms`);
})();

/*

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "ast-transform", // not required
    visitor: {
      CallExpression(path) {
        const callee = path.get("callee");
        if (!callee.isMemberExpression()) return;
        if (!callee.get("object").isIdentifier({ name: "g4Kv" })) return;
        if (!callee.get("property").isIdentifier({ name: "K3G" }) && !callee.get("property").isIdentifier({ name: "B3G" }))
          return;
        const indexes = [];
        let last = path;
        let current = path.parentPath;
        while (current.isMemberExpression()) {
          const property = current.get("property");
          if (property.isNumericLiteral()) {
            indexes.push(property.node.value);
          }
          last = current;
          current = current.parentPath;
        }
        console.log(last.toString());
        console.log(indexes);
        last.replaceWith(t.numericLiteral(69));
      }
    }
  };
}
*/
