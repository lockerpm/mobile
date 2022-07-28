import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { useMixins } from '..'
import { CipherRequest } from '../../../../core/models/request/cipherRequest'
import { CipherView } from '../../../../core/models/view'
import { FolderView } from '../../../../core/models/view/folderView'
import { useStores } from '../../../models'
import { useCoreService } from '../../core-service'
import { CollectionView } from '../../../../core/models/view/collectionView'
import { Logger } from '../../../utils/logger'
import { EncString, SymmetricCryptoKey } from '../../../../core/models/domain'
import { Utils } from '../../core-service/utils'
import { AccountRoleText } from '../../../config/types'
import { useCipherDataMixins } from '../cipher/data'
import { Alert } from 'react-native'

const defaultData = {
    shareFolder: async (folder: FolderView | CollectionView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => { return { kind: 'unknown' } },
    shareFolderAddMember: async (collection: CollectionView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => { return { kind: 'unknown' } },
    shareFolderRemoveMember: async (collection: CollectionView, memberID: string) => { return { kind: 'unknown' } },
    shareFolderAddItem: async (collection: CollectionView, cipher: CipherView) => { return { kind: 'unknown' } },
    shareFolderAddMultipleItems: async (collection: CollectionView, cipherIds: string[]) => { return { kind: 'unknown' } },
    shareFolderRemoveItem: async (collection: CollectionView, cipher: CipherView) => { return { kind: 'unknown' } },
    stopShareFolder: async (collection: CollectionView) => { return { kind: 'unknown' } },
}

export const FolderMixinsContext = createContext(defaultData)

export const FolderMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
    const { cipherStore, folderStore, collectionStore } = useStores()
    const {
        cipherService,
        cryptoService
    } = useCoreService()
    const { getCiphers, reloadCache } = useCipherDataMixins()
    const { notify, translate, notifyApiError } = useMixins()



    const _generateMemberKey = async (publicKey: string, orgKey: SymmetricCryptoKey) => {
        const pk = Utils.fromB64ToArray(publicKey)
        const key = await cryptoService.rsaEncrypt(orgKey.key, pk.buffer)
        return key.encryptedString
    }

    //-------------------------------------------------------
    // Share Folder
    const shareFolder = async (folder: FolderView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => {
        if (!folder || !emails.length) {
            return { kind: 'ok' }
        }

        const ciphers: CipherView[] = await getCiphers({
            deleted: false,
            searchText: '',
            filters: [(c: CipherView) => c.folderId === folder.id]
        }) || []

        try {
            if (ciphers.some(c => c.organizationId)) {
                Alert.alert(
                    translate('error.share_folder'),
                    translate('shares.share_folder.error_share_item'),
                    [
                        {
                            text: "OK",
                            onPress: () => { }
                        },
                    ]
                )
                return { kind: 'ok' }
            }
            // Prepare org key
            let shareKey: [EncString, SymmetricCryptoKey] = await cryptoService.makeShareKey()
            let orgKey: SymmetricCryptoKey = shareKey[1]

            // Get public keys
            const members = await Promise.all(emails.map(async (email) => {
                const publicKeyRes = await cipherStore.getSharingPublicKey(email)
                let publicKey = ''
                if (publicKeyRes.kind === 'ok') {
                    publicKey = publicKeyRes.data.public_key
                }
                return {
                    username: email,
                    role,
                    hide_passwords: autofillOnly,
                    key: publicKey ? await _generateMemberKey(publicKey, orgKey) : null
                }
            }))

            // Prepare cipher..  CipherRequest & { id: string }
            type ShareCipher = CipherRequest & { id: string }
            const sharedCiphers: ShareCipher[] = []

            const prepareCipher = async (c: CipherView) => {
                const cipherEnc = await cipherService.encrypt(c, orgKey)
                const data = new CipherRequest(cipherEnc)
                sharedCiphers.push(
                    {
                        id: c.id,
                        ...data
                    },
                )
            }
            await Promise.all(ciphers.map(prepareCipher))

            // Prepare folder name
            const folderNameEnc = await cryptoService.encrypt(folder.name, orgKey)

            const res = await folderStore.shareFolder({
                sharing_key: shareKey ? shareKey[0].encryptedString : null,
                members,
                folder: {
                    id: folder.id,
                    name: folderNameEnc.encryptedString,
                    ciphers: sharedCiphers,
                }
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

    const shareFolderAddMember = async (collection: CollectionView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => {
        if (!collection || !emails.length) {
            return { kind: 'ok' }
        }

        try {
            let orgKey: SymmetricCryptoKey = await cryptoService.getOrgKey(collection.organizationId)

            // Get public keys
            const members = await Promise.all(emails.map(async (email) => {
                const publicKeyRes = await cipherStore.getSharingPublicKey(email)
                let publicKey = ''
                if (publicKeyRes.kind === 'ok') {
                    publicKey = publicKeyRes.data.public_key
                }
                return {
                    username: email,
                    role,
                    hide_passwords: autofillOnly,
                    key: publicKey ? await _generateMemberKey(publicKey, orgKey) : null
                }
            }))

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
    const shareFolderRemoveMember = async (collection: CollectionView, memberID: string) => {
        try {
            const personalKey = await cryptoService.getEncKey()
            const ciphers: CipherView[] = await getCiphers({
                deleted: false,
                searchText: '',
                filters: [(c: CipherView) => c.collectionIds.includes(collection.id)]
            }) || []

            const data = await _prepareCipher(ciphers, personalKey)
            // Prepare folder name
            const folderNameEnc = await cryptoService.encrypt(collection.name, personalKey)

            const res = await collectionStore.removeShareMember(memberID, collection.organizationId, {
                folder: {
                    id: collection.id,
                    name: folderNameEnc.encryptedString,
                    ciphers: data,
                }
            })

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
            let orgKey: SymmetricCryptoKey = await cryptoService.getOrgKey(collection.organizationId)

            const cipherEnc = await cipherService.encrypt(cipher, orgKey)
            const requestData = new CipherRequest(cipherEnc)
            const payload = {
                cipher: {
                    id: cipher.id,
                    ...requestData
                }
            }

            const res = await collectionStore.updateShareItem(collection.id, collection.organizationId, payload)

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
            const ciphers: CipherView[] = await getCiphers({
                deleted: false,
                searchText: '',
                filters: [(c: CipherView) => cipherIds.includes(c.id)]
            }) || []

            if (ciphers.some(c => c.organizationId)) {
                notify('error', translate('error.share_folder_move_item'))
                return { kind: 'unknown' }
            }

            await Promise.all(ciphers.map(async (cipher) => {
                await shareFolderAddItem(collection, cipher)
            }))

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
                    ...requestData
                }
            }

            const res = await collectionStore.updateShareItem(collection.id, collection.organizationId, payload)

            if (res.kind === 'ok') {
                await reloadCache()
                notify('success', "Remove Item success")
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
            const ciphers: CipherView[] = await getCiphers({
                deleted: false,
                searchText: '',
                filters: [(c: CipherView) => c.collectionIds.includes(collection.id)]
            }) || []

            const data = await _prepareCipher(ciphers, personalKey)
            // Prepare folder name
            const folderNameEnc = await cryptoService.encrypt(collection.name, personalKey)

            const res = await collectionStore.stopShare(collection.id, collection.organizationId, {
                folder: {
                    id: collection.id,
                    name: folderNameEnc.encryptedString,
                    ciphers: data,
                }
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
            data.push(
                {
                    id: c.id,
                    ...requestData
                },
            )
        }
        await Promise.all(ciphers.map(prepareCipher))
        return data
    }




    // -------------------- REGISTER FUNCTIONS ------------------

    const data = {
        shareFolder,
        shareFolderAddMember,
        shareFolderRemoveMember,
        shareFolderAddItem,
        shareFolderAddMultipleItems,
        shareFolderRemoveItem,
        stopShareFolder
    }

    return (
        <FolderMixinsContext.Provider value={data}>
            {props.children}
        </FolderMixinsContext.Provider>
    )
})


export const useFolderMixins = () => useContext(FolderMixinsContext)