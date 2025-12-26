import { FC, useCallback } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { Header, ListView, Screen, Text } from "app/components/cores"
import { useStores } from "app/models"
import { PasswordHealthScreenProps } from "app/navigators/navigators.types"
import { CipherView } from "core/models/view"

import { CipherAppView } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { getCipherLogo } from "@/utils/cipherHelper"
import { useAppTheme } from "@/utils/useAppTheme"

import { ListItem, WeakPasswordView } from "./ListItem"
import { LoadingHeader } from "../LoadingHeader"

export const WeakPasswordListScreen: FC<PasswordHealthScreenProps<"weakPasswordList">> = observer(
  ({ navigation }) => {
    const { toolStore } = useStores()
    const { themed } = useAppTheme()

    // -------------- COMPUTED ------------------

    const listData: WeakPasswordView[] = toolStore.weakPasswords.map((c: CipherView) => {
      const cipherLogo = getCipherLogo(c)
      return {
        ...c,
        imgLogo: cipherLogo,
        notSync: false,
        isDeleted: c.isDeleted,
        strength: toolStore.passwordStrengthMap && toolStore.passwordStrengthMap.get(c.id),
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
            titleTx="pass_health:weak_passwords.name"
            leftIcon="arrow-left"
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
