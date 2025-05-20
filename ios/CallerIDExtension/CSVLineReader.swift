//
//  CSVLineReader.swift
//  Locker
//
//  Created by Nguyen Thinh on 16/5/25.
//

import Foundation

class CSVLineReader {
    private let fileHandle: FileHandle
    private let delimiter = "\n".data(using: .utf8)!
    private var buffer = Data()
    private let encoding: String.Encoding

    init?(fileURL: URL, encoding: String.Encoding = .utf8) {
        self.encoding = encoding
        do {
            self.fileHandle = try FileHandle(forReadingFrom: fileURL)
        } catch {
            NSLog("❌ Failed to open file: \(error)")
            return nil
        }
    }

    deinit {
        try? fileHandle.close()
    }

    func readNextLines(limit: Int) -> [String]? {
        var lines: [String] = []

        while lines.count < limit {
            if let range = buffer.range(of: delimiter) {
                let lineData = buffer.subdata(in: 0..<range.lowerBound)
                if let line = String(data: lineData, encoding: encoding) {
                    lines.append(line)
                }
                buffer.removeSubrange(0..<range.upperBound)
            } else {
                let chunk = try? fileHandle.read(upToCount: 4096)
                if let chunk = chunk, !chunk.isEmpty {
                    buffer.append(chunk)
                } else {
                    // End of file
                    if !buffer.isEmpty, let line = String(data: buffer, encoding: encoding) {
                        lines.append(line)
                    }
                    buffer.removeAll()
                    break
                }
            }
        }

        return lines.isEmpty ? nil : lines
    }
}
