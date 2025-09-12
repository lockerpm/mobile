export class Utils {
  static fromB64ToArray(str: string): Uint8Array<ArrayBuffer> | null {
    if (str == null) {
      return null
    }

    const binaryString = atob(str)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  static fromUrlB64ToArray(str: string): Uint8Array<ArrayBuffer> | null {
    return Utils.fromB64ToArray(Utils.fromUrlB64ToB64(str))
  }

  static fromHexToArray(str: string): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(str.length / 2)
    for (let i = 0; i < str.length; i += 2) {
      bytes[i / 2] = parseInt(str.substr(i, 2), 16)
    }
    return bytes
  }

  static fromUtf8ToArray(str: string): Uint8Array<ArrayBuffer> {
    const strUtf8 = unescape(encodeURIComponent(str))
    const arr = new Uint8Array(strUtf8.length)
    for (let i = 0; i < strUtf8.length; i++) {
      arr[i] = strUtf8.charCodeAt(i)
    }
    return arr
  }

  static fromByteStringToArray(str: string): Uint8Array<ArrayBuffer> | null {
    if (str == null) {
      return null
    }
    const arr = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i)
    }
    return arr
  }

  static fromBufferToB64(buffer: ArrayBuffer): string | null {
    if (buffer == null) {
      return null
    }

    let binary = ""
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  static fromBufferToUrlB64(buffer: ArrayBuffer): string {
    return Utils.fromB64toUrlB64(Utils.fromBufferToB64(buffer)!)
  }

  static fromB64toUrlB64(b64Str: string) {
    return b64Str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  /**
   * Converts a hex string to an ArrayBuffer.
   * Note: this doesn't need any Node specific code as parseInt() / ArrayBuffer / Uint8Array
   * work the same in Node and the browser.
   * @param {string} hexString - A string of hexadecimal characters.
   * @returns {ArrayBuffer} The ArrayBuffer representation of the hex string.
   */
  static hexStringToArrayBuffer(hexString: string): ArrayBuffer {
    // Check if the hexString has an even length, as each hex digit represents half a byte (4 bits),
    // and it takes two hex digits to represent a full byte (8 bits).
    if (hexString.length % 2 !== 0) {
      throw "HexString has to be an even length"
    }

    // Create an ArrayBuffer with a length that is half the length of the hex string,
    // because each pair of hex digits will become a single byte.
    const arrayBuffer = new ArrayBuffer(hexString.length / 2)

    // Create a Uint8Array view on top of the ArrayBuffer (each position represents a byte)
    // as ArrayBuffers cannot be edited directly.
    const uint8Array = new Uint8Array(arrayBuffer)

    // Loop through the bytes
    for (let i = 0; i < uint8Array.length; i++) {
      // Extract two hex characters (1 byte)
      const hexByte = hexString.substr(i * 2, 2)

      // Convert hexByte into a decimal value from base 16. (ex: ff --> 255)
      const byteValue = parseInt(hexByte, 16)

      // Place the byte value into the uint8Array
      uint8Array[i] = byteValue
    }

    return arrayBuffer
  }

  static fromUrlB64ToB64(urlB64Str: string): string {
    let output = urlB64Str.replace(/-/g, "+").replace(/_/g, "/")
    switch (output.length % 4) {
      case 0:
        break
      case 2:
        output += "=="
        break
      case 3:
        output += "="
        break
      default:
        throw new Error("Illegal base64url string!")
    }

    return output
  }

  static fromUtf8ToUrlB64(utfStr: string): string {
    return Utils.fromBufferToUrlB64(Utils.fromUtf8ToArray(utfStr).buffer)
  }

  // ref: http://stackoverflow.com/a/2117523/1090359
  static newGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  static guidRegex = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/

  static isGuid(id: string) {
    return RegExp(Utils.guidRegex, "i").test(id)
  }

  static isNullOrWhitespace(str: string): boolean {
    return str == null || typeof str !== "string" || str.trim() === ""
  }

  static isNullOrEmpty(str: string | null): boolean {
    return str == null || typeof str !== "string" || str == ""
  }

  static isPromise(obj: any): obj is Promise<unknown> {
    return (
      obj != undefined && typeof obj["then"] === "function" && typeof obj["catch"] === "function"
    )
  }

  static nameOf<T>(name: string & keyof T) {
    return name
  }

  static iterateEnum<O extends object, K extends keyof O = keyof O>(obj: O) {
    return (Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[]).map((k) => obj[k])
  }

  static camelToPascalCase(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
}

export function checkForAbort(abortController?: AbortController): void {
  if (!abortController || !abortController.signal) {
    return
  }
  if (abortController.signal.aborted) {
    throw new DOMException("The operation either timed out or was not allowed.", "AbortError")
  }
}
