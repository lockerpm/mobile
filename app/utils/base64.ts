import { decode as atob, encode as btoa } from "base-64"

export class Base64 {
  static fromB64ToArray(str: string): Uint8Array {
    const binary = atob(str)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i)
    }
    return array
  }

  static fromBufferToUtf8(buffer: ArrayBuffer): string {
    return new TextDecoder("utf-8").decode(buffer)
  }

  static fromBufferToByteString(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    return String.fromCharCode(...bytes)
  }

  static fromByteStringToArray(str: string): Uint8Array {
    const arr = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i)
    }
    return arr
  }

  static base64urlToBuffer(baseurl64String: string): ArrayBuffer {
    const padding = "==".slice(0, (4 - (baseurl64String.length % 4)) % 4)
    const base64String = baseurl64String.replace(/-/g, "+").replace(/_/g, "/") + padding
    const binary = atob(base64String)
    const buffer = new ArrayBuffer(binary.length)
    const view = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i)
    }
    return buffer
  }

  static bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  }

  static base64UrlToBase64(strBase64: string): string {
    const padding = "==".slice(0, (4 - (strBase64.length % 4)) % 4)
    return strBase64.replace(/-/g, "+").replace(/_/g, "/") + padding
  }

  static base64ToBase64url(strBase64: string): string {
    return strBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  }

  static fromByteToB64(str: string): string {
    let binary = ""
    for (let i = 0; i < str.length; i++) {
      binary += String.fromCharCode(str.charCodeAt(i))
    }
    return btoa(binary)
  }

  static fromUtf8ToArray(str: string): Uint8Array {
    return new TextEncoder().encode(str)
  }

  static encodeUri(str: string): string {
    const bytes = new TextEncoder().encode(str)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  }
}
