import { View, Image, StyleSheet, ViewStyle } from "react-native"
import { Text, TextInput } from "app/components/cores"
import { toCryptoWalletData } from "app/utils/crypto"
import { WALLET_APP_LIST } from "app/utils/crypto/applist"
import { CHAIN_LIST } from "app/utils/crypto/chainlist"
import { SeedPhraseInfo } from "./SeedPhraseInfo"
import { Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"
import { CipherEditActionField } from "@/components/ciphers"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

type Props = {
  item: CipherAppView
}

export const CryptoWalletInfo = ({ item }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const cryptoWalletData = toCryptoWalletData(item.notes)
  const selectedApp = WALLET_APP_LIST.find((a) => a.alias === cryptoWalletData.walletApp.alias)
  const otherApp = WALLET_APP_LIST.find((a) => a.alias === "other")
  const otherChain = CHAIN_LIST.find((c) => c.alias === "other")

  return (
    <View>
      {selectedApp && (
        <CipherEditActionField disabled labelTx="crypto_asset:wallet_app">
          <View style={styles.rowWrap}>
            <Image
              resizeMode="contain"
              source={selectedApp?.logo || otherApp?.logo}
              borderRadius={20}
              style={styles.logo}
            />
            <Text text={selectedApp.name} />
          </View>
        </CipherEditActionField>
      )}

      {cryptoWalletData.username && (
        <TextInput
          isCopyable
          animated
          labelTx="common:username"
          value={cryptoWalletData.username}
          editable={false}
        />
      )}

      {cryptoWalletData.password && (
        <TextInput
          isPassword
          isCopyable
          animated
          labelTx="common:password"
          value={cryptoWalletData.password}
          editable={false}
        />
      )}

      {cryptoWalletData.pin && (
        <TextInput
          isPassword
          animated
          isCopyable
          label={"PIN"}
          value={cryptoWalletData.pin}
          editable={false}
        />
      )}

      {cryptoWalletData.address && (
        <TextInput
          isCopyable
          animated
          labelTx="crypto_asset:wallet_address"
          value={cryptoWalletData.address}
          editable={false}
        />
      )}

      {cryptoWalletData.privateKey && (
        <TextInput
          isPassword
          isCopyable
          animated
          labelTx="crypto_asset:private_key"
          value={cryptoWalletData.privateKey}
          editable={false}
        />
      )}
      {cryptoWalletData.seed && <SeedPhraseInfo seed={cryptoWalletData.seed} />}

      {cryptoWalletData.networks?.length > 0 && (
        <View style={styles.mt20}>
          <Text
            weight="medium"
            color={colors.text}
            tx={"crypto_asset:network"}
            style={[styles.label, { backgroundColor: colors.background }]}
          />
          <View style={themed($container)}>
            {cryptoWalletData.networks.map((item, index) => {
              const selectedChain = CHAIN_LIST.find((c) => c.alias === item.alias)
              return (
                <View key={item.alias}>
                  {index !== 0 && <View style={themed($divider)} />}
                  <View style={styles.cryptoContainer}>
                    <Image
                      resizeMode="contain"
                      source={selectedChain?.logo || otherChain?.logo}
                      borderRadius={20}
                      style={styles.logo}
                    />

                    <Text text={item.name} />
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {cryptoWalletData.notes && (
        <Textarea labelTx="common:notes" value={cryptoWalletData.notes} editable={false} />
      )}
    </View>
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  width: "100%",
  backgroundColor: colors.border,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
})

const styles = StyleSheet.create({
  cryptoContainer: {
    alignItems: "center",
    flexDirection: "row",
    padding: 12,
  },
  label: {
    left: 0,
    paddingHorizontal: 4,
    position: "absolute",
    top: -14,
    transform: [{ scale: 0.9 }],
    zIndex: 5,
  },
  logo: {
    borderRadius: 20,
    height: 28,
    marginRight: 12,
    width: 28,
  },
  mt20: {
    marginTop: 20,
  },
  rowWrap: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
})
