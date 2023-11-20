/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, Image } from "react-native"
import { Screen, Header, Text, TextInput, Icon } from "app/components/cores"
import { CryptoWalletAction } from "../CryptoWalletAction"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { toCryptoWalletData } from "app/utils/crypto"
import { WALLET_APP_LIST } from "app/utils/crypto/applist"
import { CHAIN_LIST } from "app/utils/crypto/chainlist"
import { CipherInfoCommon, DeletedAction } from "app/components/ciphers"
import { SeedPhraseInfo } from "./SeedPhraseInfo"
import { Textarea } from "app/components/utils"
import { useHelper } from "app/services/hook"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { AppStackScreenProps } from "app/navigators/navigators.types"

export const CryptoWalletInfoScreen: FC<AppStackScreenProps<"cryptoWallets__info">> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route

    const { translate } = useHelper()
    const { colors } = useTheme()
    const { cipherStore } = useStores()

    const selectedCipher = cipherStore.cipherView
    const cryptoWalletData = toCryptoWalletData(selectedCipher.notes)
    const selectedApp = WALLET_APP_LIST.find((a) => a.alias === cryptoWalletData.walletApp.alias)
    const otherApp = WALLET_APP_LIST.find((a) => a.alias === "other")
    const otherChain = CHAIN_LIST.find((c) => c.alias === "other")

    const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
      selectedCipher.id,
    )

    const [showAction, setShowAction] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const fromQuickShare = route.params?.quickShare

    return (
      <Screen
        preset="auto"
        padding
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
            rightIcon={!fromQuickShare ? "dots-three" : undefined}
            onRightPress={() => setShowAction(true)}
          />
        }
      >
        {/* Actions */}
        {selectedCipher.deletedDate ? (
          <DeletedAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
          />
        ) : (
          <CryptoWalletAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
            onLoadingChange={setIsLoading}
          />
        )}

        {selectedApp ? (
          <Image
            resizeMode="contain"
            source={selectedApp.logo}
            style={{
              height: 55,
              width: 55,
              borderRadius: 8,
              alignSelf: "center",
            }}
          />
        ) : (
          <Image
            resizeMode="contain"
            source={BROWSE_ITEMS.cryptoWallet.icon}
            style={{ height: 55, width: 55, alignSelf: "center" }}
          />
        )}
        <Text preset="bold" size="xxl" style={{ margin: 20, textAlign: "center" }}>
          {selectedCipher.name}
          {notSync && (
            <View style={{ paddingLeft: 10 }}>
              <Icon icon="wifi-slash" size={22} />
            </View>
          )}
        </Text>

        <View>
          <Text
            preset="label"
            size="base"
            text={translate("crypto_asset.wallet_app")}
            style={{ marginBottom: 5 }}
          />
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
                  source={selectedApp?.logo || otherApp.logo}
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
              <Text text={cryptoWalletData.walletApp?.name || translate("common.none")} />
            )}
          </View>
        </View>

        {/* Username */}
        <TextInput
          isCopyable
          animated
          label={translate("common.username")}
          value={cryptoWalletData.username}
          editable={false}
        />

        {/* Password */}
        <TextInput
          isPassword
          isCopyable
          animated
          label={translate("common.password")}
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

        {/* Address */}
        <TextInput
          isCopyable
          animated
          label={translate("crypto_asset.wallet_address")}
          value={cryptoWalletData.address}
          editable={false}
        />

        {/* Private key */}
        <TextInput
          isPassword
          isCopyable
          animated
          label={translate("crypto_asset.private_key")}
          value={cryptoWalletData.privateKey}
          editable={false}
        />

        {/* Seed */}
        <SeedPhraseInfo seed={cryptoWalletData.seed} />

        {/* Networks */}
        <View style={{ marginTop: 20 }}>
          <Text
            preset="label"
            size="base"
            text={translate("crypto_asset.wallet_app")}
            style={{ marginBottom: 5 }}
          />
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
                        source={selectedChain?.logo || otherChain.logo}
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
              <Text text={translate("common.none")} />
            )}
          </View>
        </View>

        <Textarea
          label={translate("common.notes")}
          value={cryptoWalletData.notes}
          editable={false}
          copyAble
          style={{ marginTop: 20 }}
        />

        <CipherInfoCommon cipher={selectedCipher} />
      </Screen>
    )
  },
)
