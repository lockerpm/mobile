import { FC } from "react"
import { FlatList, StyleSheet } from "react-native"
import { Screen, Header } from "app/components/cores"
import { NotiListItem } from "./InAppNotiItem"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { HomeScreenProps } from "app/navigators"
import { useAppLocale } from "@/i18n"

export const InAppListNotificationScreen: FC<HomeScreenProps<"appListNoti">> = observer(
  ({ navigation, route }) => {
    const { user } = useStores()
    const { lang } = useAppLocale()

    const markRead = async (id: string) => {
      await user.markReadInAppNoti(id)
    }

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx={"common:notifications"}
          />
        }
        contentContainerStyle={styles.container}
      >
        <FlatList
          data={route.params.notifications.results}
          style={styles.listContainer}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <NotiListItem lang={lang === "vi" ? "vi" : "en"} item={item} markRead={markRead} />
          )}
        />
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
})
