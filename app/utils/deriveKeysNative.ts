import { cryptoFunctionService } from "@/services/coreService"

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes.buffer
}

function toBase64(bytes: Uint8Array | ArrayBuffer): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return Buffer.from(arr).toString("base64")
}

export async function deriveKeysNative(
  masterPassword: string,
  email: string // used as salt (Bitwarden-style)
) {
  const saltStr = email.toLowerCase().trim()

  // 1️⃣ Argon2id → master key (32 bytes)
  const result = await cryptoFunctionService.argon2(masterPassword, saltStr, {
    iterations: 3,
    memory: 64 * 1024,
    parallelism: 4,
    hashLength: 32,
    mode: "argon2id",
  })
  const masterKey = hexToArrayBuffer(result.rawHash)
  console.log("Derived master key (hex):", result.rawHash)

  // 2️⃣ HKDF-SHA256 expand → 64 bytes (stretched key)
  const stretchedKey = await cryptoFunctionService.hkdf(masterKey, saltStr, "", 64, "sha256")

  // 3️⃣ Split into subkeys
  const encKey = stretchedKey.slice(0, 32) // AES-256 key
  const macKey = stretchedKey.slice(32, 64) // HMAC key

  // 4️⃣ Authentication hash
  const authHash = await cryptoFunctionService.hash(masterKey, "sha256")

  return {
    masterKey, // 32 bytes
    encKey, // 32 bytes
    macKey, // 32 bytes
    authHash, // 32 bytes
  }
}

export async function checkArgon2() {
  const start2 = performance.now()

  const keys2 = await deriveKeysNative("4*AqWvr6$Kby", "duchm@cystack.net")

  const elapsedMs2 = performance.now() - start2
  console.log("masterKey:", toBase64(keys2.masterKey))
  console.log("encKey:   ", toBase64(keys2.encKey))
  console.log("macKey:   ", toBase64(keys2.macKey))
  console.log("authHash: ", toBase64(keys2.authHash))
  console.log(`Time taken: ${elapsedMs2.toFixed(2)} ms`)
}
