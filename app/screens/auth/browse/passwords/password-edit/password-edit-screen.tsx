import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { 
  AutoImage as Image, Text, Layout, Button, Header, FloatingInput, CipherOthersInfo
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, commonStyles } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'


type PasswordEditScreenProp = RouteProp<PrimaryParamList, 'passwords__edit'>;


export const PasswordEditScreen = observer(function PasswordEditScreen() {
  const navigation = useNavigation()
  const route = useRoute<PasswordEditScreenProp>()
  const { mode } = route.params

  // Forms
  const [title, setTitle] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')

  return (
    <Layout
      containerStyle={{ 
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={mode === 'add' ? 'Add Password' : 'Edit'}
          goBack={() => navigation.goBack()}
          goBackText="Cancel"
          right={(
            <Button
              preset="link"
              text="Save"
              textStyle={{
                fontSize: 12
              }}
            />
          )}
        />
      )}
    >
      {/* Title */}
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
              label="Title"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>
      </View>
      {/* Title end */}

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
          <Text
            preset="green"
            style={{
              marginTop: 10,
              fontSize: 10
            }}
          >
            <IoniconsIcon
              name="shield-checkmark"
              size={12}
              color={color.palette.green}
            />
            {" Strong"}
          </Text>
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
            isRequired
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
        mode={mode === 'add' ? 'add' : 'move'}
        hasNote
        note={note}
        onChangeNote={setNote}
      />
      {/* Others end */}
    </Layout>
  )
})
