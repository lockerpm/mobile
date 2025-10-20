import { callerID } from "app/services/callerID/CallerID"
import { useCallback, useState } from "react"
import SQLite from "react-native-sqlite-storage"
import { useStores } from "@/models"
import { toolApi } from "../api"
import { useToast } from "../utils"
import { ScamPhonesData } from "@/static/types"

const BATCH_SIZE = 1000
const SYNC_PAGE_SIZE = 30000
SQLite.enablePromise(true)

/**
 * Call api to get caller ID data and update local database
 * This is used to update the local database with caller ID data.
 * It initializes the database, creates a table if it doesn't exist,
 * and inserts or replaces entries in batches to avoid performance issues.
 * The function also tracks the progress of the update.
 */
export const useCallerIDData = () => {
  const { toolStore } = useStores()
  const { notifyApiError } = useToast()
  const [isUpdateLocalDatabase, setIsUpdateLocalDatabase] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // ---------------------------METHOD-----------------------
  const initLocalDatabase = useCallback(async () => {
    try {
      const db = await SQLite.openDatabase({ name: "callerid.db", location: "default" })
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS caller (
          value TEXT PRIMARY KEY,
          type TEXT
        );
      `)
      return db
    } catch (e) {
      console.error("DB error:", e)
    }
    return null
  }, [])

  const clearLocalDatabase = useCallback(async () => {
    toolStore.updateSyncScamPhones("")
    const db = await initLocalDatabase()
    if (!db) {
      return
    }
    try {
      await db.executeSql("DELETE FROM caller;")
    } catch (error) {
      console.error("Error clearing local database:", error)
    }
  }, [initLocalDatabase, toolStore])

  const addValue = useCallback(
    async (item: ScamPhonesData) => {
      try {
        const db = await initLocalDatabase()
        if (!db) {
          return
        }

        await new Promise<void>((resolve, reject) => {
          db.executeSql(
            "INSERT OR REPLACE INTO caller (value, type) VALUES (?, ?);",
            [item.value, item.type],
            () => {
              resolve()
            },
            (tx, error) => {
              console.error("Insert error:", error)
              reject(error)
              return true // rollback
            }
          )
        })

        await db.close()
      } catch (error) {
        console.error("Error adding value to local database:", error)
      }
    },
    [initLocalDatabase]
  )

  const updateDataFast = useCallback(async () => {
    try {
      const db = await initLocalDatabase()
      if (!db) {
        return
      }
      setDownloadProgress(0)

      let lastSyncCursor = toolStore.lastSyncCursor || ""
      let syncCount = SYNC_PAGE_SIZE
      setIsUpdateLocalDatabase(true)

      while (syncCount === SYNC_PAGE_SIZE) {
        const res = await toolApi.scamSyncPhones(toolStore.apiToken, {
          cursor: lastSyncCursor,
        })
        if (res.kind !== "ok") {
          notifyApiError(res)
          return
        }
        const data = res.data.data
        syncCount = data.length
        if (syncCount > 0) {
          lastSyncCursor = res.data.cursor
          await db?.transaction((tx) => {
            for (let i = 0; i < syncCount; i += BATCH_SIZE) {
              const batch = data.slice(i, i + BATCH_SIZE)

              const values = batch.map(() => "(?, ?)").join(", ")
              const flatValues = batch.flatMap(({ value, type }) => [value, type])

              tx.executeSql(
                `INSERT OR REPLACE INTO caller (value, type) VALUES ${values};`,
                flatValues,
                () => {
                  //
                },
                (tx, error) => {
                  console.error("Batch insert error:", error)
                  return true // rollback
                }
              )
            }
          })

          toolStore.updateSyncScamPhones(lastSyncCursor)
          setDownloadProgress(parseInt(lastSyncCursor.split("_")[1]) / res.data.count)
        }
      }
    } catch (error) {
      console.error("Error updating database:", error)
    } finally {
      setIsUpdateLocalDatabase(false)
      setDownloadProgress(1)
    }
  }, [initLocalDatabase, toolStore, notifyApiError])

  return {
    downloadProgress,
    isUpdateLocalDatabase,
    updateData: updateDataFast,
    addValue,
    clearLocalDatabase,
  }
}

export const useCallerID = () => {
  const [isEnabledCallScreeningPermission, setIsEnabledCallScreeningPermission] = useState(false)

  // ---------------------------METHOD-----------------------
  const isCallScreeningEnabled = useCallback(async () => {
    const isEnabled = await callerID.androidCheckCallScreeningPermission()
    setIsEnabledCallScreeningPermission(isEnabled)
    console.log("isOverlayEnabled", isEnabled)
  }, [])

  const requestCallScreeningApp = useCallback(async () => {
    const isEnabled = await callerID.androidRequestCallScreeningService()
    setIsEnabledCallScreeningPermission(isEnabled)
    console.log("isOverlayEnabled", isEnabled)
  }, [])

  // ---------------------------EFFECT-----------------------

  return {
    isEnabledCallScreeningPermission,
    isCallScreeningEnabled,
    requestCallScreeningApp,
  }
}
