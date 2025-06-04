import React, { FC, useEffect, useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { OtpList } from "./OtpList"
import { Text, Screen, Header, Icon } from "app/components/cores"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { useAppLocale, useTheme } from "app/services/context"
import { AuthenticatorAddAction } from "app/screens/auth/screens/tabs/screens/authenticator/AuthenticatorAddAction"
import { SearchBar } from "app/components/utils"
import { observer } from "mobx-react-lite"
import { useTool } from "app/services/hook"
import { CipherType } from "core/enums"
import { FREE_PLAN_LIMIT } from "app/static/constants"
import { BrowseStackScreenProps } from "app/navigators"

export const Password2FASetupScreen: FC<BrowseStackScreenProps<"passwords2faSetup">> = observer(
  (props) => {
    const navigation: any = props.navigation
    const route = props.route

    const { cipherStore, user } = useStores()

    const [cipherCount, setCipherCount] = useState(0)
    const [searchText, setSearchText] = useState("")
    const [selectedOtp, setSelectedOtp] = useState<CipherView>(null)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const { translate } = useAppLocale()
    const { colors } = useTheme()
    const { getCipherCount } = useTool()

    const disableAddNew = user.isFreePlan && cipherCount >= FREE_PLAN_LIMIT.OTP

    useEffect(() => {
      const counting = async () => {
        if (user.isFreePlan) {
          const count = await getCipherCount([CipherType.TOTP])
          setCipherCount(count)
        }
      }
      counting()
    }, [])
    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => {
              navigation.goBack()
            }}
            title={translate("password.2fa_setup")}
            rightText={translate("common.save")}
            rightTextColor={colors.primary}
            onRightPress={() => {
              cipherStore.setSelectedTotp(selectedOtp?.notes || "-1")
              navigation.goBack()
            }}
          />
        }
        backgroundColor={colors.block}
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <AuthenticatorAddAction
          passwordTotp
          passwordMode={route.params.mode}
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          navigation={navigation}
          allItemsLength={0}
        />
        <View
          style={{
            marginTop: 12,
            backgroundColor: colors.background,
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
            <Text text={translate("password.no_otp")} />
            {selectedOtp === null && <Icon icon="check" size={19} color={colors.primary} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onPress={() => {
              if (disableAddNew) {
                navigation.navigate("payment")
              } else {
                setIsAddOpen(true)
              }
            }}
          >
            <Text color={colors.title} text={translate("password.add_otp")} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            padding: 16,
          }}
        >
          <Text preset="label" tx="password.existing_otp" />
        </View>

        <View
          style={{
            backgroundColor: colors.background,
            flex: 1,
          }}
        >
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            containerStyle={{ margin: 16 }}
          />
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
  },
)
