import { Text } from "app/components/cores"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import React, { useEffect, useRef, useState } from "react"
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native"

interface Props {
  onSelect: (email: string) => void
}
export const PrivateEmailList = ({ onSelect }: Props) => {
  const { toolStore } = useStores()
  const { colors } = useTheme()

  const [isLoading, setIsLoading] = useState(false)
  const [emails, setEmails] = useState<string[]>([])
  const totalCount = useRef(0)

  const fetchRelayListAddressed = async () => {
    setIsLoading(true)
    const pageNumber = Math.ceil(emails.length / 20 || 1)
    const res = await toolStore.fetchRelayListAddresses(pageNumber)
    if (res.kind === "ok") {
      totalCount.current = res.data.count
      setEmails(res.data.results.map((e) => e.full_address))
    }
    setIsLoading(false)
  }

  const loadMoreEmail = () => {
    if (totalCount.current > emails.length) {
      fetchRelayListAddressed()
    }
  }

  useEffect(() => {
    fetchRelayListAddressed()
  }, [])

  return (
    <View>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 16,
          minHeight: "30%",
          paddingBottom: 16,
        }}
        data={emails}
        keyExtractor={(e, index) => e + index}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)}>
            <Text
              style={{
                marginVertical: 12,
              }}
              text={item}
            />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border }} />
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            {isLoading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text tx="password.hide_email.empty" />
            )}
          </View>
        }
        onEndReachedThreshold={0.5}
        onEndReached={loadMoreEmail}
      />
    </View>
  )
}
