import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Linking, View } from "react-native"
import { 
  Layout, Header, Button, AutoImage as Image, Text, FloatingInput, PasswordStrength, CipherInfoCommon 
} from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { PasswordAction } from "../password-action"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"


export const PasswordInfoScreen = observer(function PasswordInfoScreen() {
  const navigation = useNavigation()
  const { getWebsiteLogo, getPasswordStrength } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const [showAction, setShowAction] = useState(false)

  // ------------------ COMPUTED --------------------

  const passwordStrength = getPasswordStrength(selectedCipher.login.password)


  // ------------------ RENDER --------------------

  return (
    <Layout
      containerStyle={{ 
        backgroundColor: color.block,
        paddingHorizontal: 0,
        paddingTop: 0
      }}
      header={(
        <Header
          goBack={() => navigation.goBack()}
          right={(
            <Button
              preset="link"
              onPress={() => setShowAction(true)}
            >
              <IoniconsIcon
                name="ellipsis-horizontal"
                size={16}
                color={color.title}
              />
            </Button>
          )}
        />
      )}
    >
      <PasswordAction
        navigation={navigation}
        isOpen={showAction}
        onClose={setShowAction}
      />

      {/* Intro */}
      <View>
        <View style={[commonStyles.CENTER_VIEW, {
          backgroundColor: color.palette.white,
          paddingTop: 20,
          paddingBottom: 30,
          marginBottom: 10
        }]}>
          <Image
            source={
              selectedCipher.login.uri 
                ? getWebsiteLogo(selectedCipher.login.uri)
                : BROWSE_ITEMS.password.icon
            }
            backupSource={BROWSE_ITEMS.password.icon}
            style={{ height: 55, width: 55, marginBottom: 5 }}
          />
          <Text
            preset="header"
            text={selectedCipher.name}
          />
        </View>
      </View>
      {/* Intro end */}

      {/* Info */}
      <View style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingVertical: 22
      }]}>
        {/* Username */}
        <FloatingInput
          fixedLabel
          copyAble
          label="Email or Username"
          value={selectedCipher.login.username}
          editable={false}
        />

        {/* Password */}
        <FloatingInput
          isPassword
          fixedLabel
          copyAble
          label="Password"
          value={selectedCipher.login.password}
          editable={false}
          style={{ marginVertical: 20 }}
        />

        {/* Password strength */}
        <Text
          text="Password Security"
          style={{ fontSize: 10 }}
        />
        <PasswordStrength preset="text" value={passwordStrength.score} />

        {/* Website URL */}
        <FloatingInput
          fixedLabel
          label="Website URL"
          value={selectedCipher.login.uri}
          editable={false}
          style={{ marginVertical: 20 }}
          buttonRight={(
            <Button
              disabled={!selectedCipher.login.uri}
              preset="link"
              onPress={() => {
                Linking.openURL(selectedCipher.login.uri)
              }}
            >
              <FontAwesomeIcon 
                name="external-link"
                size={14} 
                color={color.text} 
              />
            </Button>
          )}
        />

        {/* Notes */}
        <FloatingInput
          label="Notes"
          value={selectedCipher.notes}
          editable={false}
          textarea
          fixedLabel
          copyAble
        />

        {/* Others common info */}
        <CipherInfoCommon cipher={selectedCipher} />
      </View>
      {/* Info end */}
    </Layout>
  )
})
