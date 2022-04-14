import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { commonStyles, fontSize } from "../../../theme"
import { Text } from "../../text/text"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { ActionSheetItem } from "../../action-sheet/action-sheet-item"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { observer } from "mobx-react-lite"
import { PlanType } from "../../../config/types"


export interface ActionItemProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  name?: string
  icon?: string
  iconColor?: string
  textColor?: string
  action?: Function
  children?: React.ReactNode
  disabled?: boolean
  isPremium?: boolean
  onClose?: () => void
}

/**
 * Describe your component here
 */
export const ActionItem = observer((props: ActionItemProps) => {
  const { style, name, icon, textColor, action, children, iconColor, disabled, isPremium, onClose } = props
  const { color, goPremium } = useMixins()
  const { user } = useStores()

  const premiumLock = isPremium && ((user.plan?.alias === PlanType.FREE) || !user.plan)

  return (
    <ActionSheetItem
      disabled={disabled}
      style={[{
        paddingVertical: 12
      }, style]}
      onPress={() => {
        if (premiumLock) {
          onClose && onClose()
          goPremium()
        } else {
          action && action()
        }
      }}
    >
      <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between',
        width: '100%'
      }]}>
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          {
            children || (
              <Text
                text={name}
                style={{ color: textColor || color.textBlack }}
              />
            )
          }
          {
            premiumLock && (
              <View style={{
                paddingHorizontal: 10,
                paddingVertical: 2,
                backgroundColor: color.textBlack,
                borderRadius: 3,
                marginLeft: 10
              }}>
                <Text
                  text="PREMIUM"
                  style={{
                    fontWeight: 'bold',
                    color: color.background,
                    fontSize: fontSize.mini
                  }}
                />
              </View>
            )
          }
        </View>
        
        {
          !!icon && (
            <FontAwesomeIcon 
              name={icon}
              size={16} 
              color={iconColor || textColor || color.text}
            />
          )
        }
      </View>
    </ActionSheetItem>
  )
})
