import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  Text, Layout, Button, Header, FloatingInput, CipherOthersInfo,  CustomFieldsEdit
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { ServerData, toServerData } from "../server.type"
import { useFolderMixins } from "../../../../../services/mixins/folder"
import { CollectionView } from "../../../../../../core/models/view/collectionView"


type ServerEditScreenProp = RouteProp<PrimaryParamList, 'servers__edit'>;

type InputItem = {
  label: string,
  value: string,
  setter: (val: string) => void,
  isRequired?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad'
}


export const ServerEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<ServerEditScreenProp>()
  const { mode } = route.params

  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { shareFolderAddItem } = useFolderMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const selectedCipher: CipherView = cipherStore.cipherView
  const selectedCollection: CollectionView = route.params.collection
  const serverData = toServerData(selectedCipher.notes)

  // ------------------ PARAMS -----------------------

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')

  const [host, setHost] = useState(mode !== 'add' ? serverData.host : '')
  const [publicKey, setPublicKey] = useState(mode !== 'add' ? serverData.publicKey : '')
  const [privateKey, setPrivateKey] = useState(mode !== 'add' ? serverData.privateKey : '')
  const [username, setUsername] = useState(mode !== 'add' ? serverData.username : '')
  const [password, setPasspord] = useState(mode !== 'add' ? serverData.password : '')
  const [note, setNote] = useState(mode !== 'add' ? serverData.notes : '')

  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)
  const [organizationId, setOrganizationId] = useState(mode === 'edit' ? selectedCipher.organizationId : null)
  const [collectionIds, setCollectionIds] = useState(mode !== 'add' ? selectedCipher.collectionIds : [])
  const [fields, setFields] = useState(mode !== 'add' ? selectedCipher.fields || [] : [])

  const [isLoading, setIsLoading] = useState(false)

  // ------------------ EFFECTS -----------------------

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (cipherStore.selectedFolder) {
        if (cipherStore.selectedFolder === 'unassigned') {
          setFolder(null)
        } else {
          if (!selectedCollection)
            setFolder(cipherStore.selectedFolder)
        }
        cipherStore.setSelectedFolder(null)
      }
    });

    return unsubscribe
  }, [navigation])

  // ----------------- METHODS ----------------------

  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.Server)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const serverData: ServerData = {
      host,
      publicKey,
      privateKey,
      username,
      password,
      notes: note,
    }

    payload.fields = fields
    payload.name = name
    payload.notes = JSON.stringify(serverData)
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

    if (res.kind === 'ok') {
      // create item in shared folder
      !!selectedCollection && await shareFolderAddItem(selectedCollection, payload)
      setIsLoading(false)

      navigation.goBack()
    }
    setIsLoading(false)

  }

  // ----------------- RENDER ----------------------

  const serverDetails: InputItem[] = [
    {
      label: translate('server.host'),
      value: host,
      setter: setHost
    },
    {
      label: translate('server.public_key'),
      value: publicKey,
      setter: setPublicKey
    },
    {
      label: translate('server.private_key'),
      value: privateKey,
      setter: setPrivateKey
    },
    {
      label: translate('common.username'),
      value: username,
      setter: setUsername,
    },
    {
      label: translate('common.password'),
      value: password,
      setter: setPasspord
    }
  ]

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
              ? `${translate('common.add')} ${translate('common.server')}`
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
          <BROWSE_ITEMS.server.svgIcon height={40} width={40} />
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
          text={translate('common.server').toUpperCase()}
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
        {
          serverDetails.map((e, index) => (
            <View
              key={index}
              style={{ flex: 1, marginTop: index === 0 ? 0 : 20 }}>
              <FloatingInput
                label={e.label}
                value={e.value}
                onChangeText={e.setter}
              />
            </View>
          ))
        }
      </View>
      {/* Info end */}

      {/* Custom fields */}
      <CustomFieldsEdit
        fields={fields}
        setFields={setFields}
      />
      {/* Custom fields end */}

      {/* Others */}
      <CipherOthersInfo
        navigation={navigation}
        hasNote
        note={note}
        onChangeNote={setNote}
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
