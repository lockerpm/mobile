import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { 
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo, PasswordStrength
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherType } from "../../../../../../core/enums"
import { CipherView, LoginView } from "../../../../../../core/models/view"


type PasswordEditScreenProp = RouteProp<PrimaryParamList, 'passwords__edit'>;


export const PasswordEditScreen = observer(function PasswordEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<PasswordEditScreenProp>()
  const { mode } = route.params
  const { getPasswordStrength, newCipher, createCipher, updateCipher } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  // Params
  const [isLoading, setIsLoading] = useState(false)

  // Forms
  const [name, setName] = useState(mode !== 'add' ? selectedCipher.name : '')
  const [username, setUsername] = useState(mode !== 'add' ? selectedCipher.login.username : '')
  const [password, setPassword] = useState(mode !== 'add' ? selectedCipher.login.password : '')
  const [url, setUrl] = useState(mode !== 'add' ? selectedCipher.login.uri : '')
  const [note, setNote] = useState(mode !== 'add' ? selectedCipher.notes : '')
  const [folder, setFolder] = useState(mode !== 'add' ? selectedCipher.folderId : null)

  // Watchers
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (cipherStore.generatedPassword) {
        setPassword(cipherStore.generatedPassword)
        cipherStore.setGeneratedPassword('')
      }

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
      payload = newCipher(CipherType.Login)
    } else {
      payload = { ...selectedCipher }
    }

    const data = new LoginView()
    data.username = username
    data.password = password
    if (url) {
      data.uris = [url]
    }

    payload.name = name
    payload.notes = note
    payload.folderId = folder
    payload.login = data
    const passwordStrength = getPasswordStrength(password).score
    const collectionIds = payload.collectionIds

    let res = { kind: 'unknown' }
    if (mode === 'add') {
      res = await createCipher(payload, passwordStrength, collectionIds)
    } else {
      res = await updateCipher(payload.id, payload, passwordStrength, collectionIds)
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
          title={mode === 'edit' ? 'Edit' : 'Add Password'}
          goBack={() => navigation.goBack()}
          goBackText="Cancel"
          right={(
            <Button
              preset="link"
              text="Save"
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
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW]}
        >
          <Image
            source={BROWSE_ITEMS.password.icon}
            style={{ height: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label="Name"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text text="LOGIN DETAILS" style={{ fontSize: 10 }} />
      </View>

      {/* Info */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingBottom: 32
        }]}
      >
        {/* Username */}
        <View style={{ flex: 1 }}>
          <FloatingInput
            label="Email or Username"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        {/* Username end */}

        {/* Password */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            isPassword
            label="Password"
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
                text="Generate"
                style={{ fontSize: 12, marginLeft: 7 }}
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
            label="Website URL"
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
      />
      {/* Others end */}
    </Layout>
  )
})
