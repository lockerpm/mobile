import { Platform } from "react-native"


interface SubsSku {
    PRE_MON: string,
    PRE_YEAR: string,
    FAM_MON: string,
    FAM_YEAR: string
}

const ANDROID_SKU: SubsSku = {
    "PRE_MON": 'pm_premium_monthly',
    "PRE_YEAR": 'pm_premium_yearly',
    "FAM_MON": 'pm_family_monthly',
    "FAM_YEAR": 'pm_family_yearly',
}

const IOS_SKU: SubsSku = {
    "PRE_MON": 'locker_pm_premium_monthly',
    "PRE_YEAR": 'locker_pm_premium_yearly',
    "FAM_MON": 'locker_pm_family_monthly',
    "FAM_YEAR": 'locker_pm_family_yearly',
}

export const SKU: SubsSku = Platform.select({
    android: ANDROID_SKU,
    ios: IOS_SKU
})

