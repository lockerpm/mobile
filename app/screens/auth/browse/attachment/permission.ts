/* eslint-disable react-native/split-platform-components */
import { useHelper } from "app/services/hook"
import { Alert, Linking } from "react-native"

export const usePermission = () => {
  const { translate } = useHelper()

  const handleUserDeniedPermission = (type: string, onCancel?: () => void) => {
    Alert.alert(
      translate("file_attachment.permission_denied"),
      translate("file_attachment.permission_denied_desc", {
        type,
      }),
      [
        {
          text: translate("common.cancel"),
          onPress: onCancel,
          style: "cancel",
        },
        {
          text: translate("file_attachment.go_setting"),
          onPress: () => Linking.openSettings(),
        },
      ],
    )
  }

  return {
    handleUserDeniedPermission,
  }
}
