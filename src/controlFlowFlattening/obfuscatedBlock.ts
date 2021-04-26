import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { CFF } from './CFFTypes';

import { GET_INITIAL_VALUE } from './initialization/getInitialValue';
import { GET_ALL_CASES } from './initialization/getAllCases';

import { FIND_DYNAMIC_IDENTIFIERS } from './dynamicIdentifiers/findDynamicIdentifiers';
import { addToDynamicIdentifiers } from './dynamicIdentifiers/findDynamicIdentifiers';
import { updateDynamicIdentifiers } from './dynamicIdentifiers/updateDynamicIdentifiers';
import { replaceDynamicIdentifiers } from './dynamicIdentifiers/replaceDynamicIdentifiers';
import { restoreDynamicIdentifiers } from './dynamicIdentifiers/restoreDynamicIdentifiers';
import { hasDynamicIdentifiers } from './dynamicIdentifiers/hasDynamicIdentifiers';

import { followPath } from './casesNavigation/followPath';
import { exitLoop } from './casesNavigation/exitLoop';
import { goToAlternate } from './casesNavigation/goToAlternate';

import { addToContainer } from './blocksOperations/addToContainer';
import { mergeBlocks } from './blocksOperations/mergeBlocks';
import { isDiscriminantAssignment } from './blocksOperations/isDiscriminantAssignment';
import { removeDuplicateNodes } from './blocksOperations/removeDuplicateNodes';
import { replaceWithFinalNode } from './blocksOperations/replaceWithFinalNode';
import { GlobalState } from '../common/types/GlobalState';

export class ObfuscatedBlock {
  discriminantDeclarator: NodePath<t.VariableDeclarator> | null = null;
  initialValue: string = '';
  cases: NodePath<t.SwitchCase>[] = [];
  steps: CFF.Step[] = [];
  dynamicIdentifiers: CFF.DynamicIdentifier[] = [];
  exception?: boolean;

  constructor(
    public readonly path: NodePath<t.ForStatement>,
    public discriminant: string,
    public readonly globalState: GlobalState,
  ) {
    this.path.parentPath.traverse<ObfuscatedBlock>(GET_INITIAL_VALUE, this);
    if (!this.initialValue) return;
    this.path.traverse<ObfuscatedBlock>(GET_ALL_CASES, this);
    this.path.traverse<ObfuscatedBlock>(FIND_DYNAMIC_IDENTIFIERS, this);

    //* Follow initial case
    this.steps.push({
      case: this.initialValue,
      blocks: [],
      visited: false,
      nodes: [t.blockStatement([])],
      isConsequent: true,
      caseNode: null,
    });
    this.followPath();
  }

  public getCurrentStep = () => {
    return this.steps[this.steps.length - 1];
  };

  public getCurrentBlock = () => {
    const currentStep = this.getCurrentStep();
    if (currentStep.blocks.length === 0) return null;
    return currentStep.blocks[0];
  };

  public getCurrentNode = () => {
    const currentStep = this.getCurrentStep();
    return currentStep.nodes[0];
  };

  //* Dynamic Identifiers
  public addToDynamicIdentifiers = addToDynamicIdentifiers;
  public updateDynamicIdentifiers = updateDynamicIdentifiers;
  public replaceDynamicIdentifiers = replaceDynamicIdentifiers;
  public restoreDynamicIdentifiers = restoreDynamicIdentifiers;
  public hasDynamicIdentifiers = hasDynamicIdentifiers;

  //* Cases Navigation
  public followPath = followPath;
  public goToAlternate = goToAlternate;
  public exitLoop = exitLoop;

  //* Blocks Operations
  public addToContainer = addToContainer;
  public mergeBlocks = mergeBlocks;
  public isDiscriminantAssignment = isDiscriminantAssignment;
  public removeDuplicateNodes = removeDuplicateNodes;
  public replaceWithFinalNode = replaceWithFinalNode;
}
