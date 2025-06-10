import React from "react"
import { View, Image } from "react-native"
import { Text, TextInput } from "app/components/cores"
import { useTheme } from "app/services/context"
import { toCryptoWalletData } from "app/utils/crypto"
import { WALLET_APP_LIST } from "app/utils/crypto/applist"
import { CHAIN_LIST } from "app/utils/crypto/chainlist"
import { SeedPhraseInfo } from "./SeedPhraseInfo"
import { Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"

type Props = {
  item: CipherAppView
}

export const CryptoWalletInfo = ({ item }: Props) => {
  const { colors } = useTheme()

  const cryptoWalletData = toCryptoWalletData(item.notes)
  const selectedApp = WALLET_APP_LIST.find((a) => a.alias === cryptoWalletData.walletApp.alias)
  const otherApp = WALLET_APP_LIST.find((a) => a.alias === "other")
  const otherChain = CHAIN_LIST.find((c) => c.alias === "other")

  return (
    <View>
      <View>
        <Text preset="label" size="base" tx="crypto_asset.wallet_app" style={{ marginBottom: 5 }} />
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
          {selectedApp ? (
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                marginRight: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Image
                resizeMode="contain"
                source={selectedApp?.logo || otherApp?.logo}
                borderRadius={20}
                style={{
                  borderRadius: 20,
                  height: 40,
                  width: 40,
                  backgroundColor: colors.white,
                }}
              />
            </View>
          ) : (
            <Text text={cryptoWalletData.walletApp?.name} tx="common.none" />
          )}
        </View>
      </View>

      <TextInput
        isCopyable
        animated
        labelTx="common.username"
        value={cryptoWalletData.username}
        editable={false}
      />

      <TextInput
        isPassword
        isCopyable
        animated
        labelTx="common.password"
        value={cryptoWalletData.password}
        editable={false}
      />

      <TextInput
        isPassword
        animated
        isCopyable
        label={"PIN"}
        value={cryptoWalletData.pin}
        editable={false}
      />

      <TextInput
        isCopyable
        animated
        labelTx="crypto_asset.wallet_address"
        value={cryptoWalletData.address}
        editable={false}
      />

      <TextInput
        isPassword
        isCopyable
        animated
        labelTx="crypto_asset.private_key"
        value={cryptoWalletData.privateKey}
        editable={false}
      />

      <SeedPhraseInfo seed={cryptoWalletData.seed} />

      <View style={{ marginTop: 20 }}>
        <Text preset="label" size="base" tx="crypto_asset.wallet_app" style={{ marginBottom: 5 }} />
        <View
          style={{
            flexWrap: "wrap",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {cryptoWalletData.networks.length ? (
            cryptoWalletData.networks.map((item) => {
              const selectedChain = CHAIN_LIST.find((c) => c.alias === item.alias)
              return (
                <View
                  key={item.alias}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 12,
                    marginVertical: 2,
                  }}
                >
                  <View
                    style={{
                      borderRadius: 20,
                      overflow: "hidden",
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Image
                      resizeMode="contain"
                      source={selectedChain?.logo || otherChain?.logo}
                      borderRadius={20}
                      style={{
                        borderRadius: 20,
                        height: 40,
                        width: 40,
                        backgroundColor: colors.white,
                      }}
                    />
                  </View>

                  <Text text={item.name} />
                </View>
              )
            })
          ) : (
            <Text tx="common.none" />
          )}
        </View>
      </View>

      <Textarea
        labelTx="common.notes"
        value={cryptoWalletData.notes}
        editable={false}
        style={{ marginTop: 20 }}
      />

      {/* <CiphelBaseInfo cipher={item} /> */}
    </View>
  )
}
