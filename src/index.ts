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

(async () => {
  const [executionContextFilename, targetFilename] = process.argv.slice(2);

  const executionContext = await analyseExecutionContext(
    `fixtures/${executionContextFilename}.js`,
  );

  const evaluator = new Evaluator(`fixtures/${executionContextFilename}.js`);

  const globalState: GlobalState = {
    executionContext,
    evaluator,
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
    unmaskVariables,
    removeControlFlowFlattening,
    removeReassignments,
    inlineBlockConstants,
    decryptStrings,
    inlineBlockConstants, //Inline again after strigs are decoded
    cleanUp,
  );

  await utils.generateOutput(deofbuscatedAST, targetFilename);
  evaluator.stop();
})();
