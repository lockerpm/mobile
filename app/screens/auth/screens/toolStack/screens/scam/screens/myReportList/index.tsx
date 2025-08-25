import { Header, Screen, Text } from "@/components/cores"
import { useStores } from "@/models"
import { ScamScreenProps } from "@/navigators"
import { toolApi } from "@/services/api"
import { useToast } from "@/services/utils"
import { ScamMyReportData, ScamType } from "@/static/types"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useEffect, useState } from "react"
import { FlatList, StyleSheet, View, ViewStyle } from "react-native"
import { ListItem } from "./ListItem"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

export const ScamMyReportListScreen: FC<ScamScreenProps<"myReportList">> = observer(
  ({ navigation }) => {
    const { themed } = useAppTheme()
    const { user } = useStores()
    const { notifyApiError } = useToast()

    const [isFirstLoad, setIsFirstLoad] = useState(false)
    const [data, setData] = useState<ScamMyReportData[]>([])

    const fetchMyReportList = async () => {
      setIsFirstLoad(true)
      const res = await toolApi.scamMyListReport(user.apiToken)
      if (res.kind === "ok") {
        if (!!res.data.results && res.data.results.length > 0) {
          setData(res.data.results.filter((item) => item.type === ScamType.Phone))
        }
      } else {
        notifyApiError(res)
      }
      setIsFirstLoad(false)
    }

    const deleteReport = useCallback(
      async (id: string) => {
        const res = await toolApi.scamDeleteMyReport(user.apiToken, id)
        if (res.kind === "ok") {
          setData((prev) => prev.filter((item) => item.id !== id))
        } else {
          notifyApiError(res)
        }
      },
      [user.apiToken]
    )

    // ------------------EFFECTS-------------------

    useEffect(() => {
      fetchMyReportList()
    }, [])

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        disableAvoidkeyboard
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="scam:home.myReportList.title"
            rightLoading={isFirstLoad}
          />
        }
        contentContainerStyle={styles.container}
      >
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListItem item={item} onDelete={deleteReport} />}
          ItemSeparatorComponent={() => <View style={themed($border)} />}
          ListEmptyComponent={
            !isFirstLoad ? (
              <View style={styles.empty}>
                <Text size="xs" tx="scam:myReportList.empty.desc" style={styles.emptyLabel} />
              </View>
            ) : undefined
          }
        />
      </Screen>
    )
  }
)

const $border: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginHorizontal: 16,
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyLabel: {
    textAlign: "center",
  },
})
