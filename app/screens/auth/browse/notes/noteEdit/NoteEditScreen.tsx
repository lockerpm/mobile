import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Image, View } from 'react-native'
import find from 'lodash/find'
import { PlanStorageLimitModal } from '../../planStorageLimitModal'
import { AppStackScreenProps, BROWSE_ITEMS } from 'app/navigators'
import { useStores } from 'app/models'
import { CipherView } from 'core/models/view'
import { useTheme } from 'app/services/context'
import { useCipherData, useCipherHelper, useFolder } from 'app/services/hook'
import { Button, Header, Screen, TextInput, Text } from 'app/components-v2/cores'
import { translate } from 'app/i18n'
import { Textarea } from 'app/components-v2/utils'
import { CipherOthersInfo, CustomFieldsEdit } from 'app/components-v2/ciphers'
import { CipherType } from 'core/enums'
import { CollectionView } from 'core/models/view/collectionView'

export const NoteEditScreen: FC<AppStackScreenProps<'notes__edit'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { mode } = route.params
  const { cipherStore, collectionStore } = useStores()

  const selectedCipher: CipherView = cipherStore.cipherView
  const { colors } = useTheme()

  const { shareFolderAddItem } = useFolder()
  const { newCipher } = useCipherHelper()
  const { createCipher, updateCipher } = useCipherData()
  const isOwner = (() => {
    if (!selectedCipher.organizationId) {
      return true
    }
    const org = cipherStore.myShares.find(
      (s) => s.organization_id === selectedCipher.organizationId
    )
    return !!org
  })()
  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [note, setNote] = useState(mode !== 'add' ? selectedCipher.notes : '')
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

  // Params
  const [isLoading, setIsLoading] = useState(false)

  // plan storage limit modal
  const [isOpenModal, setIsOpenModal] = useState(false)
  const selectedCollection: CollectionView = route.params.collection
  // Watchers
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
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

  // Methods
  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.SecureNote)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    payload.fields = fields
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

  // Render
  return (
    <Screen
      preset="auto"
      safeAreaEdges={['bottom']}
      backgroundColor={colors.block}
      header={
        <Header
          title={
            mode === 'add'
              ? `${translate('common.add')} ${translate('common.note')}`
              : translate('common.edit')
          }
          leftText={translate('common.cancel')}
          onLeftPress={() => navigation.goBack()}
          RightActionComponent={
            <Button
              preset="teriatary"
              loading={isLoading}
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
            source={BROWSE_ITEMS.note.icon}
            style={{
              height: 40,
              width: 40,
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

      <View
        style={{
          backgroundColor: colors.background,
          padding: 16,
          paddingBottom: 32,
        }}
      >
        <View style={{ flex: 1, marginTop: 20 }}>
          <Textarea label={translate('common.notes')} value={note} onChangeText={setNote} />
        </View>
      </View>

      {/* Custom fields */}
      <CustomFieldsEdit fields={fields} setFields={setFields} />

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
      />
    </Screen>
  )
})
