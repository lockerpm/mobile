import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { Header, Screen, Text } from "app/components/cores"
import { useStores } from "app/models"
import { TrustedContact } from "app/static/types"
import { Contact } from "../Contact"
import { EmergencyAccessScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"

export const ContactsTrustedYouScreen: FC<EmergencyAccessScreenProps<"contactsTrustedYou">> =
  observer(({ navigation }) => {
    const { notifyApiError } = useToast()
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
            onLeftPress={navigation.goBack}
            titleTx={"emergency_access.trust_you"}
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
