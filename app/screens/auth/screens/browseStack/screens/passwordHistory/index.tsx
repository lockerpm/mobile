import { FC, useState } from "react"
import { Screen, Header, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { HistoryItem } from "./HistoryItem"
import { PasswordHistoryView } from "core/models/view/passwordHistoryView"
import { HistoryItemAction } from "./HistoryItemAction"
import { BrowseScreenProps } from "app/navigators"
import { CipherIconImage } from "app/components/ciphers"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"

export const PasswordHistoryScreen: FC<BrowseScreenProps<"passwordsHistory">> = observer(
  ({
    navigation,
    route: {
      params: { cipher },
    },
  }) => {
    const { user } = useStores()
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { translate } = useAppLocale()

    const [selectHistory, setSelectHistory] = useState<PasswordHistoryView | null>(null)

    const data = user.isFreePlan
      ? cipher.passwordHistory?.slice(Math.max(cipher.passwordHistory.length - 3, 0))
      : cipher.passwordHistory

    const passwordHistories = data

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} />}
        contentContainerStyle={styles.ph16}
      >
        <HistoryItemAction
          isOpen={!!selectHistory}
          onClose={() => {
            setSelectHistory(null)
          }}
          selectPassword={selectHistory?.password}
          selectedCipher={cipher}
          onRestore={() => {
            setSelectHistory(null)
            navigation.goBack()
          }}
        />

        <CipherIconImage
          resizeMode="contain"
          cipherType={cipher.type}
          source={cipher.imgLogo}
          style={styles.image}
        />

        <Text preset="bold" size="xl" style={styles.name} text={cipher.name} />
        <Text preset="label" style={styles.centerText} text={cipher.login.username} />

        {user.isFreePlan && (
          <View style={themed($freeContainer)}>
            <Text>
              {translate("password_history:free.note")}
              <Text preset="bold"> {translate("password_history:free.go_premium")}</Text>
            </Text>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate("menuStack", {
                  screen: "payment",
                })
              }}
            >
              <Text
                color={colors.primary}
                style={styles.upgrade}
                tx="password_history:free.upgrade"
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mt12}>
          {passwordHistories.map((i, index) => (
            <HistoryItem
              key={index}
              password={i.password}
              createAt={i.lastUsedDate}
              setSelectHistory={() => {
                setSelectHistory(i)
              }}
            />
          ))}
        </View>
      </Screen>
    )
  }
)

const $freeContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderColor: colors.border,
  borderWidth: 1,
  backgroundColor: colors.block,
  padding: 16,
  marginTop: 16,
})

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  image: {
    alignSelf: "center",
    borderRadius: 8,
    height: 55,
    width: 55,
  },
  mt12: {
    marginTop: 12,
  },
  name: {
    marginTop: 16,
    textAlign: "center",
  },
  ph16: {
    paddingHorizontal: 16,
  },
  upgrade: {
    alignSelf: "flex-end",
    flexGrow: 1,
    marginTop: 16,
  },
})
