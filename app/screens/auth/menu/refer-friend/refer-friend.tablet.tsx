import React, { useState, useEffect } from "react"
import { View, Share, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { Button, Text, Modal } from "../../../../components"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { useNavigation } from "@react-navigation/native"
import Feather from 'react-native-vector-icons/Feather'



export const ReferFriendTablet = ({ show, onClose }) => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { translate, color, notifyApiError, copyToClipboard } = useMixins()

  const [referLink, setReferLink] = useState<string>(null)

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: translate("refer_friend.refer_header") + referLink,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(result.activityType)
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const getLink = async () => {
      const res = await user.getReferLink()
      if (res.kind === "ok") {
        setReferLink(res.data.referral_link)
      } else {
        notifyApiError(res)
      }
    }
    getLink()
  }, [])

  // ----------------------- RENDER -----------------------
  return (
    <Modal
      isOpen={show}
      onClose={onClose()}
      title={translate('manage_plan.feature.emergency_contact.header')}
    >

      <Image source={require('./refer.png')} style={{
        marginTop: 20,
        alignSelf: "center",
        width: "40%",
        height: "40%"
      }} />

      <Text preset="header"
        style={{ marginTop: 32, alignSelf: "center" }}
        text={translate('refer_friend.title')} />
      <Text preset="default"
        style={{ marginVertical: 16 }}
        text={translate('refer_friend.desc')} />


      <TouchableOpacity
        onPress={() => copyToClipboard(translate("refer_friend.refer_header") + referLink)}
        style={{
          borderColor: "black",
          borderRadius: 4,
          borderWidth: 0.2,
          padding: 10,
          flexDirection: "row"
        }}>
        <Feather name="link" size={18} />
        <Text text={referLink ? referLink : "Plack Holder"} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      <Button
        style={{
          marginTop: 16
        }}
        text={translate('refer_friend.btn')} onPress={() => onShare()} />
    </Modal>
  )
}
