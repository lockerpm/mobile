const replace = require('replace-in-file');
const input = require('prompt-sync')({ sigint: true });
const fs = require('fs')
const path = require('path')

// const { dirname } = require('path');
// const appDir = dirname(require.main.filename);

// console.log(appDir)

/**
 * Create directory if not exists
 * @param {string} dir direactory path
 */
function mkdirIfNotExist(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Recursively moving files and directory from source path to target path
 * @param {string} sourceDir 
 * @param {string} targetDir 
 * @returns 
 */
function refactorAndroidPackage(sourceDir, targetDir) {
  mkdirIfNotExist(targetDir)
  return new Promise((resolve, reject) => {
    fs.readdir(sourceDir, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      files.forEach((file) => {
        const oldPath = path.join(sourceDir, file);
        const newPath = path.join(targetDir, file);
        const stat = fs.lstatSync(oldPath);

        if (stat.isDirectory()) {
          mkdirIfNotExist(newPath)

          moveFiles(oldPath, newPath)
            .then(() => {
              if (files.indexOf(file) === files.length - 1) {
                resolve();
              }
            })
            .catch((err) => reject(err));
        } else if (stat.isFile()) {
          fs.rename(oldPath, newPath, (err) => {
            if (err) {
              reject(err);
              return;
            }

            if (files.indexOf(file) === files.length - 1) {
              resolve();
            }
          });
        }
      });
    });
  });
}


// Get custom self hosted app bundle id and apple development team id
let bundleId = input('Enter app bundleId: ');
let teamId = input('Enter apple development team: ');

const replaceBundleIdOptions = {
  // find and replace locker with new bundle id
  files: [
    '../android/build.gradle',
    '../android/app/BUCK',
    '../android/app/build.gradle',
    '../android/app/proguard-rules.pro',
    '../android/app/src/main/AndroidManifest.xml',
    '../android/app/src/**/**/**/**/**/**/*.java',
    '../android/app/src/**/**/**/**/**/**/**/*.java',
    '../android/app/src/**/**/**/**/**/**/**/**/*.java',
    '../app/components/webviewModal/WebviewModal.tsx',
    '../app/navigators/RootNavigator.tsx',
    '../app/screens/auth/menu/autofillService/AutofillServiceScreen.android.tsx',
    '../ios/Locker/Info.plist',
    '../ios/Locker/*.entitlements',
    '../ios/Locker/RNCryptoService/RSAUtils.swift',
    '../ios/Locker.xcodeproj/project.pbxproj',
    '../ios/LockerAutofill/Config.xcconfig',
    '../ios/LockerAutofill/*.entitlements',
    '../ios/LockerAutofill/Utils/Utils.swift',
  ],

  // test selfhosted bundle id , teamid
  from: [/com.cystack.locker.selfhost/g, /W7S57TNBH5/g],
  to: [bundleId, teamId],
};


// Replacing process
replace(replaceBundleIdOptions)
  .then(results => {
    console.log('Modified files:');
    const changedFiles = results
      .filter(result => result.hasChanged)
      .map(result => result.file);

    changedFiles.forEach(element => {
      console.log(element);
    });
  })
  .catch(error => {
    console.error('Error occurred:', error);
    throw new Error();
  });


// refactoring android package
const androidSrcDir = '../android/app/src'
const modes = ['debug', 'main', 'release']
const oldPackage = 'com.cystack.locker.selfhost'.replace('.', '/');
const package = bundleId.replace('.', '/');


Promise.all(modes.map(mode => {
  const sourceDir = path.join(androidSrcDir, modes, oldPackage)
  const targetDir = path.join(androidSrcDir, modes, package)
  refactorAndroidPackage(sourceDir, targetDir)
    .then(() => console.log(`Refactor ${mode} package to ${bundleId}`))
    .catch((err) => console.log(err))
}))





