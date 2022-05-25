import React, { useEffect, useState } from "react"
import { TouchableOpacity, View, ViewStyle, Dimensions } from "react-native"
import { Text, AutoImage as Image, Button, Modal } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { commonStyles } from "../../../../theme"
import { useStores } from "../../../../models"
import { PlanType } from "../../../../config/types"
import { useOrientation, Orientation, AdaptiveUI } from "../../../../services/mixins/orientation"

export const PremiumFeature = () => {
    const { color, translate } = useMixins()
    const { user } = useStores()
    const navigation = useNavigation()
    const { orientation, screenSize } = useOrientation()
    const [modalVisible, setModalVisible] = useState(false);
    const isFreeAccount = (user.plan?.alias === PlanType.FREE) || !user.plan


    useEffect(() => {
        if (modalVisible) {
            setModalVisible(false)
        }
    }, [orientation])

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
                isFreeAccount ? navigation.navigate("payment", { benefitTab: 2 })
                    : setModalVisible(true)
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
            <Modal
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
                title={translate('manage_plan.feature.emergency_contact.header')}>

                {
                    orientation == Orientation.PORTRAIT ?
                        <View>
                            <Image style={{ alignSelf: "center", height: 200 }} source={require("./assets/EmergencyContact.png")} />
                            <Text preset="black" style={{ marginTop: 12 }}>{translate('manage_plan.feature.emergency_contact.text')}</Text>
                            <Text preset="black" style={{ marginVertical: 16 }}>{translate('manage_plan.feature.emergency_contact.link')}</Text>
                        </View>
                        :
                        <View style={
                            {
                                width: "100%",
                                flexDirection: "row"
                            }}>
                            <Image style={{ height: 200, width: 200 }} source={require("./assets/EmergencyContact.png")} />
                            <View style={{ flex: 1, marginLeft: 20, alignSelf: "center" }}>
                                <Text preset="black" style={{ marginTop: 12 }}>{translate('manage_plan.feature.emergency_contact.text')}</Text>
                                <Text preset="black" style={{ marginVertical: 16 }}>{translate('manage_plan.feature.emergency_contact.link')}</Text>
                            </View>

                        </View>
                }


                <Button text={translate('manage_plan.feature.emergency_contact.button')} onPress={() => setModalVisible(false)} />
            </Modal>
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
            <TouchableOpacity onPress={prop.item.action} style={[BOX, {
                marginRight: prop.leftItem ? 18 : 0,
                maxHeight: 200
            }]}>
                <Image source={prop.item.img} style={{ height: "80%", width: "80%" }} />
                <Text preset="black" text={prop.item.desc} style={{ fontSize: 12, marginVertical: 10 }} />
            </TouchableOpacity>
        )
    }
    return (
        <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background, flex: 1 }]}>
            <Text preset="bold" text={translate('manage_plan.feature.title')} style={{ marginBottom: 20 }} />


            {
                screenSize === AdaptiveUI.TABLET ? <View style={ROW_ITEMS}>
                    <PremiumFeatureItem item={item.locker} leftItem={true} />
                    <PremiumFeatureItem item={item.emergencyContact} leftItem={true} />
                    <PremiumFeatureItem item={item.web} leftItem={true} />
                    <PremiumFeatureItem item={item.sharePassword} />
                </View> : <View>
                    <View style={ROW_ITEMS}>
                        <PremiumFeatureItem item={item.locker} leftItem={true} />
                        <PremiumFeatureItem item={item.emergencyContact} />
                    </View>
                    <View style={[ROW_ITEMS, { marginTop: 18 }]}>
                        <PremiumFeatureItem item={item.web} leftItem={true} />
                        <PremiumFeatureItem item={item.sharePassword} />
                    </View>
                </View>
            }
            <View style={{
                flex: 1,
                alignSelf: "center"
            }}>
                <EmergencyContactModal />
            </View>
        </View>
    )
}
