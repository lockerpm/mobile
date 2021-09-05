import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { CipherView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { translate } from "../../../../../i18n"


type NoteEditScreenProp = RouteProp<PrimaryParamList, 'notes__edit'>;


export const NoteEditScreen = observer(function NoteEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<NoteEditScreenProp>()
  const { mode } = route.params
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView
  const { newCipher, createCipher, updateCipher } = useMixins()

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [note, setNote] = useState(mode !== 'add' ? selectedCipher.notes : '')
  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)

  // Params
  const [isLoading, setIsLoading] = useState(false)

  // Watchers
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (cipherStore.selectedFolder) {
        setFolder(cipherStore.selectedFolder)
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
      payload = {...selectedCipher}
    }

    payload.name = name
    payload.notes = note
    payload.folderId = folder
    const collectionIds = payload.collectionIds

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
              ? `${translate('common.add')} ${translate('common.note')}`
              : translate('common.edit')
          }
          goBack={() => navigation.goBack()}
          goBackText={translate('common.cancel')}
          right={(
            <Button
              preset="link"
              text={translate('common.save')}
              onPress={handleSave}
              textStyle={{
                fontSize: 12
              }}
            />
          )}
        />
      )}
    >
      {/* Name */}
      <View
        style={[commonStyles.SECTION_PADDING, { backgroundColor: color.palette.white }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={BROWSE_ITEMS.note.icon}
            style={{ height: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
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
          style={{ fontSize: 10 }}
        />
      </View>

      {/* Info */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
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
      />
      {/* Others end */}
    </Layout>
  )
})
