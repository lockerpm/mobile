import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Button, AutoImage as Image, Text, FloatingInput, PasswordStrength } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { PasswordAction } from "../password-action"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { useCoreService } from "../../../../../services/core-service"


export const PasswordInfoScreen = observer(function PasswordInfoScreen() {
  const navigation = useNavigation()
  const { cipherStore, user } = useStores()
  const { getWebsiteLogo, getTeam } = useMixins()
  const { passwordGenerationService } = useCoreService()

  const [showAction, setShowAction] = useState(false)

  // ------------------ COMPUTED --------------------

  const cipher = cipherStore.selectedCipher
  const passwordStrength = passwordGenerationService.passwordStrength(cipher.login.password, ['cystack']) || {}


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
              cipher.login.uri 
                ? getWebsiteLogo(cipher.login.uri)
                : BROWSE_ITEMS.password.icon
            }
            backupSource={BROWSE_ITEMS.password.icon}
            style={{ height: 55, width: 55, marginBottom: 5 }}
          />
          <Text
            preset="header"
            text={cipher.name}
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
          label="Email or Username"
          value={cipher.login.username}
          editable={false}
        />

        {/* Password */}
        <FloatingInput
          isPassword
          fixedLabel
          label="Password"
          value={cipher.login.password}
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
          value={cipher.login.uri}
          editable={false}
          style={{ marginVertical: 20 }}
          buttonRight={(
            <Button
              preset="link"
            >
              <FontAwesomeIcon 
                name="external-link"
                size={18} 
                color={color.text} 
              />
            </Button>
          )}
        />

        {/* Notes */}
        <FloatingInput
          label="Notes"
          value={cipher.notes}
          editable={false}
          textarea
          fixedLabel
        />

        {/* Owned by */}
        <Text
          text="Owned by"
          style={{ fontSize: 10, marginTop: 20 }}
        />
        <Text
          preset="black"
          text={getTeam(user.teams, cipher.organizationId).name || 'Me'}
        />

        {/* Folder */}
        <Text
          text="Folder"
          style={{ fontSize: 10, marginTop: 20 }}
        />
      </View>
      {/* Info end */}
    </Layout>
  )
})
