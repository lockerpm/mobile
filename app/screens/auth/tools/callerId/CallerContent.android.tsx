import { Button, ImageIcon, Text, Toggle } from "app/components/cores"
import React, { useEffect, useRef, useState } from "react"
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native"
import { ProgressBar } from "react-native-ui-lib"
import { useTheme } from "app/services/context"

// @ts-ignore
import { useCallerID } from "app/services/callerID/useCallerID"
// @ts-ignore
import { useHistoryCallerID } from "app/services/callerID/useHistoryCallerID"
// @ts-ignore
import { HistoryCallLogItem } from "./HistoryCallLogItem"

import { FlatList } from "react-native-gesture-handler"
import { callerID } from "app/services/callerID/CallerID"
import { callerData } from "app/services/callerID/data"

const EnablePermissionView = () => {
  const { colors } = useTheme()
  const { updateData, isUpdateLocalDatabase, updateProgress } = useCallerID()
  return (
    <View style={{ marginTop: 12 }}>
      <Text text="Update 30.000 spams" />
      {isUpdateLocalDatabase && (
        <ProgressBar
          style={{
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.block,
          }}
          progressColor={colors.primary}
          progress={Math.min(updateProgress * 100, 100)}
        />
      )}
      <Button
        text="Update List spams"
        disabled={isUpdateLocalDatabase}
        loading={isUpdateLocalDatabase}
        onPress={updateData}
        style={styles.mt12}
      />
    </View>
  )
}

interface AndroidCallLog {
  number: string
  date: number
  duration: number
  type: number
  name: string
  id: string
  repeat?: number
  label?: string
}

function normalizePhoneNumber(raw: string): number {
  if (raw.startsWith("0")) {
    return parseInt("84" + raw.slice(1))
  } else if (raw.startsWith("+84")) {
    return parseInt(raw.slice(1)) // "+84" → "84"
  }
  return parseInt(raw)
}

const prepareData = (prev: AndroidCallLog[], newData: AndroidCallLog[]) => {
  const data = [...prev]

  for (let i = 0; i < newData.length; i++) {
    if (data.length === 0) {
      data.push(newData[i])
    } else {
      const lastIndex = data.length - 1
      if (data[lastIndex].number === newData[i].number) {
        data[lastIndex].repeat = data[lastIndex].repeat || 0 + 1
      } else {
        data.push(newData[i])
      }
    }
  }
  return data
    .map((item) => ({ ...item, label: callerData.get(normalizePhoneNumber(item.number)) }))
    .filter((item) => !!item.label)
}

const ListCallLogs = () => {
  const { isPermissionEnabled, requestEnabledPermission } = useHistoryCallerID()

  // ---------------------------PARAMS-----------------------
  const [data, setData] = useState<AndroidCallLog[]>([])
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)

  // ---------------------------METHOD-----------------------
  const loadData = async (page: number) => {
    if (isLoadingMore || !hasMoreData) return

    setIsLoadingMore(true)

    // Simulate API call
    setTimeout(async () => {
      try {
        const newItems = await callerID.getAndroidCallLogsHistory(page)

        if (newItems.length < callerID.PAGE_SIZE) {
          setHasMoreData(false) // No more data
        }

        setData(prepareData(data, newItems))
        setIsLoadingMore(false)
      } catch (error) {
        console.error("Error fetching call logs:", error)
      }
    }, 500)
  }
  const handleEndReached = () => {
    if (!isLoadingMore && hasMoreData) {
      setPage((prev) => prev + 1)
    }
  }

  useEffect(() => {
    if (!isPermissionEnabled) return
    loadData(page)
  }, [page, isPermissionEnabled])

  const renderFooter = () => {
    if (!isLoadingMore) return null
    return <ActivityIndicator size="small" style={styles.mt12} />
  }

  return (
    <View style={styles.listContainer}>
      <Text text="Lịch sử cuộc gọi" />
      {!isPermissionEnabled && (
        <Button
          text="show lich sử cuộc gọi "
          onPress={requestEnabledPermission}
          style={styles.mt12}
        />
      )}
      {isPermissionEnabled && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryCallLogItem {...item} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  )
}

export const CallerContent = () => {
  const { colors } = useTheme()
  const { isEnabledOverlayPermission, requestLiveCallPermission, checkEnabledOverlayPermission } =
    useCallerID()

  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  useEffect(() => {
    checkEnabledOverlayPermission()
  }, [appStateVisible])

  useEffect(() => {
    AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
  }, [])

  return (
    <View style={styles.flex1}>
      <View style={styles.container}>
        <View style={[styles.content, { borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowShrink}>
              <ImageIcon icon="phone-list" containerStyle={styles.mr12} size={32} />
              <Text text="Live Call lookup" />
            </View>
            <Toggle variant="switch" value={isEnabledOverlayPermission} />
          </View>
          {!isEnabledOverlayPermission && (
            <View>
              <Text
                text="Live Call look up is a feature that allows you to identify the caller's name when the phone is ringing."
                style={styles.mt12}
              />
              <Text text="To enable this feature, please allow permission:" style={styles.mt12} />
              <Text
                text="1. Allow Locker to make and manage Phone calls: Detect phone incomming"
                style={styles.mt12}
              />
              <Text
                text="2. Allow Locker display over other apps: show the caller label on the screen"
                style={styles.mt12}
              />
              <Text
                text="3. Allow Locker display over other apps: show the caller label on the screen"
                style={styles.mt12}
              />
              <View style={styles.mt12}>
                <Button
                  text="Enable Permission"
                  onPress={requestLiveCallPermission}
                  style={styles.mt12}
                />
              </View>
            </View>
          )}
          {isEnabledOverlayPermission && <EnablePermissionView />}
        </View>
      </View>
      {isEnabledOverlayPermission && <ListCallLogs />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  flex1: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  mr12: {
    marginRight: 12,
  },
  mt12: {
    marginTop: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  rowShrink: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
})
