import React, { useEffect, useState } from "react"
import { Layout, Header, Button, Text } from "../../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SectionWrapperItem } from "../../settings-item"
import { useMixins } from "../../../../../../services/mixins"
import { AddTrustedContactModal } from "./add-trusted-contact-modal"
import { TrustedContact } from "../../../../../../services/api"
import { useStores } from "../../../../../../models"
import { Contact } from "../contact"
import { FlatList, View } from "react-native"
import { PlanType } from "../../../../../../config/types"




export const YourTrustedContactScreen = () => {
  const navigation = useNavigation()
  const { translate, color, notifyApiError } = useMixins()
  const { user } = useStores()
  const isFree = user.plan.alias === PlanType.FREE

  // ----------------------- PARAMS -----------------------
  const [isShowAddModal, setIsShowAddModal] = useState(false)
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([])
  const [onAction, setOnAction] = useState(false)
  // ----------------------- METHODS -----------------------

  const trusted = async () => {
    const res = await user.trustedEA()
    if (res.kind === "ok") {
      setTrustedContacts(res.data)
      // console.log(res.data)
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
    <View >
      {
        isFree && (
          <View style={{
            alignItems: "center"
          }}>
            <Text text={translate('emergency_access.free_guild')} style={{ textAlign: "center" }} />
            {/* <Button text={translate('common.upgrade')} style={{ maxWidth: 150, marginTop: 20 }} /> */}
          </View>
        )
      }
      {
        !isFree && (
          <View style={{
            alignItems: "center"
          }}>
            <Text text={"No data"} style={{ textAlign: "center" }} />
            {/* <Button text={translate('common.upgrade')} style={{ maxWidth: 150, marginTop: 20 }} /> */}
          </View>
        )
      }
    </View>
  )

  return (
    <Layout
      noScroll
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('emergency_access.your_trust')}
          right={(
            <Button
              isDisabled={isFree}
              onPress={() => setIsShowAddModal(true)}
              preset="link"
              text={translate('common.add')}
            />)
          }
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <AddTrustedContactModal
        onAction={() => { setOnAction(!onAction) }}
        isShow={isShowAddModal}
        onClose={() => {
          setIsShowAddModal(false)
          setOnAction(!onAction)
        }}
      />
      <SectionWrapperItem>
        <FlatList
          ListEmptyComponent={<ListEmpty />}
          data={trustedContacts}
          keyExtractor={(item, index) => String(index)}
          renderItem={({ item }) => (
            <Contact
              isYourTrusted={false}
              setOnAction={() => { setOnAction(!onAction) }}
              trustedContact={item}
            />
          )}
        />
      </SectionWrapperItem>
    </Layout>
  )
}

