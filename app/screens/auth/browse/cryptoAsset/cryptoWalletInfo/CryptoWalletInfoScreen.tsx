/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, Image } from "react-native"
import {
  Screen,
  Header,
  Text,
  TextInput,
  Icon,
} from "app/components-v2/cores"
import { CryptoWalletAction } from "../CryptoWalletAction"
import { AppStackScreenProps, BROWSE_ITEMS } from "app/navigators"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { toCryptoWalletData } from "app/utils/crypto"
import { WALLET_APP_LIST } from "app/utils/crypto/applist"
import { CHAIN_LIST } from "app/utils/crypto/chainlist"
import { CipherInfoCommon, DeletedAction } from "app/components-v2/ciphers"
import { translate } from "app/i18n"
import { SeedPhraseInfo } from "./SeedPhraseInfo"
import { Textarea } from "app/components-v2/utils"

export const CryptoWalletInfoScreen: FC<AppStackScreenProps<'cryptoWallets__info'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

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
      backgroundColor={colors.block}
      header={
        !fromQuickShare && (
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
            RightActionComponent={
              <Icon
                icon="dots-three"
                size={24}
                style={{
                  alignItems: "center",
                  paddingLeft: 20,
                }}
                onPress={() => setShowAction(true)}
              />
            }
          />
        )
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

      <View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 20,
            paddingBottom: 30,
            marginBottom: 10,
          }}
        >
          {selectedApp ? (
            <Image
              source={selectedApp.logo}
              style={{
                height: 55,
                width: 55,
                borderRadius: 8,
              }}
            />
          ) : (
            <Image
              source={BROWSE_ITEMS.crypto.icon}
              style={{ height: 55, width: 55, marginBottom: 5 }}
            />
          )}
          <Text
            preset="bold"
            size="xl"
            style={{ marginTop: 10, marginHorizontal: 20, textAlign: "center" }}
          >
            {selectedCipher.name}
            {notSync && (
              <View style={{ paddingLeft: 10 }}>
                <Icon
                  icon='wifi-slash'
                  size={22}
                />
              </View>
            )}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View
        style={{
          backgroundColor: colors.background,
          paddingVertical: 22,
          padding: 16,
        }}
      >
        {/* App */}
        <View>
          <Text
            preset="label"
            size="base"
            text={translate("crypto_asset.wallet_app")}
            style={{ marginBottom: 5 }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!!selectedApp && (
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
            )}
            <Text
              text={cryptoWalletData.walletApp?.name || translate("common.none")}
            />
          </View>
        </View>

        {/* Username */}
        <TextInput
          isCopyable
          label={translate("common.username")}
          value={cryptoWalletData.username}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Password */}
        <TextInput
          isPassword
          isCopyable
          label={translate("common.password")}
          value={cryptoWalletData.password}
          editable={false}
          style={{ marginTop: 20 }}
        />

        <TextInput
          isPassword
          isCopyable
          label={"PIN"}
          value={cryptoWalletData.pin}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Address */}
        <TextInput
          isCopyable
          label={translate("crypto_asset.wallet_address")}
          value={cryptoWalletData.address}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Private key */}
        <TextInput
          isPassword
          isCopyable
          label={translate("crypto_asset.private_key")}
          value={cryptoWalletData.privateKey}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Seed */}
        <View style={{ marginTop: 30 }}>
          <SeedPhraseInfo seed={cryptoWalletData.seed} />
        </View>

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
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            {cryptoWalletData.networks.length ? (
              cryptoWalletData.networks.map((item) => {
                const selectedChain = CHAIN_LIST.find((c) => c.alias === item.alias)
                return (
                  <View
                    key={item.alias}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
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

        {/* Notes */}
        <Textarea
          label={translate("common.notes")}
          value={cryptoWalletData.notes}
          editable={false}
          copyAble
          style={{ marginTop: 20 }}
        />

        {/* Others common info */}
        <CipherInfoCommon cipher={selectedCipher} />
      </View>
    </Screen>
  )
})
