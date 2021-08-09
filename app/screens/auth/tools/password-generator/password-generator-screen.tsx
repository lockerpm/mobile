import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Text, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, commonStyles } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'


export const PasswordGeneratorScreen = observer(function PasswordGeneratorScreen() {
  const navigation = useNavigation()

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title="Password Generator"
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 10 }} />
          )}
        />
      )}
      footer={(
        <Button
          isNativeBase
          text="Use Password"
        />
      )}
    >
      {/* Password */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Text preset="black" style={{ flex: 1, fontSize: 16 }}>
            jPk%4TJ%K^87
          </Text>
          <IoniconsIcon
            name="copy-outline"
            size={18}
            color={color.textBlack}
          />
        </View>

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

      <View style={commonStyles.SECTION_PADDING}>
        <Text text="OPTIONS" style={{ fontSize: 10 }} />
      </View>

      {/* Options */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >

      </View>
      {/* Options end */}
    </Layout>
  )
})
