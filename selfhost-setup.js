import replace from "replace-in-file"
import fs from "fs"
import path from "path"
import * as selfhostConfigEnv from "./selfhost/env.js"

// Get custom self hosted app name, bundle id and apple development team id
const appName = selfhostConfigEnv.APP_NAME
const bundleId = selfhostConfigEnv.BUNDLE_ID
const teamId = selfhostConfigEnv.TEAM_ID

const LOCKER_BUNDLE_ID_SELFHOST = "com.cystack.locker.selfhost"
const LOCKER_TEAM_ID = "W7S57TNBH5"
const LOCKER_APP_NAME = "SHLocker"

// const appDir = path.dirname(require.main.filename);

/**
 * Create directory if not exists
 * @param {string} dir direactory path
 */
function mkdirIfNotExist(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * Recursively moving files and directory from source path to target path
 * @param {string} sourceDir
 * @param {string} targetDir
 * @returns
 */
function recursivelyMovingFiles(sourceDir, targetDir) {
  mkdirIfNotExist(targetDir)
  return new Promise((resolve, reject) => {
    fs.readdir(sourceDir, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      files.forEach((file) => {
        const oldPath = path.join(sourceDir, file)
        const newPath = path.join(targetDir, file)
        const stat = fs.lstatSync(oldPath)

        if (stat.isDirectory()) {
          mkdirIfNotExist(newPath)

          recursivelyMovingFiles(oldPath, newPath)
            .then(() => {
              if (files.indexOf(file) === files.length - 1) {
                resolve()
              }
            })
            .catch((err) => reject(err))
        } else if (stat.isFile()) {
          fs.rename(oldPath, newPath, (err) => {
            if (err) {
              reject(err)
              return
            }

            if (files.indexOf(file) === files.length - 1) {
              resolve()
            }
          })
        }
      })
    })
  })
}

/**
 * Delete directories from paths (exclude package)
 * @param {{
 *  paths: string[]
 *  oldPackage: string
 *  package: string
 * }} param0
 */
function deleteOldAndroidPackage({ paths, oldPackage, newPackage }) {
  try {
    const oldPackagePath = oldPackage.split("/")
    const packagePath = newPackage.split("/")

    // search for directories outside the new package path
    let index = 0
    while (true) {
      if (index === oldPackagePath.length) {
        // the new package path is nested within the old package
        // do not remove anythings
        index = -1
        break
      }
      if (index === packagePath.length) {
        break
      }
      if (oldPackagePath[index] === packagePath[index]) {
        // continue check nest path
        index += 1
      } else {
        break
      }
    }
    if (index === -1) {
      return
    }
    // path need to remove
    const unusedDir = oldPackagePath.slice(0, index + 1)
    paths.forEach((p) => {
      const removeDir = path.join(p, ...unusedDir)
      fs.rmSync(removeDir, { recursive: true, force: true })
    })
  } catch (error) {
    console.log(error)
    throw new Error()
  }
}

const replaceDefaultLockerBundleIDandAppName = async () => {
  console.log("Replacing App bundle ID, App name, Team ID...")
  const replaceBundleIdOptions = {
    // find and replace locker with new bundle id
    files: [
      "./android/build.gradle",
      "./android/app/BUCK",
      "./android/app/build.gradle",
      "./android/app/proguard-rules.pro",
      "./android/app/src/main/AndroidManifest.xml",
      "./android/app/src/main/res/values/strings.xml",
      "./android/app/src/**/**/**/**/**/**/*.java",
      "./android/app/src/**/**/**/**/**/**/**/*.java",
      "./android/app/src/**/**/**/**/**/**/**/**/*.java",
      "./app/components/webviewModal/WebviewModal.tsx",
      "./app/config/constants.ts",
      "./app/navigators/RootNavigator.tsx",
      "./app/screens/auth/menu/autofillService/AutofillServiceScreen.android.tsx",
      "./ios/Locker/Info.plist",
      "./ios/Locker/*.entitlements",
      "./ios/Locker/RNCryptoService/RSAUtils.swift",
      "./ios/Locker.xcodeproj/project.pbxproj",
      "./ios/LockerAutofill/Config.xcconfig",
      "./ios/LockerAutofill/*.entitlements",
      "./ios/LockerAutofill/Utils/Utils.swift",
    ],

    // test selfhosted bundle id , teamid
    from: [
      new RegExp(LOCKER_BUNDLE_ID_SELFHOST, "g"),
      new RegExp(LOCKER_TEAM_ID, "g"),
      new RegExp(LOCKER_APP_NAME, "g"),
    ],
    to: [bundleId, teamId, appName],
  }

  try {
    const results = await replace(replaceBundleIdOptions)
    const changedFiles = results.filter((result) => result.hasChanged).map((result) => result.file)
    changedFiles.forEach((element) => {
      console.log(element)
    })
  } catch (error) {
    console.error("Replacing App bundle ID, app name error: ", error)
    throw new Error()
  }
}

const refactoringAndroidPackage = async () => {
  console.log("Refactor android package...")
  const androidSrcDir = "./android/app/src"
  const modes = ["debug", "main", "release"]
  const oldPackage = LOCKER_BUNDLE_ID_SELFHOST.replaceAll(".", "/")
  const newPackage = bundleId.replaceAll(".", "/")
  const mainAndroidPackageDir = path.join(androidSrcDir, "main", "java", newPackage)
  if (!fs.existsSync(mainAndroidPackageDir)) {
    Promise.all(
      modes.map((mode) => {
        const sourceDir = path.join(androidSrcDir, mode, "java", oldPackage)
        const targetDir = path.join(androidSrcDir, mode, "java", newPackage)
        return recursivelyMovingFiles(sourceDir, targetDir)
      }),
    )
      .then(() => {
        console.log(`Refactor package to ${bundleId}`)
        deleteOldAndroidPackage({
          paths: modes.map((mode) => {
            return path.join(androidSrcDir, mode, "java")
          }),
          oldPackage,
          newPackage,
        })
      })
      .catch((err) => {
        console.log("Refactor android package error: ", err)
        throw new Error()
      })
  } else {
    console.log(`Android package ${bundleId} path exist.`)
  }
}

const replaceAppAssets = async () => {
  // console.log("Replacing App icon...")
  const tasks = [
    {
      source: "./selfhost/icons/android",
      target: "./android/app/src/main/res",
      title: "Replacing Android App icon",
    },
    {
      source: "./selfhost/icons/ios/app",
      target: "./ios/Locker/Images.xcassets",
      title: "Replacing IOS App icon and SplashScreen",
    },
    {
      source: "./selfhost/icons/ios/service",
      target: "./ios/LockerAutofill/assets.xcassets",
      title: "Replacing IOS Service icon",
    },
    {
      source: "./selfhost/logo",
      target: "./assets/logo",
      title: "Replacing Logo in app",
    },
  ]

  const exeTask = async (task) => {
    try {
      console.log(task.title, "..")
      await recursivelyMovingFiles(task.source, task.target)
    } catch (e) {
      console.log(task.title, " error: ", e)
      throw new Error()
    }
  }

  await Promise.all(tasks.map((task) => exeTask(task)))
}

const main = async () => {
  // validate app bundle id
  const regexp = /^[a-z0-9]+(\.[a-z0-9]+)+$/gi
  if (!regexp.test(bundleId)) {
    throw new Error("Invalid app bundle id.")
  }

  await replaceDefaultLockerBundleIDandAppName()
  await refactoringAndroidPackage()
  await replaceAppAssets()
}

// ---------------- MAIN APP-------------
main()
