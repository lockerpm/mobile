import { Button, Header, Icon, Screen, Text } from "@/components/cores"
import { ScamScreenProps } from "@/navigators"
import { toolApi } from "@/services/api"
import { ScamMyReportData } from "@/static/types"
import { colorTransparency, ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { FC, useCallback, useEffect, useState } from "react"
import { FlatList, StyleSheet, View, ViewStyle } from "react-native"
import { ListItem } from "./ListItem"

export const ScamLookupResultScreen: FC<ScamScreenProps<"lookupResult">> = ({
  navigation,
  route: {
    params: {
      data: { result },
    },
  },
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [users, setUsers] = useState<ScamMyReportData[]>([])

  const checkUsersReport = useCallback(async () => {
    const res = await toolApi.scamListUsersReport(result.id)
    if (res.kind === "ok" && res.data.results.length > 0) {
      setUsers(res.data.results)
    }
  }, [result.id])

  const navigateToReport = useCallback(() => {
    navigation.navigate("report", {
      phoneNumber: result.value,
    })
  }, [navigation, result.value])

  useEffect(() => {
    checkUsersReport()
  }, [checkUsersReport])
  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} title={result.value} />}
      contentContainerStyle={styles.container}
      footer={
        <View style={styles.ph16}>
          <Text tx="scam:lookupResult.yourPhone" />
          <Text>
            <Text tx="scam:lookupResult.contact" />
            <Text color={colors.primary} text="support@locker.io" style={styles.support} />
            <Text tx="scam:lookupResult.support" />
          </Text>
          <Button tx="scam:lookupResult.btn" style={styles.btn} onPress={navigateToReport} />
        </View>
      }
    >
      <View style={themed($warningContainer)}>
        <View style={themed($warningLeft)} />
        <View style={themed($warningInfo)}>
          <Icon icon="info" size={12} containerStyle={themed($warningIcon)} color={colors.error} />
          <Text weight="semiBold" tx="scam:lookupResult.maybe.title" color={colors.error} />
        </View>
        <Text>
          <Text weight="semiBold" tx="scam:lookupResult.maybe.label" />
          <Text tx={`scam:report.type.${result.phishing_type}`} />
        </Text>
      </View>

      {users.length > 0 && (
        <Text
          weight="medium"
          tx={"scam:lookupResult.community"}
          txOptions={{ count: users.length }}
          style={styles.mv12}
        />
      )}
      <FlatList
        data={users}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item }) => <ListItem item={item} />}
        ItemSeparatorComponent={() => <View style={styles.h12} />}
      />
    </Screen>
  )
}

const $warningLeft: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  left: 0,
  top: 16,
  bottom: 16,
  width: 8,
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
  backgroundColor: colors.error,
})

const $warningContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  paddingLeft: 28,
  backgroundColor: colorTransparency(colors.error, 20),
})

const $warningInfo: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 24,
  padding: 4,
  paddingRight: 8,
  paddingHorizontal: 6,
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.error,
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
  marginBottom: 4,
})

const $warningIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 24,
  padding: 6,
  backgroundColor: colorTransparency(colors.error, 10),
  marginRight: 6,
})

const styles = StyleSheet.create({
  btn: {
    marginTop: 12,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  h12: {
    height: 12,
  },
  mv12: {
    marginVertical: 12,
  },
  ph16: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  support: {
    textDecorationLine: "underline",
  },
})
