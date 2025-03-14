import RNFS from "react-native-fs"
import { launchImageLibrary } from "react-native-image-picker"
import { useHelper } from "app/services/hook"
import { usePermission } from "./permission"

// const IS_ANDROID = Platform.OS === "android"

export const usePickMedia = () => {
  const { notify } = useHelper()
  const { handleUserDeniedPermission } = usePermission()

  const uploadMedia = async () => {
    // const getFileName = (name: string, type?: string) => {
    //   if (IS_ANDROID && type) {
    //     const fileExtension = type.split("/").pop()
    //     return `${name.replace(":", "-")}.${fileExtension}`
    //   }
    //   return name
    // }
    // Pick image
    const res = await launchImageLibrary({
      mediaType: "mixed",
      quality: 0.8,
      selectionLimit: 1,
      videoQuality: "low",
    })
    if (res.errorCode) {
      if (res.errorCode === "permission") {
        handleUserDeniedPermission("Photos")
        return
      }
      notify("error", "File is corrupted")
      return
    }

    if (res.didCancel || res.assets.length === 0) {
      return
    }

    // sort by image
    res.assets = res.assets.sort((a, _b) => (a.type.includes("image") ? -1 : 1))

    await Promise.all(
      res.assets.map((file) => {
        return (async () => {
          // If file name have space or unicode characters, picker will encode it -> need decode
          if (file.uri !== decodeURIComponent(file.uri)) {
            try {
              await RNFS.stat(file.uri)
            } catch (error) {
              file.uri = decodeURIComponent(file.uri)
            }
          }
        })()
      }),
    )

    // eslint-disable-next-line no-restricted-syntax
    for (const file of res.assets) {
      console.log(file)
      // const fileName = getFileName(file.fileName, file.type)

      // eslint-disable-next-line no-await-in-loop
      // const { isSuccess, data } = await fileStore.startUploadProcess({
      //   uri: file.uri,
      //   attachmentId: attachmentMapper[index],
      //   messageId,
      //   accountId: account.id,
      //   conversationId: conversation.id,
      //   fileName,
      //   fileSize: file.fileSize,
      //   fileType: mediaType,
      //   secure: !isGroup,
      //   groupId: isGroup ? conversation.identifier : undefined,
      //   metadata,
      // })
    }
  }

  return { uploadMedia }
}
