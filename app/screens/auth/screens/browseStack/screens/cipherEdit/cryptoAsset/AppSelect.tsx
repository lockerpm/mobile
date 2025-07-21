import { useState } from "react"
import { TouchableOpacity, View, Image, StyleSheet } from "react-native"
import { Text, Icon } from "app/components/cores"
import { WALLET_APP_LIST } from "app/utils/crypto/applist"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { otherLogo, WalletAppsModal } from "./WalletAppsModal"

type Props = {
  alias: string
  onChange: (alias: string, name: string) => void
}

export const AppSelect = (props: Props) => {
  const { onChange, alias } = props
  const {
    theme: { colors },
  } = useAppTheme()
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
      <TouchableOpacity onPress={() => setIsSelect(true)}>
        <View style={styles.flex}>
          <View>
            <Text preset="label" size="sm" tx={"crypto_asset:wallet_app"} style={styles.mb5} />
            <View style={styles.row}>
              {!!alias && (
                <Image
                  resizeMode="contain"
                  source={selectedApp?.logo || otherLogo}
                  borderRadius={20}
                  style={styles.image}
                />
              )}
              <Text preset="bold" text={selectedApp?.name || translate("common:none")} />
            </View>
          </View>
          <Icon icon="caret-right" size={20} color={colors.label} />
        </View>
      </TouchableOpacity>
      <WalletAppsModal isOpen={isSelect} onClose={onClose} alias={alias} setAlias={setAlias} />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  image: {
    borderRadius: 20,
    height: 32,
    marginRight: 10,
    width: 32,
  },
  mb5: {
    marginBottom: 5,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
