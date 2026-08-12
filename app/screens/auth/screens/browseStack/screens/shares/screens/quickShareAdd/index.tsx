import { FC, useCallback } from "react"
import { StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"

import { Header, Screen } from "app/components/cores"
import { ShareScreenProps } from "app/navigators"
import { CipherAppView } from "app/static/types"

import { CipherList } from "./CipherList"

/**
 * Render the Cipher List screen with target ciphertype
 */
export const QuickSharesAddScreen: FC<ShareScreenProps<"quickSharesSelectCipher">> = observer(
  ({ navigation }) => {
    // ------------------------ METHODS ------------------------

    const navigateToAddCipher = useCallback(() => {
      navigation.navigate("addCipherModal")
    }, [navigation])

    const navigateToQuickShare = useCallback(
      (item: CipherAppView) => {
        const data: CipherAppView = {
          ...item,
          revisionDate: null,
        }
        navigation.replace("quickShares", {
          cipher: data,
        })
      },
      [navigation]
    )

    // -------------- RENDER ------------------

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="quick_shares:share_option.quick.tl"
            rightIcon="plus"
            onRightPress={navigateToAddCipher}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <CipherList openAdd={navigateToAddCipher} openActionsMenu={navigateToQuickShare} />
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
