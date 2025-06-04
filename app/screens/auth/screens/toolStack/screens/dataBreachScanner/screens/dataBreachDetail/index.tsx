import React, { FC } from "react"
import { View, Image, Dimensions, StyleSheet } from "react-native"
import moment from "moment"
import numeral from "numeral"
import RenderHtml from "react-native-render-html"
import { Text, Screen, Header } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { DataBreachScannerStackScreenProps } from "app/navigators"

const { width } = Dimensions.get("window")
export const DataBreachDetailScreen: FC<DataBreachScannerStackScreenProps<"dataBreachDetail">> = ({
  navigation,
  route: {
    params: { data },
  },
}) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={["bottom"]}
      header={<Header leftIcon="arrow-left" title={data.title} onLeftPress={navigation.goBack} />}
    >
      <View>
        <View style={styles.contentCenter}>
          <Image source={{ uri: data.logo_path }} style={styles.image} resizeMode="contain" />

          <Text preset="bold" size="xl" text={data.title} />
        </View>

        <Text preset="bold" style={styles.domain}>
          {translate("common.website")}:
          <Text preset="default" text={"  " + data.domain} />
        </Text>

        <Text preset="bold" style={styles.mb7}>
          {translate("data_breach_scanner.pwn_count")}:
          <Text preset="default" text={"  " + numeral(data.pwn_count).format("0,0.[00]")} />
        </Text>

        <Text preset="bold" style={styles.mb7}>
          {translate("data_breach_scanner.breach_date")}:
          <Text preset="default" text={"  " + moment(data.breach_date).format("DD/MM/YYYY")} />
        </Text>

        <Text preset="bold" style={styles.mb20}>
          {translate("data_breach_scanner.added_date")}:
          <Text preset="default" text={"  " + moment(data.added_date).format("DD/MM/YYYY")} />
        </Text>

        {/* Desc */}
        <RenderHtml
          contentWidth={width}
          source={{ html: data.description }}
          tagsStyles={{
            body: {
              fontSize: 16,
              color: colors.title,
            },
            a: {
              color: colors.primary,
              textDecorationLine: "none",
            },
          }}
        />
        <Text tx="data_breach_scanner.data_classes" style={styles.mt20} />
        {data.data_classes.map((item, index) => (
          <Text key={index} text={`-  ${item}`} />
        ))}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  contentCenter: {
    justifyContent: "center",
  },
  domain: {
    marginBottom: 7,
    marginTop: 20,
  },
  image: {
    height: 60,
    marginBottom: 10,
    width: 60,
  },
  mb20: {
    marginBottom: 20,
  },
  mb7: {
    marginBottom: 7,
  },
  mt20: {
    marginTop: 20,
  },
})
