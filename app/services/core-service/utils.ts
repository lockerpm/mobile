export class Utils {
  static fromB64ToArray(str: string): Uint8Array {
    return new Uint8Array(Buffer.from(str, 'base64'));
  }

  static fromBufferToUtf8(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString('utf8');
  }

  static fromBufferToByteString(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  static fromByteStringToArray(str: string): Uint8Array {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i);
    }
    return arr;
  }

  static fromUtf8ToArray(str: string): Uint8Array {
    return new Uint8Array(Buffer.from(str, 'utf8'));
  }
}
