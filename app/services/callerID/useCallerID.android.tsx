import { callerID } from "app/services/callerID/CallerID"
import { useCallback, useState } from "react"
import { PermissionsAndroid } from "react-native"
import SQLite from "react-native-sqlite-storage"
import { callerData } from "./data"

SQLite.enablePromise(true)

const requestLiveCallPermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    ])

    const phoneStateGranted =
      granted["android.permission.READ_PHONE_STATE"] === PermissionsAndroid.RESULTS.GRANTED
    const callLogGranted =
      granted["android.permission.READ_CALL_LOG"] === PermissionsAndroid.RESULTS.GRANTED

    if (phoneStateGranted && callLogGranted) {
      return true
    } else {
      return false
    }
  } catch (err) {
    console.warn(err)
    return false
  }
}

const checkLiveCallPermissions = async (): Promise<boolean> => {
  try {
    const phoneStateGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    )

    const callLogGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    )

    return phoneStateGranted && callLogGranted
  } catch (err) {
    console.warn("Permission check error:", err)
    return false
  }
}

export const useCallerID = () => {
  const [isEnabledOverlayPermission, setEnabledOverlayPermission] = useState(false)
  const [isUpdateLocalDatabase, setIsUpdateLocalDatabase] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)

  // ---------------------------METHOD-----------------------
  const initLocalDatabase = useCallback(async () => {
    try {
      const db = await SQLite.openDatabase({ name: "callerid.db", location: "default" })
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS caller (
          number TEXT PRIMARY KEY,
          label TEXT
        );
      `)
      return db
    } catch (e) {
      console.error("DB error:", e)
    }
  }, [])

  const updateDataFast = useCallback(async () => {
    try {
      setUpdateProgress(0)
      setIsUpdateLocalDatabase(true)
      const db = await initLocalDatabase()

      const batchSize = 1000
      const entries = Array.from(callerData.entries())

      await db.transaction((tx) => {
        for (let i = 0; i < entries.length; i += batchSize) {
          const batch = entries.slice(i, i + batchSize)

          const values = batch.map(() => "(?, ?)").join(", ")
          const flatValues = batch.flatMap(([number, label]) => [String(number), label])

          const sql = `INSERT OR REPLACE INTO caller (number, label) VALUES ${values};`

          tx.executeSql(
            sql,
            flatValues,
            () => {
              setUpdateProgress(i / entries.length)
            },
            (tx, error) => {
              console.error("Batch insert error:", error)
              return true // rollback
            },
          )
        }
      })
      setUpdateProgress(1)
    } catch (error) {
      console.error("Error updating database:", error)
    } finally {
      setIsUpdateLocalDatabase(false)
    }
  }, [])

  const requestLiveCallPermission = useCallback(async () => {
    const result = await requestLiveCallPermissions()
    if (result) {
      const isEnabled = await callerID.androidRequestOverlayPermission()
      setEnabledOverlayPermission(isEnabled)
    }
  }, [])

  const checkEnabledOverlayPermission = useCallback(async () => {
    const isOverlayEnabled = await callerID.isOverlayPermissionEnabled()
    if (isOverlayEnabled) {
      const result = await checkLiveCallPermissions()
      setEnabledOverlayPermission(result)
    }
  }, [])

  // ---------------------------EFFECT-----------------------

  return {
    isUpdateLocalDatabase,
    updateProgress,
    isEnabledOverlayPermission,
    requestLiveCallPermission,
    checkEnabledOverlayPermission,
    updateData: updateDataFast,
  }
}
