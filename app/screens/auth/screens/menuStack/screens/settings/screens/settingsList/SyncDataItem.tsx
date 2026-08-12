import { observer } from "mobx-react-lite"

import { SettingsItem } from "app/components/utils"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import { useToast } from "app/services/utils"

export const SyncDataItem = observer(() => {
  const { uiStore, cipherStore } = useStores()
  const { notifyTx } = useToast()
  const { startSyncProcess } = useCipherData()

  const syncDataManually = async () => {
    const res = await startSyncProcess(Date.now())
    if (res?.kind === "ok") {
      notifyTx("success", "success:sync_success")
    }
  }

  return (
    <SettingsItem
      isLoading={cipherStore.isSynching}
      disabled={uiStore.isOffline || cipherStore.isSynching}
      textTx={"settings:sync_now"}
      onPress={syncDataManually}
    />
  )
})
