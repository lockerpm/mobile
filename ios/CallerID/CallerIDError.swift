//
//  CallerIDError.swift
//  Locker
//
//  Created by Nguyen Thinh on 6/5/25.
//

enum CallerIDError: Error {
  case extensionUnknow
  case extensionDisable
  case reloadExtensionError
  case extensionError
  case bundleError
  case noContainer
  case unknown(String)
}

extension CallerIDError {
    var description: String? {
        switch self {
        case .extensionUnknow:
            return "The extension status is unknown"
        case .extensionDisable:
            return "The Call Directory extension is disabled in Settings"
        case .reloadExtensionError:
            return "Failed to reload extension"
        case .extensionError:
            return "Failed to check extension status"
        case .bundleError:
            return "Unable to get app bundle ID"
        case .noContainer:
            return "Failed to get shared container path"
        case .unknown(let message):
            return message
        }
    }

    var code: String {
        switch self {
        case .extensionUnknow:
            return "EXTENSION_UNKNOWN"
        case .extensionDisable:
            return "EXTENSION_DISABLED"
        case .reloadExtensionError:
            return "EXTENSION_RELOAD_FAILED"
        case .extensionError:
            return "EXTENSION_ERROR"
        case .bundleError:
          return "BUNDLE_ERROR"
        case .noContainer:
          return "NO_CONTAINER"
        case .unknown:
          return "UNKNOWN"
        }
    }
}
