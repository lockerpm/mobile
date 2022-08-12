import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, Header, Button } from "../../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SectionWrapperItem } from "../../settings-item"
import { useMixins } from "../../../../../../services/mixins"
import { AddTrustedContactModal } from "./add-trusted-contact-modal"
import { TrustedContact } from "../../../../../../services/api"
import { useStores } from "../../../../../../models"
import { Contact } from "../contact"




export const YourTrustedContactScreen = observer(function YourTrustedContactScreen() {
  const navigation = useNavigation()
  const { translate, color, notifyApiError } = useMixins()
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

  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={"Your trusted contacts"}
          right={(
            <Button
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
        onClose={() => setIsShowAddModal(false)}
      />
      <SectionWrapperItem>
        {
          trustedContacts.map((item) => (
            <Contact
              isYourTrusted={true}
              setOnAction={() => { setOnAction(!onAction) }}
              key={item.id}
              trustedContact={item}
            />
          ))
        }

      </SectionWrapperItem>
    </Layout>
  )
})

