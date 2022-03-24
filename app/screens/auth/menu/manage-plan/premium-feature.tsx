import React, { useState } from "react"
import { TouchableOpacity, View, ViewStyle, Linking } from "react-native"
import { Text, AutoImage as Image, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { commonStyles } from "../../../../theme"
import { useStores } from "../../../../models"
import Modal from "react-native-modal";
import { PlanType } from "../../../../config/types"


export const PremiumFeature = () => {
    const { color, translate } = useMixins()
    const { user } = useStores()
    const navigation = useNavigation()

    const [modalVisible, setModalVisible] = useState(false);
    const isFreeAccount = user.plan?.alias === PlanType.FREE

    const item = {
        locker: {
            img: require("./assets/Locker.png"),
            desc: translate('manage_plan.feature.locker'),
            action: () => {
                isFreeAccount ? navigation.navigate("payment", { benefitTab: 0 })
                    : navigation.navigate('mainTab', { screen: 'homeTab' });
            }
        },
        emergencyContact: {
            img: require("./assets/EmergencyContact.png"),
            desc: translate('manage_plan.feature.emergency_contact.header'),
            action: () => {
                setModalVisible(true)
                // isFreeAccount ? navigation.navigate("payment", { benefitTab: 2 })
                //     : setModalVisible(true)
            }
        },
        web: {
            img: require("./assets/Web.png"),
            desc: translate('manage_plan.feature.web'),
            action: () => {
                isFreeAccount ? navigation.navigate("payment", { benefitTab: 1 })
                    : navigation.navigate('mainTab', { screen: 'toolsTab' });
            }
        },
        sharePassword: {
            img: require("./assets/SharePassword.png"),
            desc: translate('manage_plan.feature.share_password'),
            action: () => {
                isFreeAccount ? navigation.navigate("payment", { benefitTab: 3 })
                    : navigation.navigate('mainTab', {
                        screen: 'browseTab',
                        params: {
                            screen: 'shares',
                        },
                    });
            }
        }
    }

    // -------------------- RENDER ----------------------

    const CENTER_VIEW: ViewStyle = {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    }

    const ROW_ITEMS: ViewStyle = {
        height: 130,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    }

    const BOX: ViewStyle = {
        flex: 1,
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: color.block
    }

    const EmergencyContactModal = () => {
        return (
            <View style={CENTER_VIEW} >
                <Modal isVisible={modalVisible}>
                    <View style={{ backgroundColor: color.background, padding: 20, borderRadius: 16}}>
                        <Image style={{alignSelf: "center", height: 180}} source={require("./assets/EmergencyContact.png")} />
                        <Text preset="header">{translate('manage_plan.feature.emergency_contact.header')}</Text>
                        <Text preset="black" style={{marginTop: 12}}>{translate('manage_plan.feature.emergency_contact.text')}</Text>
                        <Text preset="black" style={{marginVertical: 16}}>{translate('manage_plan.feature.emergency_contact.link')}</Text>        
                        <Button text={translate('manage_plan.feature.emergency_contact.button')} onPress={() => setModalVisible(false)} />
                         {/*                      
                        <TouchableOpacity  onPress={() => Linking.openURL("https://locker.io/settings/security")}>
                            <Text >Go to locker.io/vault</Text>
                        </TouchableOpacity> */}
                    </View>
                </Modal>
            </View>
        )
    }

    const PremiumFeatureItem = (prop: {
        item: {
            img: any,
            desc: string,
            action: () => void
        },
        leftItem?: boolean
    }) => {
        return (
            <TouchableOpacity onPress={prop.item.action} style={[BOX, { marginRight: prop.leftItem ? 10 : 0 }]}>
                <Image source={prop.item.img} style={{ height: "80%" }} />
                <Text preset="black" text={prop.item.desc} style={{ fontSize: 12, marginVertical: 10 }} />
            </TouchableOpacity>
        )
    }
    return (
        <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
            <Text preset="bold" text={translate('manage_plan.feature.title')} style={{ marginBottom: 20 }} />
            <View style={ROW_ITEMS}>
                <PremiumFeatureItem item={item.locker} leftItem={true} />
                <PremiumFeatureItem item={item.emergencyContact} />
            </View>
            <View style={[ROW_ITEMS, { marginTop: 10 }]}>
                <PremiumFeatureItem item={item.web} leftItem={true} />
                <PremiumFeatureItem item={item.sharePassword} />
            </View>
            <View style={{
                flex: 1,
                alignSelf: "center"
            }}>
                <EmergencyContactModal />
            </View>
        </View>
    )
}
