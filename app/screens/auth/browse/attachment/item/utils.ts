/**
 * Converts bytes to a human-readable format (KB, MB).
 * @param bytes - The number of bytes.
 * @returns A string representing the size in KB or MB.
 */
export function convertBytes(bytes: number): string {
  const kb = bytes / 1024
  const mb = kb / 1024

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`
  } else {
    return `${kb.toFixed(2)} KB`
  }
}
