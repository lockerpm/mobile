import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  Text, Layout, Button, Header, FloatingInput, CipherOthersInfo, PasswordStrength
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
import { CryptoAccountData, toCryptoAccountData } from "../../../../../utils/crypto"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


type NoteEditScreenProp = RouteProp<PrimaryParamList, 'cryptoAccounts__edit'>;


export const CryptoAccountEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<NoteEditScreenProp>()
  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { newCipher, getPasswordStrength } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()


  const selectedCipher: CipherView = cipherStore.cipherView
  const cryptoAccountData = toCryptoAccountData(selectedCipher?.notes)
  const { mode } = route.params

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [note, setNote] = useState(mode !== 'add' ? cryptoAccountData.notes : '')
  const [username, setUsername] = useState(mode !== 'add' ? cryptoAccountData.username : '')
  const [password, setPassword] = useState(mode !== 'add' ? cryptoAccountData.password : '')
  const [phone, setPhone] = useState(mode !== 'add' ? cryptoAccountData.phone : '')
  const [emailRecovery, setEmailRecovery] = useState(mode !== 'add' ? cryptoAccountData.emailRecovery : '')
  const [url, setUrl] = useState(mode !== 'add' ? cryptoAccountData.uris?.uri : '')
  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)
  const [organizationId, setOrganizationId] = useState(mode === 'edit' ? selectedCipher.organizationId : null)
  const [collectionIds, setCollectionIds] = useState(mode !== 'add' ? selectedCipher.collectionIds : [])

  // Params
  const [isLoading, setIsLoading] = useState(false)

  // Effects
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
      payload = newCipher(CipherType.CryptoAccount)
    } else {
      // @ts-ignore
      payload = {...selectedCipher}
    }

    const cryptoData: CryptoAccountData = {
      username,
      password,
      phone,
      emailRecovery,
      response: null,
      uris: {
        match: null,
        response: null,
        uri: url
      },
      notes: note
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
              ? `${translate('common.add')} ${translate('common.crypto_account')}`
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
          <BROWSE_ITEMS.cryptoAccount.svgIcon height={40} width={40} />
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
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingBottom: 32
        }]}
      >
        {/* Username */}
        <View style={{ flex: 1 }}>
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

          {
            !!password && (
              <PasswordStrength
                value={getPasswordStrength(password).score}
                style={{ marginTop: 15 }}
              />
            )
          }
        </View>
        {/* Password end */}

        {/* Generate password */}
        <Button
          preset="link"
          onPress={() => navigation.navigate('passwordGenerator')}
          style={{
            marginTop: 20
          }}
        >
          <View
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between',
              width: '100%'
            }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesomeIcon
                name="repeat"
                size={18}
                color={color.primary}
              />
              <Text
                preset="green"
                text={translate('common.generate')}
                style={{ fontSize: fontSize.small, marginLeft: 7 }}
              />
            </View>
            <FontAwesomeIcon
              name="angle-right"
              size={20}
              color={color.text}
            />
          </View>
        </Button>
        {/* Generate password end */}

        {/* Phone */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            label={translate('common.phone')}
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        {/* Phone end */}

        {/* Email recovery */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            label={translate('crypto_asset.email_recovery')}
            value={emailRecovery}
            onChangeText={setEmailRecovery}
          />
        </View>
        {/* Web url end */}

        {/* Web url */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            label={translate('password.website_url')}
            value={url}
            onChangeText={setUrl}
          />
        </View>
        {/* Web url end */}
      </View>
      {/* Info end */}

      {/* Others */}
      <CipherOthersInfo
        hasNote
        note={note}
        onChangeNote={setNote}
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
