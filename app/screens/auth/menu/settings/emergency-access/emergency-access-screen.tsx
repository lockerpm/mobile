import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { Layout, Header } from "../../../../../components"
import { SettingsItem, SectionWrapperItem } from "../settings-item"
import { useMixins } from "../../../../../services/mixins"
import { useNavigation } from "@react-navigation/native"
import { TrustedContact } from "../../../../../services/api"
import { useStores } from "../../../../../models"
import { EmergencyAccessStatus } from "../../../../../config/types"

export const EmergencyAccessScreen = () => {
  const navigation = useNavigation()
  const { translate, color, notifyApiError } = useMixins()
  const { user } = useStores()

  // ----------------------- PARAMS -----------------------
  const [grant, setGrant] = useState<TrustedContact[]>([])
  const [trusted, setTrusted] = useState<TrustedContact[]>([])


  const pendingRequest = (() => {
    return trusted.filter(e => e.status === EmergencyAccessStatus.RECOVERY_INITIATED).length
  })()

  const pendingInvite = (() => {
    return grant.filter(e => e.status === EmergencyAccessStatus.RECOVERY_INITIATED).length
  })()
  // ----------------------- METHODS -----------------------

  const mount = async () => {
    const resTrusted = await user.trustedEA()
    if (resTrusted.kind === "ok") {
      setTrusted(resTrusted.data)
      // console.log(res.data)
    } else {
      notifyApiError(resTrusted)
    }
    const resGrant = await user.grantedEA()
    if (resGrant.kind === "ok") {
      setGrant(resGrant.data)
      // console.log(res.data)
    } else {
      notifyApiError(resGrant)
    }
  }
  // ----------------------- RENDER -----------------------
  useEffect(() => {
    mount()
  }, [])

  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('emergency_access.title')}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <SectionWrapperItem>
        {/* Push notifications */}
        <SettingsItem
          name={translate('emergency_access.your_trust')}
          action={() => navigation.navigate("yourTrustedContact")}
          status={pendingRequest > 0 ? translate('emergency_access.pending_trusted', {
            count: pendingRequest,
            s: pendingRequest > 1 ? "s" : ""
          }): ""}
        />
        {/* Push notifications end */}

        {/* Email */}
        <SettingsItem
          noBorder
          name={translate('emergency_access.trust_you')}
          action={() => navigation.navigate("contactsTrustedYou")}
          status={pendingInvite > 0 ? translate('emergency_access.pending_grant', {
            count: pendingInvite,
            s: pendingInvite > 1 ? "s" : ""
          }) : ""}
        />
        {/* Email end */}
      </SectionWrapperItem>
    </Layout>
  )
}

