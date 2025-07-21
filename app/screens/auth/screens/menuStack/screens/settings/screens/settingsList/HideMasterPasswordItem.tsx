import { SettingsItem } from "app/components/utils"
import { Switch } from "app/components/cores"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"

export const HideMasterPasswordItem = observer(() => {
  const { user } = useStores()

  const onChage = (isActive: boolean) => {
    user.hideUserMassterPassword(isActive)
  }
  return (
    <SettingsItem
      textTx={"settings:hide_mp"}
      onPress={() => onChage(!user.hide_master_password)}
      RightAccessory={
        <Switch
          onPress={() => onChage(!user.hide_master_password)}
          value={user.hide_master_password}
        />
      }
    />
  )
})
