import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import { CipherType, FieldType } from "core/enums"
import { ImportResult } from "core/models/domain/importResult"
import { CardView, IdentityView, LoginView } from "core/models/view"
import { CipherView } from "core/models/view/cipherView"
import { FolderView } from "core/models/view/folderView"

/**
 * Mobile port of the web vault's `convertCipherToForm`.
 *
 * Builds a comparable representation of a cipher, keeping the same fields the web uses
 * for duplicate detection — including `fields`, `folderId`, and (for logins) `uris` and
 * `fido2Credentials`.
 *
 * Mobile difference: there is no `CryptoWalletView` — crypto-wallet data is stored as
 * JSON inside `notes` (already carried by `result.notes`), so the web's CryptoWallet
 * branch (which would overwrite `notes` with `cryptoWallet.notes`) is intentionally
 * omitted; those ciphers compare on `type` + `name` + `notes` + `fields`.
 */
const convertCipherToForm = (cipher: CipherView) => {
  let result: Record<string, any> = {
    type: cipher.type,
    name: cipher.name || "",
    fields: cipher.fields?.map((f) => ({ ...f })) || [],
    folderId: cipher.folderId || "",
    notes: cipher.notes || "",
  }

  if (cipher.type === CipherType.Login) {
    result = {
      ...result,
      ...(cipher.login || new LoginView()),
      hasTotp: cipher.login?.hasTotp,
      uris: cipher.login?.uris?.map((u) => ({ uri: u.uri })) || [],
    }
  } else if (cipher.type === CipherType.Card) {
    result = {
      ...result,
      ...(cipher.card || new CardView()),
      number: cipher.card?.number || null,
      brand: cipher.card?.brand || null,
      expiration: cipher.card?.expiration || null,
      expMonth: cipher.card?.expMonth || null,
    }
  } else if (cipher.type === CipherType.Identity) {
    result = {
      ...result,
      ...(cipher.identity || new IdentityView()),
      firstName: cipher.identity?.firstName || null,
      lastName: cipher.identity?.lastName || null,
      fullName: cipher.identity?.fullName || null,
    }
  }

  return result
}

/**
 * Mobile port of the web vault's `convertCipherToImportForm`.
 *
 * Canonicalizes the form so two representations of the same item stringify equal. As in
 * the web, `folderId` and `_subTitle` are neutralized and `fido2Credentials` / `uris` /
 * `fields` are normalized.
 *
 * Added for mobile: `passwordRevisionDate` is neutralized too. The CSV importer builds a
 * fresh `LoginView` with no revision date (see `lockerCsvImporter`), so keeping it would
 * make every vault login whose password was ever changed fail to match its own CSV
 * export — exactly the "some items not detected as duplicate" symptom.
 */
const convertCipherToImportForm = (cipher: CipherView) => {
  const cipherForm: Record<string, any> = convertCipherToForm(cipher)
  return {
    ...cipherForm,
    folderId: "",
    _subTitle: null,
    passwordRevisionDate: null,
    fido2Credentials: (cipherForm.fido2Credentials || []).filter(Boolean).map((cre: any) => {
      const newCre: Record<string, string> = {}
      Object.keys(cre).forEach((key) => {
        newCre[key] = cre[key]?.toString() || ""
      })
      return newCre
    }),
    uris: (cipherForm.uris || []).filter((u: any) => !!u.uri),
    fields: (cipherForm.fields || []).map((f: any) => ({
      name: f.name || "",
      value:
        f.type === FieldType.Date && f.value ? new Date(f.value).toUTCString() : f.value || null,
    })),
  }
}

const serialize = (cipher: CipherView) => JSON.stringify(convertCipherToImportForm(cipher))

/**
 * Hook that removes duplicate items from a parsed `ImportResult` before it is
 * uploaded by `importCiphers`. A cipher is treated as a duplicate when its
 * canonical form matches an item already in the vault, or an earlier item within
 * the same import file. Folders whose name already exists are not re-created;
 * their ciphers are instead related to the existing folder.
 *
 * Returns the cleaned `ImportResult` (re-indexed) and the number of skipped ciphers.
 */
