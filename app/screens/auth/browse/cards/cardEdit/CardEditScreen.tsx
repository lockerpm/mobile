import find from 'lodash/find'
import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { View, Image } from 'react-native'
import { TextInputMaskOptionProp, TextInputMaskTypeProp } from 'react-native-masked-text'
import { CARD_BRANDS } from '../constants'
import { AppStackScreenProps, BROWSE_ITEMS } from 'app/navigators'
import { useTheme } from 'app/services/context'
import { useCipherData, useCipherHelper, useFolder } from 'app/services/hook'
import { useStores } from 'app/models'
import { CardView, CipherView } from 'core/models/view'
import { CollectionView } from 'core/models/view/collectionView'
import { CipherType } from 'core/enums'
import { translate } from 'app/i18n'
import { Button, Header, Screen, TextInput, Text } from 'app/components-v2/cores'
import { CipherOthersInfo, CustomFieldsEdit } from 'app/components-v2/ciphers'
import { PlanStorageLimitModal } from '../../planStorageLimitModal'
import { Select } from 'app/components-v2/utils'

type InputItem = {
  label: string
  value: string
  setter: (val: any) => void
  isRequired?: boolean
  inputType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad'
  placeholder?: string
  isPassword?: boolean
  maskType?: TextInputMaskTypeProp
  maskOptions?: TextInputMaskOptionProp
  isSelect?: boolean
  options?: { label: string; value: string | number | null }[]
}

export const CardEditScreen: FC<AppStackScreenProps<'cards__edit'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { mode } = route.params
  const { colors } = useTheme()

  const { shareFolderAddItem } = useFolder()
  const { createCipher, updateCipher } = useCipherData()
  const { newCipher } = useCipherHelper()
  const { cipherStore, collectionStore } = useStores()

  const selectedCipher: CipherView = cipherStore.cipherView
  const selectedCollection: CollectionView = route.params.collection

  // Params
  const isOwner = (() => {
    if (!selectedCipher.organizationId) {
      return true
    }
    const org = cipherStore.myShares.find(
      (s) => s.organization_id === selectedCipher.organizationId
    )
    return !!org
  })()

  const [isLoading, setIsLoading] = useState(false)

  // Forms

  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [cardName, setCardName] = useState(mode !== 'add' ? selectedCipher.card.cardholderName : '')
  const [brand, setBrand] = useState(mode !== 'add' ? selectedCipher.card.brand : '')
  const [cardNumber, setCardNumber] = useState(mode !== 'add' ? selectedCipher.card.number : '')
  const [expDate, setExpDate] = useState(
    mode !== 'add' ? `${selectedCipher.card.expMonth}/${selectedCipher.card.expYear}` : ''
  )
  const [securityCode, setSecurityCode] = useState(mode !== 'add' ? selectedCipher.card.code : '')
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
  // plan storage limit modal
  const [isOpenModal, setIsOpenModal] = useState(false)
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
      payload = newCipher(CipherType.Card)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const data = new CardView()
    data.cardholderName = cardName
    data.brand = brand
    data.number = cardNumber
    if (expDate) {
      const splitDate = expDate.split('/')
      data.expMonth = splitDate[0]
      data.expYear = splitDate[1]
    }
    data.code = securityCode

    payload.fields = fields
    payload.name = name
    payload.notes = note
    payload.folderId = folder
    payload.card = data
    payload.organizationId = organizationId

    let res = { kind: 'unknown' }
    if (['add', 'clone'].includes(mode)) {
      res = await createCipher(payload, 0, collectionIds)
    } else {
      res = await updateCipher(payload.id, payload, 0, collectionIds)
    }

    if (res.kind === 'ok') {
      // for shared folder
      if (isOwner) {
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
  const cardDetails: InputItem[] = [
    {
      label: translate('card.card_name'),
      value: cardName,
      setter: setCardName,
      isRequired: true,
    },
    {
      label: translate('card.brand'),
      value: brand,
      setter: setBrand,
      isSelect: true,
      options: CARD_BRANDS,
    },
    {
      label: translate('card.card_number'),
      value: cardNumber,
      setter: setCardNumber,
      inputType: 'numeric',
      maskType: 'credit-card',
      placeholder: '0000 0000 0000 0000',
    },
    {
      label: translate('card.exp_date'),
      value: expDate,
      setter: setExpDate,
      inputType: 'numeric',
      maskType: 'datetime',
      maskOptions: {
        format: 'MM/YY',
      },
      placeholder: 'MM/YY',
    },
    {
      label: translate('card.cvv'),
      value: securityCode,
      setter: setSecurityCode,
      maskOptions: {
        mask: '999',
      },
      inputType: 'numeric',
      placeholder: '000',
      isPassword: true,
    },
  ]

  return (
    <Screen
      backgroundColor={colors.block}
      header={
        <Header
          title={
            mode === 'add'
              ? `${translate('common.add')} ${translate('common.card')}`
              : translate('common.edit')
          }
          leftText={translate('common.cancel')}
          onLeftPress={() => navigation.goBack()}
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

      {/* Title */}
      <View style={{ backgroundColor: colors.background, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={BROWSE_ITEMS.card.icon} style={{ height: 40, width: 40 }} />
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
      {/* Title end */}

      <View style={{ padding: 16 }}>
        <Text preset="label" size="base" text={translate('card.card_details').toUpperCase()} />
      </View>

      {/* Info */}
      <View
        style={{
          padding: 16,
          backgroundColor: colors.background,
          paddingBottom: 32,
        }}
      >
        {cardDetails.map((item, index) => (
          <View key={index} style={{ flex: 1, marginTop: index !== 0 ? 20 : 0 }}>
            {item.isSelect ? (
              <Select
                floating
                placeholder={item.label}
                value={item.value}
                options={item.options}
                onChange={(val) => item.setter(val)}
              />
            ) : (
              <TextInput
                isRequired={item.isRequired}
                isPassword={item.isPassword}
                keyboardType={item.inputType || 'default'}
                maskType={item.maskType}
                maskOptions={item.maskOptions}
                label={item.label}
                value={item.value}
                onChangeText={(text) => {
                  item.setter(text)
                }}
                placeholder={item.placeholder}
              />
            )}
          </View>
        ))}
      </View>

      {/* Custom fields */}
      <CustomFieldsEdit fields={fields} setFields={setFields} />

      {/* Others */}
      <CipherOthersInfo
        isOwner={isOwner}
        navigation={navigation}
        hasNote
        note={note}
        onChangeNote={setNote}
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
