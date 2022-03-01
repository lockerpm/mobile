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


type NoteEditScreenProp = RouteProp<PrimaryParamList, 'cryptoWallets__edit'>;


export const CryptoWalletEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<NoteEditScreenProp>()
  const { mode } = route.params
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView
  const { translate, color } = useMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [note, setNote] = useState(mode !== 'add' ? selectedCipher.notes : '')
  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)
  const [organizationId, setOrganizationId] = useState(mode !== 'add' ? selectedCipher.organizationId : null)
  const [collectionIds, setCollectionIds] = useState(mode !== 'add' ? selectedCipher.collectionIds : [])

  // Params
  const [isLoading, setIsLoading] = useState(false)

  // Watchers
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

  // Methods
  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.SecureNote)
    } else {
      // @ts-ignore
      payload = {...selectedCipher}
    }

    payload.name = name
    payload.notes = note
    payload.folderId = folder
    payload.organizationId = organizationId

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

  // Render
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
        {/* Note */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            fixedLabel
            textarea
            label={translate('common.notes')}
            value={note}
            onChangeText={setNote}
          />
        </View>
        {/* Note end */}
      </View>
      {/* Info end */}

      {/* Others */}
      <CipherOthersInfo
        navigation={navigation}
        folderId={folder}
        organizationId={organizationId}
        setOrganizationId={setOrganizationId}
        collectionIds={collectionIds}
        setCollectionIds={setCollectionIds}
        isDeleted={selectedCipher.isDeleted}
      />
      {/* Others end */}
    </Layout>
  )
})
