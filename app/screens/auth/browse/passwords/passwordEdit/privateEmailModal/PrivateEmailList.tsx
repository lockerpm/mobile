import { Button, Text } from "app/components/cores"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import React, { useEffect, useRef, useState } from "react"
import { FlatList, TouchableOpacity, View } from "react-native"

interface Props {
  onSelect: (email: string) => void
}
export const PrivateEmailList = ({ onSelect }: Props) => {
  const { toolStore, user } = useStores()
  const { colors } = useTheme()
  const { translate } = useHelper()
  const [emails, setEmails] = useState<string[]>([])
  const totalCount = useRef(0)

  const fetchRelayListAddressed = async () => {
    const pageNumber = Math.ceil(emails.length / 20 || 1)
    const res = await toolStore.fetchRelayListAddresses(pageNumber)
    if (res.kind === "ok") {
      totalCount.current = res.data.count
      setEmails(res.data.results.map((e) => e.full_address))
    }
  }

  const loadMoreEmail = () => {
    if (totalCount.current > emails.length) {
      fetchRelayListAddressed()
    }
  }

  const generateRelayNewAddress = async () => {
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === "ok") {
      logFirebaseEvent(AnalyticEvents.CREATE_PRIVATE_EMAIL, user.email)
      onSelect(res.data.full_address)
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
                marginVertical: 8,
              }}
              text={item}
            />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border }} />
        )}
        onEndReachedThreshold={0.5}
        onEndReached={loadMoreEmail}
      />
      <Button
        text={translate("password.hide_email.generate_new")}
        onPress={generateRelayNewAddress}
        style={{
          marginHorizontal: 16,
        }}
      />
    </View>
  )
}
