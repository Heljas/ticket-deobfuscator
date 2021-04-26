import { Scope } from '@babel/traverse';

const getRandomString = (): string => {
  const length = Math.floor(Math.random() * 3) + 3;
  const randomString = Math.random().toString(36).replace(/\d/g, '').substr(2, length) || 'x';
  if (isValidIdentifier(randomString)) return randomString;
  return getRandomString();
};

const isValidIdentifier = (identifier: string) => {
  try {
    eval(`const ${identifier} = 1`);
  } catch {
    return false;
  }
  return true;
};

export const generateIdentifier = (scope: Scope): string => {
  const randomString = getRandomString();
  const { name } = scope.generateUidIdentifier(randomString);
  if (name.indexOf('temp') >= 0) return generateIdentifier(scope);
  return name.replace(/_/, '');
};
