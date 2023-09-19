import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import find from 'lodash/find'
import {
  Text,
  Layout,
  Button,
  Header,
  FloatingInput,
  CipherOthersInfo,
  CustomFieldsEdit,
  PasswordStrength,
} from '../../../../../components'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { commonStyles, fontSize } from '../../../../../theme'
import { PrimaryParamList } from '../../../../../navigators/MainNavigator'
import { BROWSE_ITEMS } from '../../../../../common/mappings'
import { useStores } from '../../../../../models'
import { useMixins } from '../../../../../services/mixins'
import { CipherView } from '../../../../../../core/models/view'
import { CipherType } from '../../../../../../core/enums'
import { useCipherHelpersMixins } from '../../../../../services/mixins/cipher/helpers'
import { useCipherDataMixins } from '../../../../../services/mixins/cipher/data'
import { CryptoWalletData, toCryptoWalletData } from '../../../../../utils/crypto'
import { SeedPhraseInput } from './seed-phrase-input'
import { ChainSelect } from './chain-select'
import { AppSelect } from './app-select'
import { CollectionView } from '../../../../../../core/models/view/collectionView'
import { useFolderMixins } from '../../../../../services/mixins/folder'
import { PlanStorageLimitModal } from '../../plan-storage-limit-modal'

type NoteEditScreenProp = RouteProp<PrimaryParamList, 'cryptoWallets__edit'>

export const CryptoWalletEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<NoteEditScreenProp>()
  const { cipherStore, collectionStore } = useStores()
  const { translate, color } = useMixins()
  const { shareFolderAddItem } = useFolderMixins()
  const { newCipher, getPasswordStrength } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()

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
          const collectionView = find(collectionStore.collections, (e) => e.id === collection) || {}
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
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
      }}
      header={
        <Header
          title={
            mode === 'add'
              ? `${translate('common.add')} ${translate('common.crypto_wallet')}`
              : translate('common.edit')
          }
          goBack={() => navigation.goBack()}
          goBackText={translate('common.cancel')}
          right={
            <Button
              isLoading={isLoading}
              preset="link"
              isDisabled={isLoading || !name.trim()}
              text={translate('common.save')}
              onPress={handleSave}
              style={{
                height: 35,
                alignItems: 'center',
                paddingLeft: 10,
              }}
              textStyle={{
                fontSize: fontSize.p,
              }}
            />
          }
        />
      }
    >
      <PlanStorageLimitModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} />
      {/* Name */}
      <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <BROWSE_ITEMS.cryptoWallet.svgIcon height={40} width={40} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <FloatingInput
              isRequired
              label={translate('common.item_name')}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('common.details').toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Info */}
      <View
        style={[
          commonStyles.SECTION_PADDING,
          {
            backgroundColor: color.background,
            paddingBottom: 32,
          },
        ]}
      >
        {/* App */}
        <View style={{ flex: 1 }}>
          <AppSelect
            alias={walletApp.alias}
            onChange={(alias: string, appName: string) => {
              setWalletApp({ alias, name: appName })
            }}
          />
        </View>
        {/* App end */}

        {/* Username */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            label={translate('common.username')}
            value={username}
            onChangeText={setUsername}
          />
        </View>
        {/* Username end */}

        {/* Password */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
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
        {/* Password end */}

        {/* Generate password */}
        <Button
          preset="link"
          onPress={() => navigation.navigate('passwordGenerator')}
          style={{
            marginTop: 20,
          }}
        >
          <View
            style={[
              commonStyles.CENTER_HORIZONTAL_VIEW,
              {
                justifyContent: 'space-between',
                width: '100%',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesomeIcon name="repeat" size={18} color={color.primary} />
              <Text
                preset="green"
                text={translate('common.generate')}
                style={{ fontSize: fontSize.small, marginLeft: 7 }}
              />
            </View>
            <FontAwesomeIcon name="angle-right" size={20} color={color.text} />
          </View>
        </Button>
        {/* Generate password end */}

        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput isPassword label={'PIN'} value={pin} onChangeText={setPin} />
        </View>

        {/* Address */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            label={translate('crypto_asset.wallet_address')}
            value={address}
            onChangeText={setAddress}
          />
        </View>
        {/* Address end */}

        {/* Private key */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            isPassword
            label={translate('crypto_asset.private_key')}
            value={privateKey}
            onChangeText={setPrivateKey}
          />
        </View>
        {/* Private key end */}

        {/* Seed */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <Text text={translate('crypto_asset.seed')} style={{ fontSize: fontSize.small }} />
          <SeedPhraseInput seed={seed} setSeed={setSeed} />
        </View>
        {/* Seed end */}

        {/* Network */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <ChainSelect selected={networks} onChange={setNetworks} />
        </View>
        {/* Network end */}
      </View>
      {/* Info end */}

      {/* Custom fields */}
      <CustomFieldsEdit fields={fields} setFields={setFields} />
      {/* Custom fields end */}

      {/* Others */}
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
      {/* Others end */}
    </Layout>
  )
})
