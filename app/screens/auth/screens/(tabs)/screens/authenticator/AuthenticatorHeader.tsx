import React, { useState } from "react"
import { View } from "react-native"

import { Text, Icon } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { SearchBar } from "app/components/utils"

import { useCipherData } from "app/services/hook"
import { DeleteOtpModal } from "./DeleteOtpModal"

interface Props {
  openSort: () => void
  openAdd: () => void
  toggleSelectAll: () => void
  onSearch: (text: string) => void
  searchText: string
  header: string
  isSelecting: boolean
  setIsSelecting: (val: boolean) => void
  selectedItems: string[]
  setSelectedItems: (val: any) => void
  setIsLoading: (val: boolean) => void
}

export const AuthenticatorHeader = (props: Props) => {
  const {
    openAdd,
    onSearch,
    searchText,
    setIsLoading,
    header,
    isSelecting,
    setIsSelecting,
    selectedItems,
    setSelectedItems,
    toggleSelectAll,
  } = props
  const { translate } = useAppLocale()
  const { colors } = useTheme()
  const { deleteCiphers } = useCipherData()

  // ----------------------- PARAMS ------------------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // ----------------------- COMPUTED ------------------------

  // Header right
  const renderHeaderRight = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Icon
        icon="plus"
        size={24}
        color={colors.primaryText}
        onPress={openAdd}
        containerStyle={{ padding: 8 }}
      />
    </View>
  )

  // Select right
  const renderHeaderSelectRight = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Icon
        icon="check-bold"
        size={24}
        color={colors.primaryText}
        onPress={toggleSelectAll}
        containerStyle={{ padding: 8 }}
      />
      {selectedItems.length > 0 && (
        <>
          <Icon
            icon="trash"
            size={24}
            color={colors.error}
            onPress={() => setShowConfirmModal(true)}
            containerStyle={{ padding: 8 }}
          />
        </>
      )}
    </View>
  )

  // Select left
  const renderHeaderSelectLeft = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Icon
        icon="x"
        size={24}
        color={colors.primaryText}
        onPress={() => {
          setIsSelecting(false)
          setSelectedItems([])
        }}
      />
      <Text
        preset="bold"
        text={
          selectedItems.length
            ? `${selectedItems.length} ${translate("common.selected")}`
            : translate("common.select")
        }
        style={{
          marginLeft: 8,
        }}
      />
    </View>
  )

  // Actions

  const handleDelete = async () => {
    setIsLoading(true)
    const res = await deleteCiphers(selectedItems)
    setIsLoading(false)
    if (res.kind === "ok") {
      setIsSelecting(false)
      setSelectedItems([])
    }
  }

  // ----------------------- RENDER ------------------------

  return (
    <View
      style={{
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        {isSelecting ? (
          renderHeaderSelectLeft()
        ) : (
          <View style={{ height: 56, justifyContent: "center" }}>
            <Text preset="bold" size="xxl" weight="semibold" text={header} />
          </View>
        )}

        {isSelecting ? renderHeaderSelectRight() : renderHeaderRight()}
      </View>

      <SearchBar
        containerStyle={{ marginTop: 10, marginHorizontal: 20, marginBottom: 2 }}
        onChangeText={onSearch}
        value={searchText}
      />

      <DeleteOtpModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate("trash.perma_delete")}
        desc={translate("trash.perma_delete_desc")}
        btnText="OK"
      />

      {/* <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        cipherIds={selectedItems}
        onSuccess={() => {
          setIsSelecting(false)
          setSelectedItems([])
        }}
      /> */}
    </View>
  )
}
