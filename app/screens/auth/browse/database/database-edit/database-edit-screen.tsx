import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  Text, Layout, Button, Header, FloatingInput, CipherOthersInfo, CustomFieldsEdit
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
import { DatabaseData, toDatabaseData } from "../database.typs"
import { useFolderMixins } from "../../../../../services/mixins/folder"
import { CollectionView } from "../../../../../../core/models/view/collectionView"


type DatabaseEditScreenProp = RouteProp<PrimaryParamList, 'databases__edit'>;

type InputItem = {
  label: string,
  value: string,
  setter: (val: string) => void,
  isRequired?: boolean,
  type?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad'
}


export const DatabaseEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<DatabaseEditScreenProp>()
  const { mode } = route.params

  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { shareFolderAddItem } = useFolderMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const selectedCipher: CipherView = cipherStore.cipherView
  const selectedCollection: CollectionView = route.params.collection
  const databaseData = toDatabaseData(selectedCipher.notes)
  // ------------------ PARAMS -----------------------

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')

  const [host, setHost] = useState(mode !== 'add' ? databaseData.host : '')
  const [port, setPort] = useState(mode !== 'add' ? databaseData.port : '')
  const [username, setUsername] = useState(mode !== 'add' ? databaseData.username : '')
  const [password, setPassword] = useState(mode !== 'add' ? databaseData.password : '')
  const [defaults, setDefault] = useState(mode !== 'add' ? databaseData.default : '')
  const [note, setNote] = useState(mode !== 'add' ? databaseData.notes : '')

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
      payload = newCipher(CipherType.Database)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const databaseData: DatabaseData = {
      host,
      port,
      username,
      password,
      default: defaults,
      notes: note,
    }

    payload.fields = fields
    payload.name = name
    payload.notes = JSON.stringify(databaseData)
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

  const databaseDetails: InputItem[] = [
    {
      label: translate('database.host'),
      value: host,
      setter: setHost
    },
    {
      label: translate('database.port'),
      value: port,
      setter: setPort
    },
    {
      label: translate('common.username'),
      value: username,
      setter: setUsername
    },
    {
      label: translate('common.password'),
      value: password,
      setter: setPassword,
      type: 'email-address'
    },
    {
      label: translate('database.default'),
      value: defaults,
      setter: setDefault
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
              ? `${translate('common.add')} ${translate('common.database')}`
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
          <BROWSE_ITEMS.database.svgIcon height={40} width={40} />
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
          text={translate('common.database').toUpperCase()}
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
          databaseDetails.map((e, index) => (
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
