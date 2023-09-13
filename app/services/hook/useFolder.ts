import { useStores } from 'app/models'
import { useCoreService } from '../core-service'
import { useCipherData } from './useCipherData'
import { useHelper } from './useHelper'
import { Utils } from '../core-service/utils'
import { EncString, SymmetricCryptoKey } from 'core/models/domain'
import { AccountRoleText } from 'app/config/types'
import { FolderView } from 'core/models/view/folderView'
import { CipherView } from 'core/models/view'
import { Alert } from 'react-native'
import { translate } from 'app/i18n'
import { CipherRequest } from 'core/models/request'
import { Logger } from 'app/utils/utils'
import { CollectionView } from 'core/models/view/collectionView'

export function useFolder() {
  const { cipherStore, folderStore, collectionStore, enterpriseStore, user } = useStores()
  const { cipherService, cryptoService } = useCoreService()
  const { getCiphers, reloadCache } = useCipherData()
  const { notify, notifyApiError } = useHelper()

  const _generateMemberKey = async (publicKey: string, orgKey: SymmetricCryptoKey) => {
    const pk = Utils.fromB64ToArray(publicKey)
    const key = await cryptoService.rsaEncrypt(orgKey.key, pk.buffer)
    return key.encryptedString
  }

  const _shareFolderToGroups = async (
    orgKey: SymmetricCryptoKey,
    groups: { id: string; name: string }[]
  ) => {
    return await Promise.all(
      groups.map(async (group) => {
        const groupMemberRes = await enterpriseStore.getListGroupMembers(group.id)
        if (groupMemberRes.kind !== 'ok') {
          return null
        }
        const members = await Promise.all(
          groupMemberRes.data.members
            ?.filter((e) => e.email !== user.email)
            ?.map(async (member) => {
              return {
                username: member.email,
                key: member.public_key ? await _generateMemberKey(member.public_key, orgKey) : null,
              }
            })
        )
        return {
          id: group.id,
          role: 'member',
          members,
        }
      })
    )
  }

  // Share Folder
  const shareFolder = async (
    folder: FolderView,
    emails: string[],
    role: AccountRoleText,
    autofillOnly: boolean,
    groups?: { id: string; name: string }[]
  ) => {
    if (!folder || (!emails.length && !groups.length)) {
      return { kind: 'ok' }
    }

    const ciphers: CipherView[] =
      (await getCiphers({
        deleted: false,
        searchText: '',
        filters: [(c: CipherView) => c.folderId === folder.id],
      })) || []

    try {
      if (ciphers.some((c) => c.organizationId)) {
        Alert.alert(
          translate('error.share_folder'),
          translate('shares.share_folder.error_share_item'),
          [
            {
              text: 'OK',
            },
          ]
        )
        return { kind: 'ok' }
      }
      // Prepare org key
      const shareKey: [EncString, SymmetricCryptoKey] = await cryptoService.makeShareKey()
      const orgKey: SymmetricCryptoKey = shareKey[1]

      // Get public keys
      const members = await Promise.all(
        emails.map(async (email) => {
          const publicKeyRes = await cipherStore.getSharingPublicKey(email)
          let publicKey = ''
          if (publicKeyRes.kind === 'ok') {
            publicKey = publicKeyRes.data.public_key
          }
          return {
            username: email,
            role,
            hide_passwords: autofillOnly,
            key: publicKey ? await _generateMemberKey(publicKey, orgKey) : null,
          }
        })
      )

      // Prepare cipher..  CipherRequest & { id: string }
      type ShareCipher = CipherRequest & { id: string }
      const sharedCiphers: ShareCipher[] = []

      const prepareCipher = async (c: CipherView) => {
        const cipherEnc = await cipherService.encrypt(c, orgKey)
        const data = new CipherRequest(cipherEnc)
        sharedCiphers.push({
          id: c.id,
          ...data,
        })
      }
      await Promise.all(ciphers.map(prepareCipher))

      // Prepare folder name
      const folderNameEnc = await cryptoService.encrypt(folder.name, orgKey)

      // prepare for share to groups
      let groupsPayload = []
      if (groups) {
        groupsPayload = await _shareFolderToGroups(orgKey, groups)
      }

      const res = await folderStore.shareFolder({
        sharing_key: shareKey ? shareKey[0].encryptedString : null,
        members,
        folder: {
          id: folder.id,
          name: folderNameEnc.encryptedString,
          ciphers: sharedCiphers,
        },
        groups: groupsPayload,
      })

      if (res.kind === 'ok') {
        notify('success', translate('shares.share_folder.success.shared'))
        await reloadCache()
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('shareCipher: ' + e)
      return { kind: 'unknown' }
    }
  }

  const shareFolderAddMember = async (
    collection: CollectionView,
    emails: string[],
    role: AccountRoleText,
    autofillOnly: boolean,
    _groups?: { id: string; name: string }[]
  ) => {
    if (!collection || !emails.length) {
      return { kind: 'ok' }
    }

    try {
      const orgKey: SymmetricCryptoKey = await cryptoService.getOrgKey(collection.organizationId)

      // Get public keys
      const members = await Promise.all(
        emails.map(async (email) => {
          const publicKeyRes = await cipherStore.getSharingPublicKey(email)
          let publicKey = ''
          if (publicKeyRes.kind === 'ok') {
            publicKey = publicKeyRes.data.public_key
          }
          return {
            username: email,
            role,
            hide_passwords: autofillOnly,
            key: publicKey ? await _generateMemberKey(publicKey, orgKey) : null,
          }
        })
      )

      // Prepare folder name
      const res = await collectionStore.addShareMember(collection.organizationId, members)

      if (res.kind === 'ok') {
        notify('success', translate('shares.share_folder.success.add_member'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('shareFolder ' + e)
      return { kind: 'unknown' }
    }
  }
  const shareFolderRemoveMember = async (
    collection: CollectionView,
    memberID: string,
    isGroup?: boolean
  ) => {
    try {
      const personalKey = await cryptoService.getEncKey()
      const ciphers: CipherView[] =
        (await getCiphers({
          deleted: false,
          searchText: '',
          filters: [(c: CipherView) => c.collectionIds.includes(collection.id)],
        })) || []

      const data = await _prepareCipher(ciphers, personalKey)
      // Prepare folder name
      const folderNameEnc = await cryptoService.encrypt(collection.name, personalKey)

      const res = await collectionStore.removeShareMember(
        memberID,
        collection.organizationId,
        {
          folder: {
            id: collection.id,
            name: folderNameEnc.encryptedString,
            ciphers: data,
          },
        },
        isGroup
      )

      if (res.kind === 'ok') {
        notify('success', translate('shares.share_folder.success.remove_member'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('shareCipher: ' + e)
      return { kind: 'unknown' }
    }
  }

  const shareFolderAddItem = async (collection: CollectionView, cipher: CipherView) => {
    try {
      const orgKey: SymmetricCryptoKey = await cryptoService.getOrgKey(collection.organizationId)

      const cipherEnc = await cipherService.encrypt(cipher, orgKey)
      const requestData = new CipherRequest(cipherEnc)
      const payload = {
        cipher: {
          id: cipher.id,
          ...requestData,
        },
      }

      const res = await collectionStore.updateShareItem(
        collection.id,
        collection.organizationId,
        payload
      )

      if (res.kind === 'ok') {
        await reloadCache()
        notify('success', translate('shares.share_folder.success.add_items'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('shareCipher: ' + e)
      return { kind: 'unknown' }
    }
  }

  const shareFolderAddMultipleItems = async (collection: CollectionView, cipherIds: string[]) => {
    if (!collection) return { kind: 'unknown' }

    try {
      const ciphers: CipherView[] =
        (await getCiphers({
          deleted: false,
          searchText: '',
          filters: [(c: CipherView) => cipherIds.includes(c.id)],
        })) || []

      if (ciphers.some((c) => c.organizationId)) {
        notify('error', translate('error.share_folder_move_item'))
        return { kind: 'unknown' }
      }

      await Promise.all(
        ciphers.map(async (cipher) => {
          await shareFolderAddItem(collection, cipher)
        })
      )

      return { kind: 'ok' }
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('shareCipher: ' + e)
      return { kind: 'unknown' }
    }
  }

  const shareFolderRemoveItem = async (collection: CollectionView, cipher: CipherView) => {
    try {
      const personalKey = await cryptoService.getEncKey()

      const cipherEnc = await cipherService.encrypt(cipher, personalKey)
      const requestData = new CipherRequest(cipherEnc)
      const payload = {
        cipher: {
          id: cipher.id,
          ...requestData,
        },
      }

      const res = await collectionStore.removeShareItem(
        collection.id,
        collection.organizationId,
        payload
      )

      if (res.kind === 'ok') {
        await reloadCache()
        notify('success', 'Remove shared item  success')
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('shareCipher: ' + e)
      return { kind: 'unknown' }
    }
  }

  const stopShareFolder = async (collection: CollectionView) => {
    try {
      const personalKey = await cryptoService.getEncKey()
      const ciphers: CipherView[] =
        (await getCiphers({
          deleted: false,
          searchText: '',
          filters: [(c: CipherView) => c.collectionIds.includes(collection.id)],
        })) || []

      const data = await _prepareCipher(ciphers, personalKey)
      // Prepare folder name
      const folderNameEnc = await cryptoService.encrypt(collection.name, personalKey)

      const res = await collectionStore.stopShare(collection.id, collection.organizationId, {
        folder: {
          id: collection.id,
          name: folderNameEnc.encryptedString,
          ciphers: data,
        },
      })

      if (res.kind === 'ok') {
        await reloadCache()
        notify('success', translate('shares.share_folder.success.stop'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('shareCipher: ' + e)
      return { kind: 'unknown' }
    }
  }

  const _prepareCipher = async (ciphers: CipherView[], key: SymmetricCryptoKey) => {
    const data = []

    const prepareCipher = async (c: CipherView) => {
      const cipherEnc = await cipherService.encrypt(c, key)
      const requestData = new CipherRequest(cipherEnc)
      data.push({
        id: c.id,
        ...requestData,
      })
    }
    await Promise.all(ciphers.map(prepareCipher))
    return data
  }

  return {
    shareFolder,
    shareFolderAddMember,
    shareFolderRemoveMember,
    shareFolderAddItem,
    shareFolderAddMultipleItems,
    shareFolderRemoveItem,
    stopShareFolder,
  }
}
