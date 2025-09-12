import { Fido2Utils } from "./fido2-utils"
import { guidToRawFormat } from "./guid-utils"

export function parseCredentialId(encodedCredentialId: string): Uint8Array<ArrayBuffer> | null {
  try {
    if (encodedCredentialId.startsWith("b64.")) {
      return Fido2Utils.stringToBuffer(encodedCredentialId.slice(4))
    }

    return guidToRawFormat(encodedCredentialId)
  } catch {
    return null
  }
}

/**
 * Compares two credential IDs for equality.
 */
export function compareCredentialIds(
  a: Uint8Array<ArrayBuffer> | null,
  b: Uint8Array<ArrayBuffer> | null
): boolean {
  if (a == null || b == null) {
    return false
  }
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}
