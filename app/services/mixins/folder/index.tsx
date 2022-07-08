import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { useMixins } from '..'
import { CipherRequest } from '../../../../core/models/request/cipherRequest'
import { CipherView } from '../../../../core/models/view'
import { FolderView } from '../../../../core/models/view/folderView'
import { useStores } from '../../../models'
import { useCoreService } from '../../core-service'
// import { useCipherHelpersMixins } from './helpers'
import { CollectionView } from '../../../../core/models/view/collectionView'
import { Logger } from '../../../utils/logger'
import { EncString, SymmetricCryptoKey } from '../../../../core/models/domain'
import { Utils } from '../../core-service/utils'
import { AccountRoleText } from '../../../config/types'
import { useCipherDataMixins } from '../cipher/data'

const defaultData = {
    shareFolder: async (folder: FolderView | CollectionView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => { return { kind: 'unknown' } },
    shareFolderAddMember: async (collection: CollectionView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => { return { kind: 'unknown' } },
    stopShareFolder: async (collection: CollectionView) => { return { kind: 'unknown' } },
}

export const FolderMixinsContext = createContext(defaultData)

export const FolderMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
    const { cipherStore, folderStore, uiStore, collectionStore, user } = useStores()
    const {
        userService,
        cipherService,
        folderService,
        storageService,
        collectionService,
        searchService,
        messagingService,
        syncService,
        cryptoService
    } = useCoreService()
    const { getCiphers, reloadCache } = useCipherDataMixins()
    const { notify, translate, randomString, notifyApiError, getTeam } = useMixins()



    const _generateMemberKey = async (publicKey: string, orgKey: SymmetricCryptoKey) => {
        const pk = Utils.fromB64ToArray(publicKey)
        const key = await cryptoService.rsaEncrypt(orgKey.key, pk.buffer)
        return key.encryptedString
    }

    //-------------------------------------------------------
    // Share Folder
    const shareFolder = async (folder: FolderView | CollectionView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => {
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
                await reloadCache()
                notify('success', "Folder share success")
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
                await reloadCache()
                notify('success', "Add member success")
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

    const stopShareFolder = async (collection: CollectionView) => {
        try {
            const personalKey = await cryptoService.getEncKey()
            const ciphers: CipherView[] = await getCiphers({
                deleted: false,
                searchText: '',
                filters: [(c: CipherView) => c.collectionIds.includes(collection.id)]
            }) || []

            const data = []

            const prepareCipher = async (c: CipherView) => {
                const cipherEnc = await cipherService.encrypt(c, personalKey)
                const requestData = new CipherRequest(cipherEnc)
                data.push(
                    {
                        id: c.id,
                        ...requestData
                    },
                )
            }
            await Promise.all(ciphers.map(prepareCipher))



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
                notify('success', "Stop Sharing success")
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



    // -------------------- REGISTER FUNCTIONS ------------------

    const data = {
        shareFolder,
        shareFolderAddMember,
        stopShareFolder
    }

    return (
        <FolderMixinsContext.Provider value={data}>
            {props.children}
        </FolderMixinsContext.Provider>
    )
})


export const useFolderMixins = () => useContext(FolderMixinsContext)