import { observer } from "mobx-react-lite"
import { QuickSharesList } from "./QuickSharesList"
import { Header, Screen } from "app/components/cores"
import { ViewStyle } from "react-native"
import { SendView } from "core/models/view/sendView"
import { FC } from "react"
import { ShareScreenProps } from "@/navigators"

export const QuickShareScreen: FC<ShareScreenProps<"quickShareCipherList">> = observer(
  ({ navigation }) => {
    // --------------------- COMPUTED -------------------------

    const navigateToQuickShareActions = (item: SendView) => {
      navigation.navigate("quickSharesActionsModal", {
        cipher: item,
      })
    }
    const navigateToQuickShareSelect = () => {
      navigation.navigate("quickSharesSelectCipher")
    }
    // --------------------- RENDER -------------------------

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="quick_shares:share_option.quick.tl"
            rightIcon="plus"
            onRightPress={navigateToQuickShareSelect}
          />
        }
        contentContainerStyle={$container}
      >
        <QuickSharesList openActions={navigateToQuickShareActions} />
      </Screen>
    )
  }
)

const $container: ViewStyle = {
  flex: 1,
}
