import { decode as atob, encode as btoa } from "base-64"
var utf8 = require("utf8")

export class Utils {
  static fromB64ToArray(str: string): Uint8Array {
    return new Uint8Array(Buffer.from(str, "base64"))
  }

  static fromBufferToUtf8(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString("utf8")
  }

  static fromBufferToByteString(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, new Uint8Array(buffer))
  }

  static fromByteStringToArray(str: string): Uint8Array {
    const arr = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i)
    }
    return arr
  }

  static base64urlToBuffer(baseurl64String: string): ArrayBuffer {
    // Base64url to Base64
    const padding = "==".slice(0, (4 - (baseurl64String.length % 4)) % 4)
    const base64String = baseurl64String.replace(/-/g, "+").replace(/_/g, "/") + padding

    // Base64 to binary string
    const str = atob(base64String)

    // Binary string to buffer
    const buffer = new ArrayBuffer(str.length)
    const byteView = new Uint8Array(buffer)
    for (let i = 0; i < str.length; i++) {
      byteView[i] = str.charCodeAt(i)
    }
    return buffer
  }

  static bufferToBase64url(buffer: ArrayBuffer): string {
    // Buffer to binary string
    const byteView = new Uint8Array(buffer)
    let str = ""
    for (const charCode of byteView) {
      str += String.fromCharCode(charCode)
    }

    // Binary string to base64
    const base64String = btoa(str)

    // Base64 to base64url
    // We assume that the base64url string is well-formed.
    const base64urlString = base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    return base64urlString
  }

  static base64UrlToBase64(strBase64: string): string {
    return Buffer.from(Utils.base64urlToBuffer(strBase64)).toString("base64")
  }

  static base64ToBase64url(strBase64: string): string {
    return strBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  static fromByteToB64(str: string): string {
    const buffer = Buffer.from(Utils.fromByteStringToArray(str))
    return buffer.toString("base64")
  }

  static fromUtf8ToArray(str: string): Uint8Array {
    return new Uint8Array(Buffer.from(str, "utf8"))
  }

  static encodeUri(str: string): string {
    const buffer = Buffer.from(Utils.fromByteStringToArray(str))
    return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }
}
