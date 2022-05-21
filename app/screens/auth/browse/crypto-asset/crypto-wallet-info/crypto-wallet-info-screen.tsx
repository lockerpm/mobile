import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Button, Text, FloatingInput, CipherInfoCommon, AutoImage as Image, Textarea } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { CryptoWalletAction } from "../crypto-wallet-action"
import { useStores } from "../../../../../models"
import { DeletedAction } from "../../../../../components/cipher/cipher-action/deleted-action"
import { useMixins } from "../../../../../services/mixins"
import { toCryptoWalletData } from "../../../../../utils/crypto"
import { CHAIN_LIST } from "../../../../../utils/crypto/chainlist"
import { WALLET_APP_LIST } from "../../../../../utils/crypto/applist"


export const CryptoWalletInfoScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { cipherStore } = useStores()

  const selectedCipher = cipherStore.cipherView
  const cryptoWalletData = toCryptoWalletData(selectedCipher.notes)
  const selectedApp = WALLET_APP_LIST.find(a => a.alias === cryptoWalletData.walletApp.alias)
  const otherApp = WALLET_APP_LIST.find(a => a.alias === 'other')
  const otherChain = CHAIN_LIST.find(c => c.alias === 'other')

  const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(selectedCipher.id)

  const [showAction, setShowAction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
        paddingTop: 0
      }}
      header={(
        <Header
          goBack={() => navigation.goBack()}
          right={(
            <Button
              preset="link"
              onPress={() => setShowAction(true)}
              style={{ 
                height: 35,
                alignItems: 'center',
                paddingLeft: 10
              }}
            >
              <IoniconsIcon
                name="ellipsis-horizontal"
                size={18}
                color={color.title}
              />
            </Button>
          )}
        />
      )}
    >
      {/* Actions */}
      {
        selectedCipher.deletedDate ? (
          <DeletedAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
            onLoadingChange={setIsLoading}
          />
        ) : (
          <CryptoWalletAction
            navigation={navigation}
            isOpen={showAction}
            onClose={() => setShowAction(false)}
            onLoadingChange={setIsLoading}
          />
        )
      }
      {/* Actions end */}

      {/* Intro */}
      <View>
        <View style={[commonStyles.CENTER_VIEW, {
          backgroundColor: color.background,
          paddingTop: 20,
          paddingBottom: 30,
          marginBottom: 10
        }]}>
          {
            !!selectedApp ? (
              <Image
                source={selectedApp.logo}
                style={{
                  height: 55,
                  width: 55,
                  borderRadius: 8
                }}
              />
            ) : (
              <BROWSE_ITEMS.cryptoWallet.svgIcon height={55} width={55} />
            )
          }
          <Text
            preset="header"
            style={{ marginTop: 10, marginHorizontal: 20, textAlign: 'center' }}
          >
            {selectedCipher.name}
            {
              notSync && (
                <View style={{ paddingLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }
          </Text>
        </View>
      </View>
      {/* Intro end */}

      {/* Info */}
      <View style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingVertical: 22
      }]}>
        {/* App */}
        <View>
          <Text
            text={translate('crypto_asset.wallet_app')}
            style={{ fontSize: fontSize.small, marginBottom: 5 }}
          />
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {
              !!selectedApp && (
                <View style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: color.line
                }}>
                  <Image
                    source={selectedApp?.logo || otherApp.logo}
                    borderRadius={20}
                    style={{
                      borderRadius: 20,
                      height: 40,
                      width: 40,
                      backgroundColor: 'white',
                    }}
                  />
                </View>
              )
            }
            <Text
              preset="black"
              text={cryptoWalletData.walletApp?.name || translate('common.none')}
            />
          </View>
        </View>

        {/* Username */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('common.username')}
          value={cryptoWalletData.username}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Password */}
        <FloatingInput
          isPassword
          fixedLabel
          copyAble
          label={translate('common.password') + ' / PIN'}
          value={cryptoWalletData.password}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Address */}
        <FloatingInput
          fixedLabel
          copyAble
          label={translate('crypto_asset.wallet_address')}
          value={cryptoWalletData.address}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Private key */}
        <FloatingInput
          isPassword
          fixedLabel
          copyAble
          label={translate('crypto_asset.private_key')}
          value={cryptoWalletData.privateKey}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Seed */}
        <FloatingInput
          isPassword
          fixedLabel
          copyAble
          label={translate('crypto_asset.seed')}
          value={cryptoWalletData.seed}
          editable={false}
          style={{ marginTop: 20 }}
        />

        {/* Networks */}
        <View style={{ marginTop: 20 }}>
          <Text
            text={translate('crypto_asset.wallet_app')}
            style={{ fontSize: fontSize.small, marginBottom: 5 }}
          />
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            flexWrap: 'wrap'
          }]}>
            {
              cryptoWalletData.networks.length ? (
                cryptoWalletData.networks.map((item) => {
                  const selectedChain = CHAIN_LIST.find(c => c.alias === item.alias)
                  return (
                    <View
                      key={item.alias}
                      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                        marginRight: 12,
                        marginVertical: 2
                      }]}
                    >
                      <View
                        style={{
                          borderRadius: 20,
                          overflow: 'hidden',
                          marginRight: 10,
                          borderWidth: 1,
                          borderColor: color.line
                        }}
                      >
                        <Image
                          source={selectedChain?.logo || otherChain.logo}
                          borderRadius={20}
                          style={{
                            borderRadius: 20,
                            height: 40,
                            width: 40,
                            backgroundColor: 'white'
                          }}
                        />
                      </View>

                      <Text
                        preset="black"
                        text={item.name}
                      />
                    </View>
                  )
                })
              ) : (
                <Text
                  preset="black"
                  text={translate('common.none')}
                />
              )
            }
          </View>
        </View>

        {/* Notes */}
        <Textarea
          label={translate('common.notes')}
          value={cryptoWalletData.notes}
          editable={false}
          copyAble
          style={{ marginTop: 20 }}
        />

        {/* Others common info */}
        <CipherInfoCommon cipher={selectedCipher} />
      </View>
      {/* Info end */}
    </Layout>
  )
})
