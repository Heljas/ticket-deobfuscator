import { Node, NodePath } from '@babel/traverse';

export interface ConditionalBlock {
  condition: NodePath<Node>;
  consequentCase: NodePath<Node>;
  alternateCase: NodePath<Node>;
  consequentNodes: NodePath<Node>[];
  alternateNodes: NodePath<Node>[];
  inConsequent: boolean;
  isLoop: boolean;
}
