import { MurmurHash } from './MurmurHash';

export class EvalDecoder {
  public static decodeV1(
    uri: string,
    encoderFunctionString: string,
    seedsAmount: number,
  ) {
    const decodedUri = decodeURIComponent(uri);
    const functionHash = MurmurHash.generateFrom(
      this.formatFunctionString(encoderFunctionString),
    );
    let result = '';

    const seeds = [functionHash.toString()];
    let seedIndex = 0;
    let currentSeedLength = seeds[seedIndex].length;
    let seedPosition = 0;

    for (let i = decodedUri.length - 1; i >= 0; i--) {
      if (seedPosition === currentSeedLength) {
        seedPosition = 0;
        if (++seedIndex === seedsAmount) {
          seedIndex = 0;
        }
        if (seeds.length < seedsAmount) {
          seeds[seedIndex] = MurmurHash.generateFrom(
            seeds[seedIndex - 1],
          ).toString();
        }
        currentSeedLength = seeds[seedIndex].length;
      }

      result =
        String.fromCharCode(
          decodedUri.charCodeAt(i) ^ seeds[seedIndex].charCodeAt(seedPosition),
        ) + result;

      seedPosition++;
    }
    return result;
  }

  public static decodeV2(
    uri: string,
    encoderFunctionString: string,
    initial: number,
    increment: number,
    modulo: number,
  ) {
    const decodedUri = decodeURIComponent(uri);
    const functionHash = MurmurHash.generateFrom(
      this.formatFunctionString(encoderFunctionString),
    ).toString();

    let result = '';
    let enc = initial;

    for (let i = 0; i < decodedUri.length; i++) {
      const currentChar = decodedUri.charCodeAt(i);
      const charModulo = currentChar % 256;

      const modifier = (currentChar - charModulo) / 256;
      var hashChar = functionHash.charCodeAt(i % functionHash.length);
      var offset = charModulo ^ enc ^ hashChar;

      enc += increment;
      enc %= modulo;
      result += String.fromCharCode(modifier * 256 + offset);
    }

    return result;
  }

  private static formatFunctionString(functionString: string) {
    return functionString
      .replace(/\(|\)/g, '')
      .replace(
        /^(function [0-9a-zA-Z_$]+\([0-9a-zA-Z_$]+,\s*[0-9a-zA-Z_$]+\)\s*\{)\s*("use strict";)([\s\S]*)$/,
        '$1$3',
      )
      .replace(/[\s]+/g, '');
  }
}
