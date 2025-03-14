/* eslint-disable react-native/split-platform-components */
import { useHelper } from "app/services/hook"
import { Logger } from "app/utils/utils"
import { Alert, Linking, PermissionsAndroid, Platform } from "react-native"
import { check, PERMISSIONS, RESULTS } from "react-native-permissions"

const IS_ANDROID = Platform.OS === "android"

export const usePermission = () => {
  const { translate } = useHelper()

  const handleUserDeniedPermission = (type: string, onCancel?: () => void) => {
    Alert.alert(
      translate("file_attachment.permission_denied"),
      translate("file_attachment.permission_denied_desc", {
        type,
      }),
      [
        {
          text: translate("common.cancel"),
          onPress: onCancel,
          style: "cancel",
        },
        {
          text: translate("file_attachment.go_setting"),
          onPress: () => Linking.openSettings(),
        },
      ],
    )
  }

  const checkCameraPermission = (onCancel?: () => void) => {
    if (IS_ANDROID) {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
        .then((granted) => {
          switch (granted) {
            case PermissionsAndroid.RESULTS.DENIED:
              break
            case PermissionsAndroid.RESULTS.GRANTED:
              break
            case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
              handleUserDeniedPermission("Camera", onCancel)
              break
            default:
          }
        })
        .catch((err) => {
          Logger.error(err)
        })
      return
    }

    check(PERMISSIONS.IOS.CAMERA)
      .then((result) => {
        switch (result) {
          case RESULTS.DENIED:
            // handleUserDeniedPermission('Camera', onCancel)
            break
          case RESULTS.GRANTED:
            break
          case RESULTS.BLOCKED:
            handleUserDeniedPermission("Camera", onCancel)
            break
          default:
        }
      })
      .catch((err) => {
        Logger.error(err)
      })
  }

  const checkPhotoLibraryPermission = async (onCancel?: () => void) => {
    if (Platform.OS === "android") {
      if (Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        )
        switch (granted) {
          case PermissionsAndroid.RESULTS.DENIED:
            handleUserDeniedPermission("Photos", onCancel)
            return false
          case PermissionsAndroid.RESULTS.GRANTED:
            return true
          case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
            handleUserDeniedPermission("Photos", onCancel)
            return false
          default:
        }
        return false
      }
      const grantedVideo = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      )
      const grantedPhotos = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      )
      if (
        grantedVideo === PermissionsAndroid.RESULTS.GRANTED &&
        grantedPhotos === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true
      }
      handleUserDeniedPermission("Photos & Videos", onCancel)
      return false
    }

    if (Platform.OS === "ios") {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
      switch (result) {
        case RESULTS.UNAVAILABLE:
          return false
        case RESULTS.DENIED:
          return false
        case RESULTS.GRANTED:
          return true
        case RESULTS.BLOCKED:
          handleUserDeniedPermission("Photos", onCancel)
          return false
        default:
          return false
      }
    }
    return false
  }

  const checkLibraryPermission = (onCancel?: () => void) => {
    if (IS_ANDROID) return
    check(PERMISSIONS.IOS.PHOTO_LIBRARY)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            // handleUserDeniedPermission('Photo library', onCancel)
            break
          case RESULTS.DENIED:
            // handleUserDeniedPermission('Photo library', onCancel)
            break
          case RESULTS.GRANTED:
            break
          case RESULTS.BLOCKED:
            handleUserDeniedPermission("Photo library", onCancel)
            break
          default:
        }
      })
      .catch((err) => {
        Logger.error(err)
      })
  }

  const hasAndroidMediaPermission = async () => {
    const getCheckPermissionPromise = () => {
      if (Platform.OS === "android" && Platform.Version >= 33) {
        return Promise.all([
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
        ]).then(
          ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
            hasReadMediaImagesPermission && hasReadMediaVideoPermission,
        )
      }
      return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE)
    }

    const hasPermission = await getCheckPermissionPromise()
    if (hasPermission) {
      return true
    }
    const getRequestPermissionPromise = () => {
      if (Platform.OS === "android" && Platform.Version >= 33) {
        return PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]).then(
          (statuses) =>
            statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
              PermissionsAndroid.RESULTS.GRANTED,
        )
      }
      return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED,
      )
    }

    return await getRequestPermissionPromise()
  }

  return {
    handleUserDeniedPermission,
    checkCameraPermission,
    checkLibraryPermission,
    checkPhotoLibraryPermission,
    hasAndroidMediaPermission,
  }
}