export const useCheckDuplicateImport = () => {
  const { getCiphersFromCache } = useCipherData()
  const { folderStore } = useStores()

  const checkDuplicateImport = async (
    importResult: ImportResult
  ): Promise<{ cleanedResult: ImportResult; skippedCount: number }> => {
    // 1. Canonical strings of every existing vault cipher (excl. deleted / master password).
    const currentCiphers = await getCiphersFromCache({
      deleted: false,
      searchText: "",
      filters: [(c: CipherView) => c.type !== CipherType.MasterPassword],
      includeExtensions: true,
    })
    const currentStrings = new Set(currentCiphers.map((c) => serialize(c)))

    // 2. Flag imported ciphers duplicated against the vault or earlier in the file.
    // The internal master-password item (present in a Locker self-export) is never a
    // real credential: `cleanupCipher` strips its `login`, so `encrypt` would crash on
    // `model.login.passwordRevisionDate`. Drop it here (not counted as a duplicate).
    const seen = new Set<string>()
    const skippedCipherIndices = new Set<number>()
    const excludedCipherIndices = new Set<number>()
    importResult.ciphers.forEach((cipher, index) => {
      if (cipher.type === CipherType.MasterPassword) {
        excludedCipherIndices.add(index)
        return
      }
      const key = serialize(cipher)
      if (currentStrings.has(key) || seen.has(key)) {
        skippedCipherIndices.add(index)
      } else {
        seen.add(key)
      }
    })
    const droppedCipherIndices = new Set<number>([
      ...skippedCipherIndices,
      ...excludedCipherIndices,
    ])

    // 3. Classify each imported folder: reuse an existing same-named folder, or create new.
    const existingByName = new Map<string, string>()
    folderStore.folders.forEach((f: FolderView) => {
      if (f?.name != null && !existingByName.has(f.name)) {
        existingByName.set(f.name, f.id)
      }
    })
    const folders = importResult.folders || []
    const existingFolderId = folders.map((f) => existingByName.get(f.name) ?? null)

    // 4. Rebuild the ImportResult, re-indexing ciphers, folders and relationships.
    const cipherIndexMap = new Map<number, number>()
    const newCiphers: CipherView[] = []
    importResult.ciphers.forEach((cipher, index) => {
      if (droppedCipherIndices.has(index)) return
      cipherIndexMap.set(index, newCiphers.length)
      newCiphers.push(cipher)
    })

    const folderIndexMap = new Map<number, number>()
    const newFolders: FolderView[] = []
    folders.forEach((folder, index) => {
      if (existingFolderId[index] != null) return // existing folder — do not re-create
      folderIndexMap.set(index, newFolders.length)
      newFolders.push(folder)
    })

    const newRelationships: [number, number][] = []
    ;(importResult.folderRelationships || []).forEach(([cipherIdx, folderIdx]) => {
      if (droppedCipherIndices.has(cipherIdx)) return
      const newCipherIdx = cipherIndexMap.get(cipherIdx)
      if (newCipherIdx == null) return

      const existId = existingFolderId[folderIdx]
      if (existId != null) {
        // Relate the surviving cipher directly to the pre-existing folder.
        newCiphers[newCipherIdx].folderId = existId
      } else {
        const newFolderIdx = folderIndexMap.get(folderIdx)
        if (newFolderIdx != null) newRelationships.push([newCipherIdx, newFolderIdx])
      }
    })

    const cleanedResult = new ImportResult()
    cleanedResult.success = true
    cleanedResult.ciphers = newCiphers
    cleanedResult.folders = newFolders
    cleanedResult.folderRelationships = newRelationships
    cleanedResult.collections = importResult.collections || []
    cleanedResult.collectionRelationships = importResult.collectionRelationships || []

    return { cleanedResult, skippedCount: skippedCipherIndices.size }
  }

  return { checkDuplicateImport }
}
