import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import moment from "moment"
import React from "react"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { AutoImage as Image, Divider, Text, Button } from "../../../../../../components"
import { Header, Icon, Screen } from "../../../../../../components/cores"
import { useStores } from "../../../../../../models"
import { BrowseParamList } from "../../../../../../navigators"
import { useMixins } from "../../../../../../services/mixins"
import { useCipherHelpersMixins } from "../../../../../../services/mixins/cipher/helpers"
import { commonStyles, fontSize } from "../../../../../../theme"

export const QuickSharesDetailScreen = () => {
  const navigation = useNavigation()
  const { color, copyToClipboard } = useMixins()
  const { getCipherInfo, getCipherDescription } = useCipherHelpersMixins()
  const route = useRoute<RouteProp<BrowseParamList, "quickShareItemsDetail">>()
  const { cipherStore } = useStores()

  const send = route.params.send

  const cipherMapper = (() => {
    const cipherInfo = getCipherInfo(send.cipher)
    return cipherInfo
  })()

  const $horizontalStyle: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  }

  return (
    <Screen
      safeAreaEdges={["top", "bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title="Quick share details"
        />
      }
      footer={
        <View
          style={{
            padding: 16,
          }}
        >
          <Button
            text="Copy Share link"
            onPress={() => {
              const url = cipherStore.getPublicShareUrl(send.accessId, send.key)
              copyToClipboard(url)
            }}
          />
          <Button
            preset="outline"
            text="Copy Share link"
            onPress={() => {
              const url = cipherStore.getPublicShareUrl(send.accessId, send.key)
              copyToClipboard(url)
            }}
            textStyle={{
              color: color.error,
            }}
            style={{
              marginTop: 16,
              borderColor: color.error,
            }}
          />
        </View>
      }
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <TouchableOpacity
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: color.line,
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onPress={() => {
          cipherStore.setSelectedCipher(send.cipher)
          navigation.navigate(`${cipherMapper.path}__info`)
        }}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          {cipherMapper.svg ? (
            <cipherMapper.svg height={40} width={40} />
          ) : (
            <Image
              source={cipherMapper.img}
              backupSource={cipherMapper.backup}
              style={{ height: 40, width: 40, borderRadius: 8 }}
            />
          )}
          <View style={{ marginLeft: 10 }}>
            <Text preset="semibold" text={send.cipher.name} numberOfLines={2} />
            {!!getCipherDescription(send.cipher) && (
              <Text text={getCipherDescription(send.cipher)} style={{ fontSize: fontSize.small }} />
            )}
          </View>
        </View>
        <Icon
          icon="caret-left"
          color={color.textBlack}
          size={24}
          containerStyle={{
            transform: [
              {
                scaleX: -1,
              },
            ],
          }}
        />
      </TouchableOpacity>

      <View style={$horizontalStyle}>
        <Text text="Sharing time" />
        <Text preset="black" text={moment.unix(send.creationDate.getTime() / 1000).fromNow()} />
      </View>
      <Divider />

      <View style={$horizontalStyle}>
        <Text text="ShareWidth" />
        <View>
          {send.emails?.map((e) => (
            <Text text="e" />
          ))}
          {!send.emails || (send.emails.length === 0 && <Text text="Anyone one" />)}
        </View>
      </View>
      <Divider />

      {!!send.maxAccessCount && (
        <>
          <View style={$horizontalStyle}>
            <Text text="View(s)" />
            <Text preset="black" text={`${send.eachEmailAccessCount} times`} />
          </View>
          <Divider />
        </>
      )}

      <View style={$horizontalStyle}>
        <Text text="Expiration" />
        <Text
          preset="black"
          text={moment.unix(send.expirationDate.getTime() / 1000).format("Do MMM YYYY, h:mm:ss A")}
        />
      </View>
      <Divider />
    </Screen>
  )
}
