import { AccountRole, CipherAppView } from "app/static/types"
import { getTeam } from "app/utils/cipherHelper"
import { CipherType } from "core/enums"
import { Organization } from "core/models/domain/organization"

type Props = {
  item: CipherAppView
  organizations: Organization[]
  isDeleted?: boolean
}

/**
 * Permission checks shared by the cipher actions modal and cipher detail actions.
 */
export const getCipherActionPermissions = ({ item, organizations, isDeleted = false }: Props) => {
  const lockerMasterPassword = item.type === CipherType.MasterPassword
  const shareRole = getTeam(organizations, item.organizationId).type
  const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
  const editable =
    !item.organizationId || shareRole === AccountRole.ADMIN || shareRole === AccountRole.OWNER

  const canEdit = !isDeleted && !lockerMasterPassword && editable
  const canStandardAttachment = !isDeleted && !lockerMasterPassword && !(isShared && !editable)
  const canSharedAttachment = !isDeleted && isShared

  return {
    lockerMasterPassword,
    isShared,
    editable,
    canEdit,
    canStandardAttachment,
    canSharedAttachment,
    canDelete: !isDeleted && !lockerMasterPassword && editable && !isShared,
  }
}
