import React, { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { AddTrustedContactModal } from "./AddTrustedContactModal"
import { Contact } from "../Contact"
import { FlatList, View } from "react-native"
import { Button, Header, Screen, Text } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { TrustedContact } from "app/static/types"
import { observer } from "mobx-react-lite"

export const YourTrustedContactScreen = observer(() => {
  const navigation = useNavigation() as any
  const { notifyApiError, translate } = useHelper()
  const { user } = useStores()

  // ----------------------- PARAMS -----------------------
  const [isShowAddModal, setIsShowAddModal] = useState(false)
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([])
  const [onAction, setOnAction] = useState(false)
  // ----------------------- METHODS -----------------------

  const trusted = async () => {
    const res = await user.trustedEA()
    if (res.kind === "ok") {
      setTrustedContacts(res.data)
    } else {
      notifyApiError(res)
    }
  }

  // ----------------------- EFFECT -----------------------
  useEffect(() => {
    trusted()
  }, [onAction])

  // ----------------------- RENDER -----------------------

  const ListEmpty = () => (
    <View
      style={{
        alignItems: 'center',
      }}
    >
      <Text text={'No data'} style={{ textAlign: 'center' }} />
    </View>
  )

  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate("emergency_access.title")}
          RightActionComponent={
            <Button
              onPress={() => setIsShowAddModal(true)}
              preset="teriatary"
              text={translate("common.add")}
            />
          }
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <AddTrustedContactModal
        onAction={() => {
          setOnAction(!onAction)
        }}
        isShow={isShowAddModal}
        onClose={() => {
          setIsShowAddModal(false)
          setOnAction(!onAction)
        }}
      />
      <FlatList
        ListEmptyComponent={<ListEmpty />}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        data={trustedContacts}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <Contact
            isYourTrusted={true}
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
