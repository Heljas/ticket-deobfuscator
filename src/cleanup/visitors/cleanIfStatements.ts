import { NodePath, Visitor } from '@babel/traverse';
import { IfStatement } from '@babel/types';
import { GlobalState } from '../../common/types/GlobalState';

export const CLEAN_IF_STATEMENTS: Visitor<GlobalState> = {
  IfStatement: function (path: NodePath<IfStatement>) {
    const test = path.get('test');
    if (!test.isBooleanLiteral()) return;
    const testValue = test.node.value;
    const consequent = path.get('consequent');
    const alternate = path.get('alternate');

    const replacement = testValue ? consequent : alternate;

    if (!replacement.node) {
      path.remove();
      return;
    }

    if (replacement.isBlockStatement()) {
      const replacementBody = replacement.get('body');
      path.replaceWithMultiple(replacementBody.map((path) => path.node));
    } else {
      path.replaceWith(replacement);
    }
  },
};
