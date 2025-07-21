import { FC } from "react"
import { View, Image, Dimensions, StyleSheet } from "react-native"
import moment from "moment"
import numeral from "numeral"
import RenderHtml from "react-native-render-html"
import { Text, Screen, Header } from "app/components/cores"
import { DataBreachScannerScreenProps } from "app/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"

const { width } = Dimensions.get("window")
export const DataBreachDetailScreen: FC<DataBreachScannerScreenProps<"dataBreachDetail">> = ({
  navigation,
  route: {
    params: { data },
  },
}) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={<Header leftIcon="arrow-left" title={data.title} onLeftPress={navigation.goBack} />}
      contentContainerStyle={styles.ph16}
    >
      <View>
        <View style={styles.contentCenter}>
          <Image
            source={{ uri: data.logo_path }}
            style={[styles.image, { backgroundColor: colors.disable }]}
            resizeMode="contain"
          />
          <View>
            <Text preset="bold" style={styles.domain}>
              {translate("common:website")}:
              <Text preset="default" text={"  " + data.domain} />
            </Text>

            <Text preset="bold" style={styles.mb7}>
              {translate("data_breach_scanner:pwn_count")}:
              <Text preset="default" text={"  " + numeral(data.pwn_count).format("0,0.[00]")} />
            </Text>

            <Text preset="bold" style={styles.mb7}>
              {translate("data_breach_scanner:breach_date")}:
              <Text preset="default" text={"  " + moment(data.breach_date).format("DD/MM/YYYY")} />
            </Text>

            <Text preset="bold" style={styles.mb20}>
              {translate("data_breach_scanner:added_date")}:
              <Text preset="default" text={"  " + moment(data.added_date).format("DD/MM/YYYY")} />
            </Text>
          </View>
        </View>

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
        <Text tx="data_breach_scanner:data_classes" style={styles.mt20} />
        {data.data_classes.map((item, index) => (
          <Text key={index} text={`-  ${item}`} />
        ))}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  contentCenter: {
    flexDirection: "row",
  },
  domain: {
    marginBottom: 7,
  },
  image: {
    borderRadius: 8,
    height: 60,
    marginBottom: 10,
    marginRight: 16,
    marginTop: 4,
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
  ph16: {
    paddingHorizontal: 16,
  },
})
