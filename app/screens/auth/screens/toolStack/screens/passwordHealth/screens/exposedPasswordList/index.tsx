import { FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, View, ViewStyle } from "react-native"
import { LoadingHeader } from "../LoadingHeader"
import { ListItem, PasswordHealthView } from "../reusePasswordList/ListItem"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { Header, ListView, Screen, Text } from "app/components/cores"
import { PasswordHealthScreenProps } from "app/navigators"
import { getCipherLogo } from "@/utils/cipherHelper"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { CipherAppView } from "@/static/types"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

export const ExposedPasswordList: FC<PasswordHealthScreenProps<"exposedPasswordList">> = observer(
  ({ navigation }) => {
    const { toolStore } = useStores()
    const { themed } = useAppTheme()

    // -------------- COMPUTED ------------------

    const listData: PasswordHealthView[] = toolStore.exposedPasswords.map((c: CipherView) => {
      const cipherLogo = getCipherLogo(c)
      return {
        ...c,
        imgLogo: cipherLogo,
        notSync: false,
        isDeleted: c.isDeleted,
        count: toolStore.exposedPasswordMap && toolStore.exposedPasswordMap.get(c.id),
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
            titleTx="pass_health:exposed_passwords.name"
            onLeftPress={navigation.goBack}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <LoadingHeader />

        <ListView
          data={listData}
          keyExtractor={(item, index) => item.id.toString() + index.toString()}
          ListEmptyComponent={<Text tx="common:nothing_here" style={styles.emptyText} />}
          contentContainerStyle={styles.contentContainer}
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
