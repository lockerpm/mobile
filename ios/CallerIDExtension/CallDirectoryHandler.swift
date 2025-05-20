import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {
  override func beginRequest(with context: CXCallDirectoryExtensionContext) {
    do {
      try addAllIdentificationPhoneNumbersRaw(to: context)
      context.completeRequest()
    } catch {
      NSLog("❌ CallDirectory Error: \(error.localizedDescription)")
      context.cancelRequest(withError: error)
    }
  }
  private func addAllIdentificationPhoneNumbers(to context: CXCallDirectoryExtensionContext) throws {
    NSLog("addAllIdentificationPhoneNumbers")
    // Example: load from App Group file
    guard let groupUrl = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.cystack.lockerapp") else {
      throw NSError(domain: "AppGroupError", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Cannot access app group"])
    }
    NSLog(groupUrl.absoluteString)
    let fileURL = groupUrl.appendingPathComponent("caller_ids.csv")
    
    do {
      let content = try String(contentsOf: fileURL)
      let lines = content.components(separatedBy: .newlines)
      var num = 1;
      NSLog("1 \(lines.count)")
      for line in lines where !line.isEmpty {
        let components = line.components(separatedBy: ",")
        guard components.count == 2,
              let phoneNumber = Int64(components[0]) else {
          continue // skip malformed line
        }
        
        
        let label = components[1]
        if (num < 5) {
          NSLog("\(phoneNumber) \(label)")
          num += 1
        }
        context.addIdentificationEntry(withNextSequentialPhoneNumber: phoneNumber, label: label)
      }
    } catch {
      NSLog("❌ Read file Error: \(error.localizedDescription)")
    }
  }
  private func addAllIdentificationPhoneNumbersRaw(to context: CXCallDirectoryExtensionContext) throws {
    NSLog("addAllIdentificationPhoneNumbers")
    
    guard let fileURL = Bundle.main.url(forResource: "caller_ids", withExtension: "csv"),
          let reader = CSVLineReader(fileURL: fileURL) else {
      NSLog("❌ Failed to open file")
      return
    }
    var i = 1
    var j = 1
    do {
      while let lines = reader.readNextLines(limit: 1000) {
        NSLog("-------------------- %d", i)
      
        for line in lines {
          if (j == 1) {
            NSLog("-------------------- %s", line)
          }
          let components = line.components(separatedBy: ",")
          if (j == 1) {
            NSLog("\(components)")
          }
          guard components.count >= 3,
                let phoneNumber = Int64(components[1]) else {
            continue
          }
          if (j == 1) {
            NSLog("\(phoneNumber)")
          }
          let label = components[2...].joined(separator: ",").trimmingCharacters(in: .whitespaces)
          
          if (j == 1) {
            NSLog("\(label)")
          }
          context.addIdentificationEntry(withNextSequentialPhoneNumber: phoneNumber, label: label)
          j += 1
        }
        i += 1
      }
    } catch {
      NSLog("❌ Read file Error: \(error.localizedDescription)")
    }
    NSLog("✅ Finished loading paged caller IDs")
  }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
  func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {
    print("Call Directory failed: \(error)")
  }
}
