import { File } from "@babel/types";
import { GlobalState } from "../GlobalState";
import { utils } from "../utils";
import { REPLACE_UNARY_AND_BINARY } from "./visitors/replaceUnaryAndBinary";
import { REPLACE_WITH_LITERALS } from "./visitors/replaceWithLiterals";
import { RESTORE_GLOBAL_REFERENCES } from "./visitors/restoreGlobalReferences";

export const cleanupMemberExpressions = (
  ast: File,
  globalState: GlobalState
) => {
  utils.runVisitors(
    ast,
    globalState,
    RESTORE_GLOBAL_REFERENCES,
    REPLACE_WITH_LITERALS,
    REPLACE_UNARY_AND_BINARY
  );
  return ast;
};
