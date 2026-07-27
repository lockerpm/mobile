import { useCallback, useEffect, useRef, useState } from "react"

import Config from "@/config"
import { useStores } from "@/models"
import { useCipherData } from "@/services/hook"
import { useToast } from "@/services/utils"
import { SocketEvent, SocketEventType } from "@/static/types"
import { Logger } from "@/utils/logger"

export const useSocket = ({ isAndroidService }: { isAndroidService: boolean }) => {
  const { syncSingleCipher, syncSingleFolder, syncOfflineData, startSyncProcess, syncQuickShares } =
    useCipherData()
  const { notifyTx } = useToast()
  const { user, cipherStore, uiStore } = useStores()

  const [socket, setSocket] = useState<WebSocket | null>(null)
  const timeout = useRef<NodeJS.Timeout[]>([])

  // Check invitation
  const handleUserDataSync = useCallback(() => {
    if (!isAndroidService) {
      Promise.all([
        user.getInvitations(),
        cipherStore.loadSharingInvitations(),
        cipherStore.loadMyShares(),
      ])
    }
  }, [cipherStore, user, isAndroidService])

  // Sync
  const handleSync = useCallback(async () => {
    if (!isAndroidService) {
      user.loadPlan()

      // Sync offline data
      await syncOfflineData()
    }

    // Check if sync is needed
    const lastUpdateRes = await cipherStore.getLastUpdate()
    let bumpTimestamp = 0
    if (lastUpdateRes.kind === "unauthorized") {
      return
    }
    if (lastUpdateRes.kind === "ok") {
      bumpTimestamp = lastUpdateRes.data.revision_date * 1000

      if (bumpTimestamp <= (cipherStore.lastSync ?? 0)) {
        return
      }
    }
    // Send request
    const syncRes = await startSyncProcess(bumpTimestamp)
    if (!syncRes || syncRes.kind !== "ok") {
      notifyTx("error", "error:sync_failed")
      return
    }
  }, [cipherStore, notifyTx, startSyncProcess, syncOfflineData, user])

  // Web socket
  const generateSocket = useCallback(() => {
    // Note: using undocumented param (https://stackoverflow.com/questions/37246446/sending-cookies-with-react-native-websockets)
    // @ts-ignore
    const ws = new WebSocket(`${Config.WS_URL}?token=${user.apiToken}`, [], {
      headers: {
        "CF-Access-Client-Id": Config.CF_ACCESS_CLIENT_ID,
        "CF-Access-Client-Secret": Config.CF_ACCESS_CLIENT_SECRET,
      },
    })
    ws.onopen = () => {
      Logger.debug("SOCKET OPEN")
    }

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data)
      Logger.debug("WEBSOCKET EVENT: " + data.event)

      switch (data.event) {
        // SYNC
        case SocketEvent.SYNC:
          switch (data.type) {
            case SocketEventType.CIPHER_UPDATE: {
              if (data.data.ids) {
                Promise.all(
                  data.data.ids.map(async (id: string) => {
                    syncSingleCipher(id)
                  })
                )
              } else {
                const cipherId = data.data.id
                syncSingleCipher(cipherId)
              }
              break
            }
            case SocketEventType.FOLDER_UPDATE: {
              const folderId = data.data.id
              syncSingleFolder(folderId)
              break
            }
            default:
              handleSync()
          }
          break

        // MEMBERS
        case SocketEvent.MEMBERS:
          handleUserDataSync()
          break
        case SocketEvent.QUICK_SHARE:
          syncQuickShares()
          break
        default:
          break
      }
    }

    ws.onerror = (e) => {
      Logger.debug(`SOCKET ERROR: ${JSON.stringify(e)}`)
    }

    ws.onclose = (e) => {
      Logger.debug(`SOCKET CLOSE: ${JSON.stringify(e)}`)
      // Auto reconnect
      const id = setTimeout(async () => {
        if (!uiStore.isOffline && user.isLoggedInPw) {
          // Manually check for update
          await handleSync()
          setSocket(generateSocket())
        }
      }, 10000)
      timeout.current.push(id)
    }

    return ws
  }, [
    handleSync,
    handleUserDataSync,
    syncQuickShares,
    syncSingleCipher,
    syncSingleFolder,
    uiStore.isOffline,
    user.apiToken,
    user.isLoggedInPw,
  ])

  useEffect(() => {
    if (!uiStore.isOffline && !socket && user.isLoggedInPw && !isAndroidService) {
      setSocket(generateSocket())
    }
    return () => {
      if (uiStore.isOffline || !user.isLoggedInPw || !isAndroidService) {
        if (socket && socket.readyState === WebSocket.OPEN) {
          Logger.debug("CLOSE SOCKET")
          socket.close()
          setSocket(null)
          // Close socket
        }
      }
      timeout.current.forEach(clearTimeout)
      timeout.current = []
    }
  }, [isAndroidService, socket, uiStore.isOffline, user.isLoggedInPw])

  return {
    handleSync,
    handleUserDataSync,
  }
}
