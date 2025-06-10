import React, { FC, useState } from "react"
import { Screen, Header, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherIconImage, SortActionConfigModal } from "app/components/ciphers"
import { IS_IOS } from "app/config/constants"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { useCipherHelper } from "app/services/hook"
import { TouchableOpacity, View } from "react-native"
import { HistoryItem } from "./HistoryItem"
import { PasswordHistoryView } from "core/models/view/passwordHistoryView"
import { HistoryItemAction } from "./HistoryItemAction"
import { useAppLocale, useTheme } from "app/services/context"
import { BrowseStackScreenProps } from "app/navigators"

export const PasswordHistoryScreen: FC<BrowseStackScreenProps<"passwordsHistory">> = observer(
  (props) => {
    const { cipherStore, user } = useStores()
    const { getWebsiteLogo } = useCipherHelper()
    const { colors } = useTheme()
    const { translate } = useAppLocale()

    const [sortOrder, setSortOrder] = useState("last_updated")
    const [isOpenModalSortStrategy, setOpenModalSortStrategy] = useState(false)
    const [selectHistory, setSelectHistory] = useState<PasswordHistoryView>(null)

    const selectedCipher: CipherView = cipherStore.cipherView

    const source = (() => {
      if (selectedCipher.login.uri) {
        const { uri } = getWebsiteLogo(selectedCipher.login.uri)
        if (uri) {
          return { uri }
        }
      }
      return BROWSE_ITEMS.password.icon
    })()

    const data = user.isFreePlan
      ? selectedCipher.passwordHistory?.slice(
          Math.max(selectedCipher.passwordHistory.length - 3, 0),
        )
      : selectedCipher.passwordHistory

    const passwordHistories = sortOrder === "last_updated" ? [...data]?.reverse() || [] : data

    return (
      <Screen
        preset="auto"
        padding
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={props.navigation.goBack}
            rightIcon="sliders-horizontal"
            onRightPress={() => {
              setOpenModalSortStrategy(true)
            }}
          />
        }
      >
        <SortActionConfigModal
          byTimeOnly
          isOpen={isOpenModalSortStrategy}
          onClose={() => setOpenModalSortStrategy(false)}
          onSelect={(value: string) => {
            setSortOrder(value)
          }}
          value={sortOrder}
        />

        <HistoryItemAction
          isOpen={!!selectHistory}
          onClose={() => {
            setSelectHistory(null)
          }}
          selectPassword={selectHistory?.password}
          selectedCipher={selectedCipher}
          onRestore={() => {
            setSelectHistory(null)
            props.navigation.goBack()
          }}
        />

        <CipherIconImage
          resizeMode="contain"
          defaultSource={IS_IOS ? BROWSE_ITEMS.password.icon : undefined}
          source={source}
          style={{ height: 55, width: 55, borderRadius: 8, alignSelf: "center" }}
        />

        <Text
          preset="bold"
          size="xl"
          style={{ marginTop: 16, textAlign: "center" }}
          text={selectedCipher.name}
        />
        <Text
          preset="label"
          size="medium"
          style={{ textAlign: "center" }}
          text={selectedCipher.login.username}
        />

        {user.isFreePlan && (
          <View
            style={{
              borderRadius: 8,
              borderColor: colors.border,
              borderWidth: 1,
              backgroundColor: colors.block,
              padding: 16,
              marginTop: 16,
            }}
          >
            <Text>
              {translate("password_history.free.note")}
              <Text preset="bold"> {translate("password_history.free.go_premium")}</Text>
            </Text>

            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("payment")
              }}
            >
              <Text
                color={colors.primary}
                style={{
                  alignSelf: "flex-end",
                  flexGrow: 1,
                  marginTop: 16,
                }}
                tx="password_history.free.upgrade"
              />
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{
            marginTop: 12,
          }}
        >
          {passwordHistories.map((i, index) => (
            <HistoryItem
              key={index}
              password={i.password}
              createAt={i.lastUsedDate}
              setSelectHistory={() => {
                setSelectHistory(i)
              }}
            />
          ))}
        </View>
      </Screen>
    )
  },
)
