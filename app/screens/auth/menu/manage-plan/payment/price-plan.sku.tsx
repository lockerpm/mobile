import Config from "react-native-config"
import { IS_IOS } from "../../../../../config/constants"


interface SubsSku {
    PRE_MON: string,
    PRE_YEAR: string,
    FAM_MON: string,
    FAM_YEAR: string
}

const ANDROID_SKU: SubsSku = {
    "PRE_MON": Config.ANDROID_PRE_MON_SKU,
    "PRE_YEAR": Config.ANDROID_PRE_YEAR_SKU,
    "FAM_MON": Config.ANDROID_FAM_MON_SKU,
    "FAM_YEAR": Config.ANDROID_FAM_YEAR_SKU,
}

const IOS_SKU: SubsSku = {
    "PRE_MON": Config.IOS_PRE_MON_SKU,
    "PRE_YEAR": Config.IOS_PRE_YEAR_SKU,
    "FAM_MON": Config.IOS_FAM_MON_SKU,
    "FAM_YEAR": Config.IOS_FAM_YEAR_SKU,
}

export const SKU: SubsSku = IS_IOS ?  IOS_SKU : ANDROID_SKU
