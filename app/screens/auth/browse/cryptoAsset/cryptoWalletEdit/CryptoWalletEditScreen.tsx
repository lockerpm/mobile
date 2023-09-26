import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { View, Image, TouchableOpacity } from 'react-native'
import find from 'lodash/find'
import { SeedPhraseInput } from './SeedPhraseInput'
import { ChainSelect } from './ChainSelect'
import { AppSelect } from './AppSelect'
import { AppStackScreenProps, BROWSE_ITEMS } from 'app/navigators'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { useCipherData, useCipherHelper, useFolder } from 'app/services/hook'
import { CipherView } from 'core/models/view'
import { CollectionView } from 'core/models/view/collectionView'
import { CryptoWalletData, toCryptoWalletData } from 'app/utils/crypto'
import { CipherType } from 'core/enums'
import { Button, Header, Screen, TextInput, Text, Icon } from 'app/components-v2/cores'
import { translate } from 'app/i18n'
import { PlanStorageLimitModal } from '../../planStorageLimitModal'
import { PasswordStrength } from 'app/components-v2/utils'
import { CipherOthersInfo, CustomFieldsEdit } from 'app/components-v2/ciphers'

export const CryptoWalletEditScreen: FC<AppStackScreenProps<'cryptoWallets__edit'>> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route
    const { cipherStore, collectionStore } = useStores()
    const { colors } = useTheme()
    const { shareFolderAddItem } = useFolder()
    const { newCipher, getPasswordStrength } = useCipherHelper()
    const { createCipher, updateCipher } = useCipherData()

    const selectedCipher: CipherView = cipherStore.cipherView
    const selectedCollection: CollectionView = route.params.collection
    const cryptoWalletData = toCryptoWalletData(selectedCipher.notes)
    const { mode } = route.params
    const isOwner = (() => {
      if (!selectedCipher.organizationId) {
        return true
      }
      const org = cipherStore.myShares.find(
        (s) => s.organization_id === selectedCipher.organizationId
      )
      return !!org
    })()
    // ------------------------- PARAMS ------------------------------------

    const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')

    const [walletApp, setWalletApp] = useState(
      mode !== 'add' ? cryptoWalletData.walletApp : { alias: null, name: null }
    )
    const [username, setUsername] = useState(mode !== 'add' ? cryptoWalletData.username : '')
    const [password, setPassword] = useState(mode !== 'add' ? cryptoWalletData.password : '')
    const [pin, setPin] = useState(mode !== 'add' ? cryptoWalletData.pin || '' : '')
    const [address, setAddress] = useState(mode !== 'add' ? cryptoWalletData.address : '')
    const [privateKey, setPrivateKey] = useState(mode !== 'add' ? cryptoWalletData.privateKey : '')
    const [seed, setSeed] = useState(mode !== 'add' ? cryptoWalletData.seed : '           ')
    const [networks, setNetworks] = useState<{ alias: string; name: string }[]>(
      mode !== 'add' ? cryptoWalletData.networks : []
    )
    const [note, setNote] = useState(mode !== 'add' ? cryptoWalletData.notes : '')

    const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)
    const [organizationId, setOrganizationId] = useState(
      mode === 'edit' ? selectedCipher.organizationId : null
    )
    const [collectionIds, setCollectionIds] = useState(
      mode !== 'add' ? selectedCipher.collectionIds : []
    )
    const [collection, setCollection] = useState(
      mode !== 'add' && collectionIds.length > 0 ? collectionIds[0] : null
    )
    const [fields, setFields] = useState(mode !== 'add' ? selectedCipher.fields || [] : [])

    const [isLoading, setIsLoading] = useState(false)
    // plan storage limit modal
    const [isOpenModal, setIsOpenModal] = useState(false)
    // -------------------------- COMPUTED ------------------------------

    // -------------------------- EFFECTS ------------------------------

    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        if (cipherStore.generatedPassword) {
          setPassword(cipherStore.generatedPassword)
          cipherStore.setGeneratedPassword('')
        }

        if (cipherStore.selectedFolder) {
          if (cipherStore.selectedFolder === 'unassigned') {
            setFolder(null)
          } else {
            if (!selectedCollection) setFolder(cipherStore.selectedFolder)
          }
          setCollection(null)
          setCollectionIds([])
          setOrganizationId(null)
          cipherStore.setSelectedFolder(null)
        }

        if (cipherStore.selectedCollection) {
          if (!selectedCollection) setCollection(cipherStore.selectedCollection)
          setFolder(null)
          cipherStore.setSelectedCollection(null)
        }
      })

      return unsubscribe
    }, [navigation])

    // -------------------------- METHODS ------------------------------

    const handleSave = async () => {
      setIsLoading(true)
      let payload: CipherView
      if (mode === 'add') {
        payload = newCipher(CipherType.CryptoWallet)
      } else {
        // @ts-ignore
        payload = { ...selectedCipher }
      }

      const cryptoData: CryptoWalletData = {
        seed,
        notes: note,
        password,
        address,
        pin,
        walletApp,
        username,
        privateKey,
        networks,
      }

      payload.fields = fields
      payload.name = name
      payload.notes = JSON.stringify(cryptoData)
      payload.folderId = folder
      payload.organizationId = organizationId
      payload.secureNote = {
        // @ts-ignore
        response: null,
        type: 0,
      }

      let res = { kind: 'unknown' }
      if (['add', 'clone'].includes(mode)) {
        res = await createCipher(payload, 0, collectionIds)
      } else {
        res = await updateCipher(payload.id, payload, 0, collectionIds)
      }
      if (res.kind === 'ok') {
        if (isOwner) {
          // for shared folder
          if (selectedCollection) {
            await shareFolderAddItem(selectedCollection, payload)
          }

          if (collection) {
            const collectionView =
              find(collectionStore.collections, (e) => e.id === collection) || {}
            await shareFolderAddItem(collectionView, payload)
          }
        }
        setIsLoading(false)
        navigation.goBack()
      } else {
        setIsLoading(false)

        // reach limit plan stogare
        // @ts-ignore
        if (res?.data?.code === '5002') {
          setIsOpenModal(true)
        }
      }
    }

    // -------------------------- RENDER ------------------------------

    return (
      <Screen
        preset="auto"
        safeAreaEdges={['bottom']}
        header={
          <Header
            title={
              mode === 'add'
                ? `${translate('common.add')} ${translate('common.crypto_wallet')}`
                : translate('common.edit')
            }
            onLeftPress={() => navigation.goBack()}
            leftText={translate('common.cancel')}
            RightActionComponent={
              <Button
                loading={isLoading}
                preset="teriatary"
                disabled={isLoading || !name.trim()}
                text={translate('common.save')}
                onPress={handleSave}
                style={{
                  height: 35,
                  alignItems: 'center',
                  paddingLeft: 10,
                }}
              />
            }
          />
        }
      >
        <PlanStorageLimitModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} />

        <View style={{ backgroundColor: colors.background, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={BROWSE_ITEMS.cryptoWallet.icon}
              style={{
                width: 40,
                height: 40,
              }}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <TextInput
                isRequired
                label={translate('common.item_name')}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          <Text preset="label" size="base" text={translate('common.details').toUpperCase()} />
        </View>

        {/* Info */}
        <View
          style={{
            backgroundColor: colors.background,
            padding: 16,
            paddingBottom: 32,
          }}
        >
          <View style={{ flex: 1 }}>
            <AppSelect
              alias={walletApp.alias}
              onChange={(alias: string, appName: string) => {
                setWalletApp({ alias, name: appName })
              }}
            />
          </View>

          <View style={{ flex: 1, marginTop: 20 }}>
            <TextInput
              label={translate('common.username')}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Password */}
          <View style={{ flex: 1, marginTop: 20 }}>
            <TextInput
              isPassword
              label={translate('common.password')}
              value={password}
              onChangeText={setPassword}
            />
            {!!password && (
              <PasswordStrength
                value={getPasswordStrength(password).score}
                style={{ marginTop: 15 }}
              />
            )}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('passwordGenerator')}
            style={{
              marginTop: 20,
            }}
          >
            <View
              style={{
                justifyContent: 'space-between',
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon icon="repeat" size={18} color={colors.primary} />
                <Text
                  color={colors.primary}
                  size="base"
                  text={translate('common.generate')}
                  style={{ marginLeft: 7 }}
                />
              </View>
              <Icon icon="caret-right" size={20} color={colors.title} />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1, marginTop: 20 }}>
            <TextInput isPassword label={'PIN'} value={pin} onChangeText={setPin} />
          </View>

          <View style={{ flex: 1, marginTop: 20 }}>
            <TextInput
              label={translate('crypto_asset.wallet_address')}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={{ flex: 1, marginTop: 20 }}>
            <TextInput
              isPassword
              label={translate('crypto_asset.private_key')}
              value={privateKey}
              onChangeText={setPrivateKey}
            />
          </View>

          {/* Seed */}
          <View style={{ flex: 1, marginTop: 20 }}>
            <Text preset="label" size="base" text={translate('crypto_asset.seed')} />
            <SeedPhraseInput seed={seed} setSeed={setSeed} />
          </View>

          <View style={{ flex: 1, marginTop: 20 }}>
            <ChainSelect selected={networks} onChange={setNetworks} />
          </View>
        </View>

        <CustomFieldsEdit fields={fields} setFields={setFields} />

        <CipherOthersInfo
          isOwner={isOwner}
          navigation={navigation}
          folderId={folder}
          collectionId={collection}
          organizationId={organizationId}
          setOrganizationId={setOrganizationId}
          collectionIds={collectionIds}
          setCollectionIds={setCollectionIds}
          isDeleted={selectedCipher.isDeleted}
          hasNote
          note={note}
          onChangeNote={setNote}
        />
      </Screen>
    )
  }
)
