import React, { useState } from "react"
import { Header, Screen } from "../../../../../components/cores"
import { useNavigation } from "@react-navigation/native"
import { Button, SearchBar, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons"
import { TouchableOpacity, View } from "react-native"
import { OtpList } from "./otp-list"
import { CipherView } from "../../../../../../core/models/view"
import { AuthenticatorAddAction } from "../../../tools/authenticator/authenticator-add-action"
import { useStores } from "../../../../../models"

export const Password2FASetupScreen = () => {
  const navigation: any = useNavigation()
  const { cipherStore } = useStores()

  const [searchText, setSearchText] = useState("")
  const [selectedOtp, setSelectedOtp] = useState<CipherView>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)


  const { translate, color } = useMixins()
  return (
    <Screen
      safeAreaEdges={["top", "bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          backgroundColor={color.background}
          title={translate("password.2fa_setup")}
          RightActionComponent={
            <Button
              preset="link"
              text={translate("common.save")}
              style={{ paddingRight: 16 }}
              onPress={() => {
                cipherStore.setSelectedTotp(selectedOtp?.notes || "-1")
                navigation.goBack()
              }}
            />
          }
        />
      }
      style={{
        backgroundColor: color.block,
      }}
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <AuthenticatorAddAction
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
        allItemsLength={0}
      />
      <View
        style={{
          marginTop: 12,
          backgroundColor: color.background,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onPress={() => setSelectedOtp(null)}
        >
          <Text preset="black" text={translate('password.no_otp')} />
          {selectedOtp === null && (
            <MaterialCommunityIconsIcon name="check" size={19} color={color.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onPress={() => setIsAddOpen(true)}
        >
          <Text preset="black" text={translate('password.add_otp')} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          padding: 16,
        }}
      >
        <Text text="CHOOSE AN EXISTING OTP" />
      </View>

      <View
        style={{
          backgroundColor: color.background,
          flex: 1,
          padding: 16,
        }}
      >
        <SearchBar value={searchText} onSearch={setSearchText} />

        <OtpList
          searchText={searchText}
          sortList={{
            orderField: "revisionDate",
            order: "desc",
          }}
          selectedOtp={selectedOtp}
          setSelectedOtp={setSelectedOtp}
        />
      </View>
    </Screen>
  )
}
