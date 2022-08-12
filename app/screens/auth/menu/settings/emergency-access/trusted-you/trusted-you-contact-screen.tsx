import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, Header, Button } from "../../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SectionWrapperItem } from "../../settings-item"
import { useMixins } from "../../../../../../services/mixins"
import { TrustedContact } from "../../../../../../services/api"
import { useStores } from "../../../../../../models"
import { Contact } from "../contact"
import { View } from "react-native"




export const ContactsTrustedYouScreen = observer(function ContactsTrustedYouScreen() {
  const navigation = useNavigation()
  const { translate, color, notifyApiError } = useMixins()
  const { user } = useStores()
  // ----------------------- PARAMS -----------------------
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([])
  const [onAction, setOnAction] = useState(false)
  // ----------------------- METHODS -----------------------

  const granted = async () => {
    const res = await user.grantedEA()
    if (res.kind === "ok") {
      setTrustedContacts(res.data)
      // console.log(res.data)
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
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={"Contacts that trusted you"}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <SectionWrapperItem>
        {
          trustedContacts.map((item) => (
            <Contact
              isYourTrusted={false}
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

