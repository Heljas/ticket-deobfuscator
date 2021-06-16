import { removeControlFlowFlattening } from './controlFlowFlattening/removeControlFlowFlattening';
import { Evaluator } from './common/evaluator';
import { analyseExecutionContext } from './analyseExecutionContext/analyseExecutionContext';
import { GlobalState } from './common/types/GlobalState';
import { inlineBlockConstants } from './inlineBlockConstants/inlineBlockConstants';
import { inlineGlobalConstants } from './inlineGlobalConstants/inlineGlobalConstants';
import { decryptStrings } from './decryptStrings/decryptStrings';
import { utils } from './common/utils';
import { unmaskVariables } from './unmaskVariables/unmaskVariables';
import { removeReassignments } from './removeReassignments/removeReassignments';
import { cleanUp } from './cleanup/cleanup';
import { controlFlowFlattening } from './controlFlowFlatteningRework/controlFlowFlattening';

(async () => {
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

  const sourceAST = await utils.loadAstFromFile(
    `fixtures/${targetFilename}.js`,
  );

  const deofbuscatedAST = utils.run(
    sourceAST,
    globalState,
    //* Steps *
    inlineGlobalConstants,
    inlineBlockConstants, //Inline variables used to index masked variables
    controlFlowFlattening,
    // unmaskVariables,
    // removeControlFlowFlattening,
    // removeReassignments,
    // inlineBlockConstants,
    // decryptStrings,
    // inlineBlockConstants, //Inline again after strigs are decoded
    // cleanUp,
  );

  console.log(globalState.errors);

  await utils.generateOutput(deofbuscatedAST, targetFilename);
  evaluator.stop();
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
