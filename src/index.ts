import { Evaluator } from "./evaluator";
import { analyseExecutionContext } from "./executionContextAnalysis/analyseExecutionContext";
import { GlobalState } from "./GlobalState";
import { cleanupMemberExpressions } from "./memberExpressionsCleanup/cleanupMemberExpressions";
import { utils } from "./utils";
import { unmaskVariables } from "./variablesUnmasking/unmaskVariables";

(async () => {
  const [executionContextFilename, targetFilename] = process.argv.slice(2);

  const executionContext = await analyseExecutionContext(
    `fixtures/${executionContextFilename}.js`
  );

  const evaluator = new Evaluator(`fixtures/${executionContextFilename}.js`);

  const globalState: GlobalState = {
    executionContext,
    evaluator,
  };

  const targetAST = await utils.loadAstFromFile(
    `fixtures/${targetFilename}.js`
  );

  const parsedAst = cleanupMemberExpressions(targetAST, globalState);
  const unmasked = unmaskVariables(parsedAst, globalState);

  await utils.generateOutput(unmasked, targetFilename);
  evaluator.stop();
})();
