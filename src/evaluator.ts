import nodeCrypto from 'crypto';
import { JSDOM, DOMWindow } from 'jsdom';
import fs from 'fs';
import { Script } from 'vm';

export class Evaluator {
  private window: DOMWindow;
  private scriptPath: string;

  public constructor(filePath: string) {
    const dom = new JSDOM(``, {
      url: 'https://www.supremenewyork.com/mobile',
      referrer: 'https://www.supremenewyork.com/mobile',
      contentType: 'text/html',
      runScripts: 'outside-only',
    });

    (dom.window as any).crypto = {
      getRandomValues: (arr: Number[]) => nodeCrypto.randomBytes(arr.length),
    };
    this.window = dom.window;
    this.scriptPath = filePath;

    const originalCode = fs.readFileSync(this.scriptPath, {
      encoding: 'utf-8',
    });
    const nodePreload = 'const module = {};const require = () => class T {};';
    const script = new Script(nodePreload + originalCode);
    const vmContext = dom.getInternalVMContext();
    script.runInContext(vmContext);
  }

  public run = <T>(
    code: string,
    expectedType: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function',
  ): T | undefined => {
    try {
      const result = this.window.eval(code) as unknown;
      if (typeof result !== expectedType) return undefined;
      console.log(`${code} -> ${result}`);
      return result as T;
    } catch (ex) {
      //We probably will use typeof on result, and typeof null returns "object", so we return undefined
      console.log(`${code} -> exception ${ex}`);
      return undefined;
    }
  };

  public stop = () => {
    this.window.close();
  };
}
