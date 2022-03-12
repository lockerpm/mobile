import React from "react"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { Text, AutoImage as Image } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { commonStyles } from "../../../../theme"



export const PremiumFeature = () => {
    const { color, translate } = useMixins()
    const navigation = useNavigation()
    const item = {
        locker: {
            img: require("./assets/Locker.png"),
            desc: "Unlimited items",
            action: () => {
                navigation.navigate("payment", {benefitTab: 0})
            } 
        },
        emergencyContact: {
            img: require("./assets/EmergencyContact.png"),
            desc: "Emergency Contact",
            action: () => {
                navigation.navigate("payment", {benefitTab: 2})
            } 
        },
        web: {
            img: require("./assets/Web.png"),
            desc: "Dark Web Monitoring",
            action: () => {
                navigation.navigate("payment", {benefitTab: 1})
            } 
        },
        sharePassword: {
            img: require("./assets/SharePassword.png"),
            desc: "Share Passwords",
            action: () => {
                navigation.navigate("payment", {benefitTab: 3})
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

    const PremiumFeatureItem = (prop: {
        item: {
            img: any,
            desc: string
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
            <Text preset="bold" text="Explore your full premium feature" style={{marginBottom: 20}}/>
            <View style={ROW_ITEMS}>
                <PremiumFeatureItem item={item.locker} leftItem={true} />
                <PremiumFeatureItem item={item.emergencyContact} />
            </View>
            <View style={[ROW_ITEMS, { marginTop: 10 }]}>
                <PremiumFeatureItem item={item.web} leftItem={true} />
                <PremiumFeatureItem item={item.sharePassword} />
            </View>
        </View>
    )
}
