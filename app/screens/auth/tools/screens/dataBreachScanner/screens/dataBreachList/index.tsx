import React, { FC } from "react"
import { View, Image, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { Text, Screen, Header, Icon } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { DataBreachScannerStackScreenProps } from "app/navigators"
import { BreanchResult } from "app/static/types"

export const DataBreachListScreen: FC<DataBreachScannerStackScreenProps<"dataBreachList">> = ({
  navigation,
  route: {
    params: { email, data },
  },
}) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  const navigateToDetail = (item: BreanchResult) => {
    navigation.navigate("dataBreachDetail", {
      data: item,
    })
  }

  return (
    <Screen
      preset="scroll"
      padding
      backgroundColor={colors.block}
      header={<Header leftIcon="arrow-left" title={email} onLeftPress={navigation.goBack} />}
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <BreachItem onPress={() => navigateToDetail(item)} item={item} />}
        ListEmptyComponent={
          <View>
            <Text
              preset="bold"
              text={translate("data_breach_scanner.good_news").toUpperCase()}
              style={{
                marginBottom: 7,
                color: colors.primary,
              }}
            />
            <Text text={`${email}${translate("data_breach_scanner.no_breaches_found")}`} />
          </View>
        }
        ListHeaderComponent={
          <View>
            <Text
              preset="bold"
              text={translate("data_breach_scanner.bad_news").toUpperCase()}
              style={{
                marginBottom: 7,
                color: colors.error,
              }}
            />
            <Text
              text={`${email}${translate("data_breach_scanner.breaches_found", {
                count: data.length,
              })}`}
            />
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
  const { colors } = useTheme()
  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Image source={{ uri: item.logo_path }} style={styles.itemLogo} resizeMode="contain" />

        <View>
          <Text text={item.title} />
          <Text preset="label" size="base" text={item.domain} style={styles.mt4} />
        </View>
      </View>

      <Icon icon="caret-right" size={18} color={colors.secondaryText} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
