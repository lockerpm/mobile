import React, { FC } from "react"
import { View, Image, Dimensions } from "react-native"
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
        <View style={{ justifyContent: "center" }}>
          <View
            style={{
              height: 60,
              width: 60,
              marginBottom: 10,
            }}
          >
            <Image
              source={{ uri: data.logo_path }}
              style={{
                flex: 1,
                height: undefined,
                width: undefined,
              }}
              resizeMode="contain"
            />
          </View>

          <Text preset="bold" size="xl" text={data.title} />
        </View>

        <Text
          preset="bold"
          style={{
            marginTop: 20,
            marginBottom: 7,
          }}
        >
          {translate("common.website")}:
          <Text
            text={"  " + data.domain}
            style={{
              fontWeight: "normal",
            }}
          />
        </Text>

        <Text
          preset="bold"
          style={{
            marginBottom: 7,
          }}
        >
          {translate("data_breach_scanner.pwn_count")}:
          <Text
            text={"  " + numeral(data.pwn_count).format("0,0.[00]")}
            style={{
              fontWeight: "normal",
            }}
          />
        </Text>

        <Text
          preset="bold"
          style={{
            marginBottom: 7,
          }}
        >
          {translate("data_breach_scanner.breach_date")}:
          <Text
            text={"  " + moment(data.breach_date).format("DD/MM/YYYY")}
            style={{
              fontWeight: "normal",
            }}
          />
        </Text>

        <Text
          preset="bold"
          style={{
            marginBottom: 20,
          }}
        >
          {translate("data_breach_scanner.added_date")}:
          <Text
            text={"  " + moment(data.added_date).format("DD/MM/YYYY")}
            style={{
              fontWeight: "normal",
            }}
          />
        </Text>
        {/* Basic info end */}

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
        <Text
          text={`${translate("data_breach_scanner.data_classes")}:`}
          style={{
            marginTop: 20,
          }}
        />
        {data.data_classes.map((item, index) => (
          <Text key={index} text={`-  ${item}`} />
        ))}
      </View>
    </Screen>
  )
}
