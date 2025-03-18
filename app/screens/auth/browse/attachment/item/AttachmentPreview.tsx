import React from "react"
import { AttachmentType } from "../usePickAttachment"
import { FilePreview } from "./FilePreview"
import { ImagePreview } from "./ImagePreview"

interface Props {
  item: AttachmentType
  setItem: (val: AttachmentType) => void
  addAttachment: () => void
}

export const AttachmentPreview = (props: Props) => {
  if (props.item.type.includes("image")) {
    return <ImagePreview {...props} />
  }

  return <FilePreview {...props} />
}
