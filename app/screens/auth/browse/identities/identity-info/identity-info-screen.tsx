import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Button, AutoImage as Image, Text, FloatingInput } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { IdentityAction } from "../identity-action"


export const IdentityInfoScreen = observer(function IdentityInfoScreen() {
  const navigation = useNavigation()

  const [showAction, setShowAction] = useState(false)

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
      <IdentityAction
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
            source={BROWSE_ITEMS.indentity.icon}
            style={{ height: 55, width: 55, marginBottom: 5 }}
          />
          <Text
            preset="header"
            text="Duc Ha"
          />
        </View>
      </View>
      {/* Intro end */}

      {/* Info */}
      <View style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          paddingVertical: 22
      }]}>
        <FloatingInput
          label="Website URL"
          value="https://whitehub.net"
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
      </View>
      {/* Info end */}
    </Layout>
  )
})
