import { FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, View, ViewStyle } from "react-native"
import { LoadingHeader } from "../LoadingHeader"
import { ListItem, PasswordHealthView } from "./ListItem"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { Header, ListView, Screen, Text } from "app/components/cores"
import { PasswordHealthScreenProps } from "app/navigators"
import { getCipherLogo } from "@/utils/cipherHelper"
import { CipherAppView } from "@/static/types"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

export const ReusePasswordList: FC<PasswordHealthScreenProps<"reusePasswordList">> = observer(
  ({ navigation }) => {
    const { toolStore } = useStores()
    const { themed } = useAppTheme()

    // -------------- COMPUTED ------------------

    const listData: PasswordHealthView[] = toolStore.reusedPasswords.map((c: CipherView) => {
      const cipherLogo = getCipherLogo(c)
      return {
        ...c,
        imgLogo: cipherLogo,
        notSync: false,
        isDeleted: c.isDeleted,
        count: toolStore.passwordUseMap && toolStore.passwordUseMap.get(c.login.password),
      }
    })

    // -------------- METHODS ------------------

    // Go to detail
    const goToDetail = useCallback(
      (item: CipherAppView) => {
        const data: CipherAppView = {
          ...item,
          revisionDate: null,
        }
        navigation.navigate("browseStack", {
          screen: "cipherDetail",
          params: {
            cipher: data,
          },
        })
      },
      [navigation]
    )

    // -------------- RENDER ------------------

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            titleTx="pass_health:reused_passwords.name"
            onLeftPress={navigation.goBack}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <LoadingHeader />

        <ListView
          contentContainerStyle={styles.contentContainer}
          data={listData}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text tx="common:nothing_here" style={styles.emptyText} />}
          renderItem={({ item }) => <ListItem item={item} goToDetail={goToDetail} />}
          ItemSeparatorComponent={() => <View style={themed($divider)} />}
          estimatedItemSize={71}
        />
      </Screen>
    )
  }
)

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
  marginHorizontal: 16,
})

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 16,
  },
  emptyText: {
    marginTop: 20,
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
})
