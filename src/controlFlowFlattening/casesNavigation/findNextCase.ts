import { ObfuscatedBlock } from '../obfuscatedBlock';
import { NodePath } from '@babel/traverse';
import { CFF } from '../CFFTypes';
import * as t from '@babel/types';

export const FIND_NEXT_CASE = {
  AssignmentExpression(path: NodePath, state: ObfuscatedBlock) {
    const { steps, discriminant } = state;
    if (!t.isAssignmentExpression(path.node, { operator: '=' })) return;
    if (!t.isIdentifier(path.node.left, { name: discriminant })) return;

    const currentStep = state.getCurrentStep();

    const rightExpression = path.get('right') as NodePath;
    if (t.isMemberExpression(rightExpression) || t.isNumericLiteral(rightExpression)) {
      const nextCase = rightExpression.toString();

      const [currentBlock] = currentStep.blocks;

      if (
        currentBlock &&
        currentBlock.isConsequent &&
        state.globalState.evaluator.areEqual(currentBlock.endCase, nextCase)
      ) {
        console.log('[MERGED IF STATEMENT]' + currentBlock.condition);
        state.mergeBlocks();
      }

      steps.push({
        case: nextCase,
        blocks: currentStep.blocks,
        visited: false,
        nodes: currentStep.nodes,
        isConsequent: currentStep.isConsequent,
        caseNode: null,
      });
      return;
    }

    if (!t.isConditionalExpression(rightExpression)) return;

    const condition = rightExpression.get('test') as NodePath<t.BinaryExpression>;
    const endCase = rightExpression.get('alternate').toString();
    const consequentCase = rightExpression.get('consequent').toString();

    if (state.hasDynamicIdentifiers(rightExpression)) {
      const conditionString = state.replaceDynamicIdentifiers(condition.toString());
      console.log('[DYNAMIC IDENTIFIERS] ' + condition.toString() + ' -> ' + conditionString);
      const result = state.globalState.evaluator.run<boolean>(conditionString, 'boolean');
      if (typeof result !== 'boolean') return;
      const nextCase = result ? consequentCase : endCase;
      const [currentBlock] = currentStep.blocks;
      if (
        currentBlock &&
        currentBlock.isConsequent &&
        state.globalState.evaluator.areEqual(currentBlock.endCase, nextCase)
      ) {
        console.log('[MERGED IF STATEMENT]');
        state.mergeBlocks();
      }
      steps.push({
        case: nextCase,
        blocks: currentStep.blocks,
        visited: false,
        nodes: currentStep.nodes,
        isConsequent: currentStep.isConsequent,
        caseNode: null,
      });
      return;
    }

    let isValidLoopCondition = true;

    if (currentStep.blocks.length > 0) {
      let nestedBlockIndex = currentStep.blocks.findIndex((block) => block.condition === condition.toString());
      if (nestedBlockIndex >= 0) isValidLoopCondition = !t.isMemberExpression(condition);
      const nestedNode = currentStep.nodes[nestedBlockIndex];

      if (nestedBlockIndex >= 0 && isValidLoopCondition) {
        if (t.isIfStatement(nestedNode)) {
          const body = nestedNode.consequent;
          const test = nestedNode.test;
          const whileLoop = t.whileStatement(test, body);
          currentStep.nodes[nestedBlockIndex] = whileLoop;
        }

        if (
          nestedBlockIndex === 0 ||
          (!currentStep.blocks[0].isConsequent && currentStep.blocks[0].isValidLoop) ||
          isNestedBlockExit(currentStep, nestedBlockIndex, nestedNode)
        ) {
          if (nestedBlockIndex !== 0)
            console.log('[FINAL TO WHILE] ' + condition.toString() + ' . Nested: ' + nestedBlockIndex);
          // console.log("before merge: " + currentStep.blocks[0].condition);
          //while (!t.isWhileStatement(currentStep.nodes[0])) {
          while (!t.isWhileStatement(state.getCurrentNode())) {
            state.mergeBlocks();
            //nestedBlockIndex--;
          }
          state.exitLoop();
        } else {
          if (currentStep.blocks[0].isConsequent) {
            console.log('[HIT ALTERNATE]going to alternate!: ' + currentStep.blocks[0].condition);
            state.goToAlternate();
          }
        }
        return;
      }
    }

    const initIdentifiers = JSON.parse(JSON.stringify(state.dynamicIdentifiers)) as CFF.DynamicIdentifier[];

    console.log('[New Block] ' + condition.toString());
    const newBlock = {
      endCase,
      condition: condition.toString(),
      testNode: condition,
      isConsequent: true,
      dynamicIdentifiers: initIdentifiers,
      isValidLoop: isValidLoopCondition,
    };

    const newNode = t.ifStatement(condition.node, t.blockStatement([]), t.blockStatement([]));

    steps.push({
      case: consequentCase,
      blocks: [newBlock, ...currentStep.blocks],
      visited: false,
      nodes: [newNode, ...currentStep.nodes],
      isConsequent: true,
      caseNode: null,
    });
  },
};

const isNestedBlockExit = (currentStep: CFF.Step, nestedBlockIndex: number, nestedNode: t.Node) => {
  return (
    currentStep.blocks[nestedBlockIndex].isConsequent &&
    !currentStep.blocks[0].isConsequent &&
    !currentStep.blocks[1].isConsequent &&
    !t.isIfStatement(nestedNode)
  );
};
