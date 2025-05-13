import { callerID } from "app/services/callerID/CallerID"
import { useCallback, useEffect, useState } from "react"
import { PermissionsAndroid } from "react-native"
import SQLite from "react-native-sqlite-storage"
import { callerData } from "./data"
SQLite.enablePromise(true)

export const useCallerID = () => {
  const [isEnabledOverlayPermission, setEnabledOverlayPermission] = useState(false)
  const [isUpdateLocalDatabase, setIsUpdateLocalDatabase] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)

  // ---------------------------METHOD-----------------------
  const initLocalDatabase = useCallback(async () => {
    try {
      console.log("initLocalDatabase 1  ")
      const db = await SQLite.openDatabase({ name: "callerid.db", location: "default" })
      console.log("initLocalDatabase 2  ")
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS caller (
          number TEXT PRIMARY KEY,
          label TEXT
        );
      `)
      console.log("initLocalDatabase 32  ")
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

      await db.transaction((tx) => {
        for (let i = 0; i < callerData.length; i += batchSize) {
          const batch = callerData.slice(i, i + batchSize)

          const values = batch.map(() => "(?, ?)").join(", ")
          const flatValues = batch.flatMap(([number, label]) => [String(number), label])

          const sql = `INSERT OR REPLACE INTO caller (number, label) VALUES ${values};`

          tx.executeSql(
            sql,
            flatValues,
            () => {
              console.log(`Inserted batch ${i / batchSize + 1}`)
              setUpdateProgress(i / callerData.length)
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

  const requestCallPermissions = useCallback(async () => {
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
  }, [])

  const requestPermission = useCallback(async () => {
    const result = await requestCallPermissions()
    if (result) {
      const isEnabled = await callerID.androidRequestOverlayPermission()
      setEnabledOverlayPermission(isEnabled)
    }
  }, [])

  const checkEnabledOverlayPermission = useCallback(async () => {
    const result = await requestCallPermissions()
    const isEnabled = await callerID.isOverlayPermissionEnabled()
    setEnabledOverlayPermission(isEnabled && result)
  }, [])

  // ---------------------------EFFECT-----------------------

  useEffect(() => {
    checkEnabledOverlayPermission()
  }, [])

  return {
    isUpdateLocalDatabase,
    updateProgress,
    isEnabledOverlayPermission,
    requestPermission,
    updateData: updateDataFast,
  }
}
