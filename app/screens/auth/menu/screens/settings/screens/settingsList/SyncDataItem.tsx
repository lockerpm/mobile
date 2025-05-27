import { SettingsItem } from "app/components/utils"
import { useStores } from "app/models"
import { useAppLocale } from "app/services/context"
import { useCipherData, useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import React from "react"

export const SyncDataItem = observer(() => {
  const { uiStore, cipherStore } = useStores()
  const { notify } = useHelper()
  const { translate } = useAppLocale()
  const { startSyncProcess } = useCipherData()

  const syncDataManually = async () => {
    const res = await startSyncProcess(Date.now())
    // @ts-ignore
    if (res.kind === "ok") {
      notify("success", translate("success.sync_success"))
    }
  }

  return (
    <SettingsItem
      isLoading={cipherStore.isSynching}
      disabled={uiStore.isOffline || cipherStore.isSynching}
      textTx={"settings.sync_now"}
      onPress={syncDataManually}
    />
  )
})
