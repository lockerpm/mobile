/* eslint-disable react-native/no-inline-styles */
import { FC } from "react"
import { View, Image, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { Text, Screen, Header, Icon } from "app/components/cores"
import { DataBreachScannerScreenProps } from "app/navigators"
import { BreanchResult } from "app/static/types"
import { useAppTheme } from "@/utils/useAppTheme"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

export const DataBreachListScreen: FC<DataBreachScannerScreenProps<"dataBreachList">> = ({
  navigation,
  route: {
    params: { email, data },
  },
}) => {
  const {
    theme: { colors },
  } = useAppTheme()

  const navigateToDetail = (item: BreanchResult) => {
    navigation.navigate("dataBreachDetail", {
      data: item,
    })
  }

  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          titleTx={"data_breach_scanner:bad_news"}
          titleStyle={{ color: colors.error }}
          onLeftPress={navigation.goBack}
        />
      }
      contentContainerStyle={styles.container}
    >
      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <BreachItem onPress={() => navigateToDetail(item)} item={item} />}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 56 }} />
        )}
        ListHeaderComponent={
          <View>
            <Text preset="bold">
              {email}
              <Text
                tx="data_breach_scanner:breaches_found"
                txOptions={{
                  count: data.length,
                }}
              />
            </Text>
          </View>
        }
      />
    </Screen>
  )
}

type BreachItemProps = {
  onPress: () => void
  item: BreanchResult
}

const BreachItem = ({ onPress, item }: BreachItemProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Image
          source={{ uri: item.logo_path }}
          style={[styles.itemLogo, { backgroundColor: colors.disable }]}
          resizeMode="contain"
        />

        <View>
          <Text text={item.title} />
          <Text preset="label" size="sm" text={item.domain} style={styles.mt4} />
        </View>
      </View>

      <Icon icon="caret-right" size={18} color={colors.label} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 16,
    paddingHorizontal: 16,
  },
  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  itemContent: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
  itemLogo: {
    borderRadius: 4,
    height: 40,
    marginRight: 12,
    width: 40,
  },
  mt4: {
    marginTop: 4,
  },
})
