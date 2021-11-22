import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import {
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo, PasswordStrength
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherType } from "../../../../../../core/enums"
import { CipherView, LoginUriView, LoginView } from "../../../../../../core/models/view"


type PasswordEditScreenProp = RouteProp<PrimaryParamList, 'passwords__edit'>;


export const PasswordEditScreen = observer(function PasswordEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<PasswordEditScreenProp>()
  const { mode } = route.params
  const { getPasswordStrength, newCipher, createCipher, updateCipher, translate } = useMixins()
  const { cipherStore, uiStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView
  const color = uiStore.isDark ? colorDark : colorLight

  // ----------------- PARAMS ------------------

  const [isLoading, setIsLoading] = useState(false)

  // Forms
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [folder, setFolder] = useState(null)
  const [organizationId, setOrganizationId] = useState(null)
  const [collectionIds, setCollectionIds] = useState([])

  // ----------------- EFFECTS ------------------

  useEffect(() => {
    if (mode !== 'add') {
      setName(selectedCipher.name)
      setUsername(selectedCipher.login.username)
      setPassword(selectedCipher.login.password)
      setUrl(selectedCipher.login.uri)
      setNote(selectedCipher.notes)
      setFolder(selectedCipher.folderId)
      setOrganizationId(selectedCipher.organizationId)
      setCollectionIds(selectedCipher.collectionIds)
    }
    if (uiStore.deepLinkAction === 'add') {
      setUrl(uiStore.deepLinkAddDomain)
    }
    if (uiStore.deepLinkAction === 'save') {
      setUrl(uiStore.deepLinkAddDomain)
    }
  }, [])

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

  // ----------------- METHODS ------------------

  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.Login)
    } else {
      // @ts-ignore
      payload = {...selectedCipher}
    }

    const data = new LoginView()
    data.username = username
    data.password = password
    if (url) {
      const uriView = new LoginUriView()
      uriView.uri = url
      data.uris = [uriView]
    }

    payload.name = name
    payload.notes = note
    payload.folderId = folder
    payload.login = data
    payload.organizationId = organizationId
    const passwordStrength = getPasswordStrength(password).score

    let res = { kind: 'unknown' }
    if (['add', 'clone'].includes(mode)) {
      res = await createCipher(payload, passwordStrength, collectionIds)
    } else {
      res = await updateCipher(payload.id, payload, passwordStrength, collectionIds)
    }

    setIsLoading(false)
    if (res.kind === 'ok') {
      uiStore.clearDeepLink()
      navigation.goBack()
    }
  }

  // ----------------- RENDER ------------------

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
              ? `${translate('common.add')} ${translate('common.password')}`
              : translate('common.edit')
          }
          goBack={() => {
            uiStore.clearDeepLink()
            navigation.goBack()
          }}
          goBackText={translate('common.cancel')}
          right={(
            <Button
              isDisabled={isLoading || !name.trim()}
              preset="link"
              text={translate('common.save')}
              onPress={handleSave}
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
          <Image
            source={BROWSE_ITEMS.password.icon}
            style={{ height: 40, width: 40, marginRight: 10 }}
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
          text={translate('password.login_details').toUpperCase()}
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
            label={translate('password.username')}
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
                color={color.palette.green}
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
        navigation={navigation}
        hasNote
        note={note}
        onChangeNote={setNote}
        folderId={folder}
        organizationId={organizationId}
        setOrganizationId={setOrganizationId}
        collectionIds={collectionIds}
        setCollectionIds={setCollectionIds}
      />
      {/* Others end */}
    </Layout>
  )
})
