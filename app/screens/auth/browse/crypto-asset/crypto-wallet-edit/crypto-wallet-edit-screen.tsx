import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  Text, Layout, Button, Header, FloatingInput, CipherOthersInfo
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { CipherView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { CryptoWalletData, toCryptoWalletData } from "../../../../../utils/crypto"
import { SeedPhraseInput } from "./seed-phrase-input"
import { ChainSelect } from "./chain-select"


type NoteEditScreenProp = RouteProp<PrimaryParamList, 'cryptoWallets__edit'>;


export const CryptoWalletEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<NoteEditScreenProp>()
  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()

  const selectedCipher: CipherView = cipherStore.cipherView
  const cryptoWalletData = toCryptoWalletData(selectedCipher.notes)
  const { mode } = route.params

  // ------------------------- PARAMS ------------------------------------

  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [chainAlias, setChainAlias] = useState(mode !== 'add' ? cryptoWalletData.network.alias : '')
  const [chainName, setChainName] = useState(mode !== 'add' ? cryptoWalletData.network.name : '')
  const [email, setEmail] = useState(mode !== 'add' ? cryptoWalletData.email : '')
  const [seed, setSeed] = useState(mode !== 'add' ? cryptoWalletData.seed : '           ')
  const [note, setNote] = useState(mode !== 'add' ? cryptoWalletData.notes : '')
  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)
  const [organizationId, setOrganizationId] = useState(mode === 'edit' ? selectedCipher.organizationId : null)
  const [collectionIds, setCollectionIds] = useState(mode !== 'add' ? selectedCipher.collectionIds : [])

  const [isLoading, setIsLoading] = useState(false)

  // -------------------------- COMPUTED ------------------------------

  // -------------------------- EFFECTS ------------------------------

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (cipherStore.selectedFolder) {
        if (cipherStore.selectedFolder === 'unassigned') {
          setFolder(null)
        } else {
          setFolder(cipherStore.selectedFolder)
        }
        cipherStore.setSelectedFolder(null)
      }
    });

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
      payload = {...selectedCipher}
    }

    const cryptoData: CryptoWalletData = {
      email,
      seed,
      notes: note,
      network: {
        name: chainName,
        alias: chainAlias
      }
    }

    payload.name = name
    payload.notes = JSON.stringify(cryptoData)
    payload.folderId = folder
    payload.organizationId = organizationId
    payload.secureNote = {
      // @ts-ignore
      response: null,
      type: 0
    }

    let res = { kind: 'unknown' }
    if (['add', 'clone'].includes(mode)) {
      res = await createCipher(payload, 0, collectionIds)
    } else {
      res = await updateCipher(payload.id, payload, 0, collectionIds)
    }

    setIsLoading(false)
    if (res.kind === 'ok') {
      navigation.goBack()
    }
  }

  // -------------------------- RENDER ------------------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={
            mode === 'add'
              ? `${translate('common.add')} ${translate('common.crypto_wallet')}`
              : translate('common.edit')
          }
          goBack={() => navigation.goBack()}
          goBackText={translate('common.cancel')}
          right={(
            <Button
              preset="link"
              isDisabled={isLoading || !name.trim()}
              text={translate('common.save')}
              onPress={handleSave}
              style={{ 
                height: 35,
                alignItems: 'center',
                paddingLeft: 10
              }}
              textStyle={{
                fontSize: fontSize.p
              }}
            />
          )}
        />
      )}
    >
      {/* Name */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <BROWSE_ITEMS.cryptoWallet.svgIcon height={40} width={40} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <FloatingInput
              isRequired
              label={translate('common.name')}
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
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingBottom: 32
        }]}
      >
        {/* Network */}
        <View style={{ flex: 1 }}>
          <ChainSelect
            alias={chainAlias}
            onChange={(alias: string, name: string) => {
              setChainAlias(alias)
              setChainName(name)
            }}
          />
        </View>
        {/* Network end */}
      </View>
      {/* Info end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('crypto_asset.backup_details').toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Backup Info */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingBottom: 32
        }]}
      >
        {/* Email */}
        <View style={{ flex: 1 }}>
          <FloatingInput
            fixedLabel
            label={translate('common.email')}
            value={email}
            onChangeText={setEmail}
          />
        </View>
        {/* Email end */}

        {/* Seed */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <Text
            text={translate('crypto_asset.seed')}
            style={{ fontSize: fontSize.small }}
          />
          <SeedPhraseInput
            seed={seed}
            setSeed={setSeed}
          />
        </View>
        {/* Seed end */}
      </View>
      {/* Backup Info end */}

      {/* Others */}
      <CipherOthersInfo
        navigation={navigation}
        folderId={folder}
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
