import { NodePath } from '@babel/traverse';

export function getPrevSibling(path: NodePath): NodePath {
  // @ts-expect-error
  return path.getSibling(path.key - 1);
}

export function getNextSibling(path: NodePath): NodePath {
  // @ts-expect-error
  return path.getSibling(path.key + 1);
}
