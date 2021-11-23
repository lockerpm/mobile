import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import Dialog from "react-native-ui-lib/dialog"
import { color as colorLight, colorDark, commonStyles } from "../../theme"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useStores } from "../../models"


export interface ActionSheetProps {
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode,
  isOpen?: boolean,
  onClose?: () => void
}

/**
 * Describe your component here
 */
export const ActionSheet = observer(function ActionSheet(props: ActionSheetProps) {
  const { style, children, isOpen, onClose } = props
  const insets = useSafeAreaInsets()
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  const CONTAINER: ViewStyle = {
    justifyContent: "center",
    backgroundColor: uiStore.isDark ? color.palette.pureBlack : color.palette.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  }
  const styles = flatten([CONTAINER, { paddingBottom: insets.bottom }, style])

  return (
    <Dialog
      containerStyle={styles}
      bottom
      width="100%"
      visible={isOpen}
      onDialogDismissed={onClose}
      renderPannableHeader={() => (
        <View style={{ height: 40 }}>
          <View style={commonStyles.CENTER_VIEW}>
            <View
              style={{
                backgroundColor: color.disabled,
                height: 4,
                borderRadius: 4,
                width: 50
              }}
            />  
          </View>
        </View>
      )}
    >
      {children}
    </Dialog>
  )
})
