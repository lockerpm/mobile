import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  Text, Layout, Button, Header, FloatingInput, CipherOthersInfo, CustomFieldsEdit, Select
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
import { toApiCipherData, ApiCipherData, API_METHODS } from "../api-cipher.type"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { useFolderMixins } from "../../../../../services/mixins/folder"


type ApiCipherEditScreenProp = RouteProp<PrimaryParamList, 'apiCiphers__edit'>;

type InputItem = {
  label: string,
  value: string,
  setter: (val: API_METHODS | string) => void,
  isRequired?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad'
  isSelect?: boolean,
  options?: { label: string, value: string | number | null }[]
}


export const ApiCipherEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<ApiCipherEditScreenProp>()
  const { mode } = route.params

  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { shareFolderAddItem } = useFolderMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const selectedCipher: CipherView = cipherStore.cipherView
  const selectedCollection: CollectionView = route.params.collection
  const apiCipherData = toApiCipherData(selectedCipher.notes)
  // ------------------ PARAMS -----------------------

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')

  const [url, setUrl] = useState(mode !== 'add' ? apiCipherData.url : '')
  const [method, setMethod] = useState(mode !== 'add' ? apiCipherData.method : API_METHODS.GET)
  const [header, setHeader] = useState(mode !== 'add' ? apiCipherData.header : '')
  const [bodyData, setBodyData] = useState(mode !== 'add' ? apiCipherData.bodyData : '')
  const [response, setResponse] = useState(mode !== 'add' ? apiCipherData.response : '')
  const [note, setNote] = useState(mode !== 'add' ? apiCipherData.notes : '')

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
      payload = newCipher(CipherType.APICipher)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const apiCipherData: ApiCipherData = {
      url,
      method,
      header,
      bodyData,
      response,
      notes: note,
    }

    payload.fields = fields
    payload.name = name
    payload.notes = JSON.stringify(apiCipherData)
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

  const METHODS = [
    { label: 'GET', value: API_METHODS.GET },
    { label: 'POST', value: API_METHODS.POST },
    { label: 'PUT', value: API_METHODS.PUT },
    { label: 'DELETE', value: API_METHODS.DELETE },
    { label: 'PATCH', value: API_METHODS.PATCH },
    { label: 'OPTIONS', value: API_METHODS.OPTIONS },
  ]

  // ----------------- RENDER ----------------------
  const apiCipherDatas: InputItem[] = [
    {
      label: translate('API.url'),
      value: url,
      setter: setUrl,
      isRequired: true
    },
    {
      label: translate('API.method'),
      value: method,
      // @ts-ignore
      setter: setMethod, // ?
      isSelect: true,
      options: METHODS
    },
    {
      label: translate('API.header'),
      value: header,
      setter: setHeader
    },
    {
      label: translate('API.body_data'),
      value: bodyData,
      setter: setBodyData
    },
    {
      label: translate('API.response'),
      value: response,
      setter: setResponse
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
              ? `${translate('common.add')} ${translate('common.api_cipher')}`
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
          <BROWSE_ITEMS.apiCipher.svgIcon height={40} width={40} />
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
          text={translate('common.api_cipher').toUpperCase()}
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
          apiCipherDatas.map((e, index) => (
            <View
              key={index}
              style={{ flex: 1, marginTop: index === 0 ? 0 : 20 }}>
              {
                e.isSelect ? (
                  <Select
                    floating
                    placeholder={e.label}
                    value={e.value}
                    options={e.options}
                    onChange={val => e.setter(val)}
                  />
                ) : (
                  <FloatingInput
                    isRequired={e.isRequired}
                    label={e.label}
                    value={e.value}
                    onChangeText={e.setter}
                  />
                )
              }
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
