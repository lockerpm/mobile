import React from "react"
import { ImageStyle, StyleProp, ViewStyle, View } from "react-native"
import { IconTypes, icons } from "./icons"
import { AutoImage as Image } from "../auto-image/auto-image"


export interface IconProps {
    style?: StyleProp<ImageStyle>
    containerStyle?: StyleProp<ViewStyle>
    icon?: IconTypes
    size?: number
    color?: string
}

const ROOT: ImageStyle = {
    resizeMode: "contain"
}

export function Icon(props: IconProps) {
    const { style: styleOverride, icon, containerStyle, color, size } = props

    return (
        <View style={containerStyle}>
            {
                !!icons[icon] && (
                    <>
                        {
                            icons[icon].type === 'component' ? (
                                icons[icon].render({ color, size })
                            ) : (
                                <Image style={[ROOT, styleOverride]} source={icons[icon].source} />
                            )
                        }
                    </>
                )
            }
        </View>
    )
}

