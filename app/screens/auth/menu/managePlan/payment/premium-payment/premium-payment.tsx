import React from "react"
import { View, Image } from "react-native"
import { Button, Text } from "../../../../../../components"
// import { commonStyles, fontSize } from "../../../../../theme"
import { useMixins } from "../../../../../../services/mixins"
import AntDesign from "react-native-vector-icons/AntDesign"
import { Subscription } from "react-native-iap";
import { commonStyles } from "../../../../../../theme"
import { SKU } from "../price-plan.sku"



interface Props {
    isTrial: boolean
    subscriptions: Subscription[]
    onPress: React.Dispatch<React.SetStateAction<boolean>>
    purchase: (subID: string) => void
    isEnable: boolean
    isProcessPayment: boolean
}

export const PremiumPayment = (props: Props) => {
    const { translate, color } = useMixins()

    const benefits = [
        {
            text: translate('payment.family.benefits.storage')
        },
        {
            text: translate('payment.family.benefits.health')
        },
        {
            text: translate('payment.family.benefits.weak')
        },
        {
            text: translate('payment.family.benefits.scaner')
        },
        {
            text: translate('payment.family.benefits.emergency')
        },
        {
            text: translate('payment.family.benefits.share')
        }
    ]

    return (
        <View style={{ width: "100%" }}>
            <View style={{
                alignItems: "center"
            }}>
                <Image source={require('../security.png')} style={{
                    width: 200,
                    height: 200,
                }} />
                <Text preset="header" text={translate('payment.premium.header')} />
                <Text preset="black" text={translate('payment.premium.ads')} style={{
                    textAlign: "center",
                    marginTop: 8,
                    marginHorizontal: 20
                }} />
            </View>

            <View style={[commonStyles.SECTION_PADDING, {
                borderRadius: 12,
                backgroundColor: color.block,
                marginVertical: 16,
                marginHorizontal: 20
            }]}>
                {
                    benefits.map((e, index) => (
                        <View
                            key={String(index)}
                            style={{
                                flexDirection: "row",
                                marginVertical: 6
                            }}>
                            <AntDesign name="check" size={20} />
                            <Text text={e.text} preset={'black'} style={{ marginLeft: 12 }} />
                        </View>
                    ))
                }

            </View>


            <View style={{ backgroundColor: color.background, marginHorizontal: 20 }}>
                <Button
                   preset="outline"
                    style={{
                        marginVertical: 10,
                    }}
                    isLoading={props.isProcessPayment}
                    onPress={() => {
                        props.purchase(SKU.PRE_MON)
                    }}
                >
                    <Text
                        preset="bold"
                        style={{ color: color.primary }}
                    >
                        {props.isProcessPayment ? "" : translate('payment.premium.month')}
                    </Text>
                </Button>
                <Button
                    style={{
                        marginVertical: 10,
                    }}
                    isLoading={props.isProcessPayment}
                    onPress={() => {
                        props.purchase(SKU.PRE_YEAR)
                    }}
                >
                    <Text
                        preset="bold"
                        style={{ color: color.white }}
                    >
                        {props.isProcessPayment ? "" : translate('payment.premium.year')}
                    </Text>
                </Button>

            </View>
        </View>
    )
}
