import React, { FC, useState } from "react"
import { Screen, Header, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "app/navigators/navigators.types"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherIconImage, SortActionConfigModal } from "app/components/ciphers"
import { IS_IOS } from "app/config/constants"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { useCipherHelper } from "app/services/hook"
import { View } from "react-native"
import { HistoryItem } from "./HistoryItem"
import { PasswordHistoryView } from "core/models/view/passwordHistoryView"
import { HistoryItemAction } from "./HistoryItemAction"

export const PasswordHistoryScreen: FC<AppStackScreenProps<"passwords_history">> = observer(
  (props) => {
    const { cipherStore } = useStores()
    const { getWebsiteLogo } = useCipherHelper()

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
    const passwordHistories =
      sortOrder === "last_updated"
        ? [...selectedCipher.passwordHistory]?.reverse() || []
        : selectedCipher.passwordHistory
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

        <View
          style={{
            marginTop: 12,
          }}
        >
          {passwordHistories?.map((i, index) => (
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
