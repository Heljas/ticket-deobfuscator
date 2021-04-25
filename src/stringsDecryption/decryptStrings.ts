import { File } from "@babel/types";
import { GlobalState } from "../GlobalState";
import { utils } from "../utils";
import { EVALUATE_ENCRYPT_FUNCTIONS } from "./visitors/evaluateEncryptFunctions";

export const decryptStrings = (ast: File, globalState: GlobalState) => {
  utils.runVisitors(ast, globalState, EVALUATE_ENCRYPT_FUNCTIONS);
  return ast;
};
