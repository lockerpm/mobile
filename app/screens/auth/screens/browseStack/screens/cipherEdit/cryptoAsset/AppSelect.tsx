import { useState } from "react"
import { View, Image, StyleSheet } from "react-native"
import { Text } from "app/components/cores"
import { WALLET_APP_LIST } from "app/utils/crypto/applist"
import { useAppLocale } from "@/i18n"
import { otherLogo, WalletAppsModal } from "./WalletAppsModal"
import { CipherEditActionField } from "@/components/ciphers"

type Props = {
  alias: string
  onChange: (alias: string, name: string) => void
}

export const AppSelect = (props: Props) => {
  const { onChange, alias } = props
  const { translate } = useAppLocale()

  // ------------------ METHODS ------------------
  const [isSelect, setIsSelect] = useState(false)

  const findApp = (al: string) => {
    return WALLET_APP_LIST.find((c) => c.alias === al)
  }

  const onClose = () => setIsSelect(false)

  const setAlias = (app: any) => {
    setIsSelect(false)
    onChange(app.alias, app.name)
  }

  // ------------------ COMPUTED ------------------

  const selectedApp = findApp(alias)

  // ------------------ RENDER ------------------

  return (
    <View>
      <CipherEditActionField labelTx="crypto_asset:wallet_app" onPress={() => setIsSelect(true)}>
        {selectedApp && (
          <View style={styles.row}>
            {!!alias && (
              <Image
                resizeMode="contain"
                source={selectedApp?.logo || otherLogo}
                borderRadius={20}
                style={styles.image}
              />
            )}
            <Text text={selectedApp?.name || translate("common:none")} />
          </View>
        )}
      </CipherEditActionField>
      <WalletAppsModal isOpen={isSelect} onClose={onClose} alias={alias} setAlias={setAlias} />
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 20,
    height: 28,
    marginRight: 12,
    width: 28,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
