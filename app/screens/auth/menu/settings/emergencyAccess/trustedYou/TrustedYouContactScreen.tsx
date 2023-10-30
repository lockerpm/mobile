import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { Contact } from "../Contact"
import { View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { Header, Screen, Text } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { TrustedContact } from "app/static/types"

export const ContactsTrustedYouScreen = observer(function ContactsTrustedYouScreen() {
  const navigation = useNavigation()
  const { notifyApiError, translate } = useHelper()
  const { user } = useStores()

  // ----------------------- PARAMS -----------------------

  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([])
  const [onAction, setOnAction] = useState(false)

  // ----------------------- METHODS -----------------------

  const granted = async () => {
    const res = await user.grantedEA()
    if (res.kind === "ok") {
      setTrustedContacts(res.data)
    } else {
      notifyApiError(res)
    }
  }

  // ----------------------- EFFECT -----------------------
  useEffect(() => {
    granted()
  }, [onAction])
  // ----------------------- RENDER -----------------------

  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate("emergency_access.trust_you")}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <FlatList
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
            }}
          >
            <Text text={"No data"} style={{ textAlign: "center" }} />
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        data={trustedContacts}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <Contact
            isYourTrusted={false}
            setOnAction={() => {
              setOnAction(!onAction)
            }}
            trustedContact={item}
          />
        )}
      />
    </Screen>
  )
})
