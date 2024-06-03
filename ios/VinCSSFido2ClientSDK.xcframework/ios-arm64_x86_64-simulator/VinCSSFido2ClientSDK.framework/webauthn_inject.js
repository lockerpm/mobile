javascript: (function() {
    navigator.userInterface = {};
    navigator.userInterface.promises = {};
    navigator.userInterface.resolvePromise = (promiseId, data, error) => {
        console.log("resolvePromise");
        if (error) {
            data.toString = () => {return data.message};
            navigator.userInterface.promises[promiseId].reject(new Error(error));
        } else {
            navigator.userInterface.promises[promiseId].resolve(data);
        }
        delete navigator.userInterface.promises[promiseId];
    };

    navigator.userInterface.generateUUID = () => {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    function buf2hex(buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    function encode (arraybuffer) {
        var bytes = new Uint8Array(arraybuffer),
            i, len = bytes.length, base64 = "";

        for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
        }

        if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1);
        } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2);
        }

        return base64;
    };

    function decode (base64) {
        let bufferLength = base64.length * 0.75,
            len = base64.length, i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

        let arraybuffer = new ArrayBuffer(bufferLength),
            bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return arraybuffer;
    };

    navigator.credentials = {};
    navigator.credentials.create = (createOptions) => {
        console.log(createOptions);
        createOptions['publicKey']['challenge'] = encode(createOptions['publicKey']['challenge']);
        createOptions['publicKey']['user']['id'] = encode(createOptions['publicKey']['user']['id']);
        if(createOptions['publicKey']['excludeCredentials']!=undefined) {
            var i = 0;
            for(i = 0;i<createOptions['publicKey']['excludeCredentials'].length; i++) {
                createOptions['publicKey']['excludeCredentials'][i]['id'] = encode(createOptions['publicKey']['excludeCredentials'][i]['id']);
            }
        }
        return new Promise((resolve, reject) => {
            var promiseId = navigator.userInterface.generateUUID();
            var data = JSON.stringify(createOptions);
            navigator.userInterface.promises[promiseId] = {resolve, reject};
            webkit.messageHandlers.VinCSS_FIDO2.postMessage({
                "mode": "create",
                "promiseId": promiseId,
                "data": data
            });
        }).then((resString) => {
            console.log(resString);
            if(resString=="" || resString==null) {
                console.log("Throw error");
                throw ("Authenticator error");
            }
            let res = resString;
            let resOb = {
            "id":encode(decode(res.rawId)),
            "rawId":decode(res.rawId),
            "response": {
                "clientDataJSON": decode(res.clientDataJSON),
                "attestationObject": decode(res.attestationObject)
            },
            "type":"public-key"
            };
            resOb.getClientExtensionResults = () => {return {}};
            return resOb;
        }).catch((errorString) => {
            console.log("promiseError");
            console.log(errorString);
            throw errorString;
        });
        return {};
    };

    navigator.credentials.get = (requestOptions) => {
        console.log(requestOptions);
        requestOptions['publicKey']['challenge'] = encode(requestOptions['publicKey']['challenge']);
        var i = 0;
        for(i = 0;i<requestOptions['publicKey']['allowCredentials'].length; i++) {
            requestOptions['publicKey']['allowCredentials'][i]['id'] = encode(requestOptions['publicKey']['allowCredentials'][i]['id']);
        }
        return new Promise((resolve, reject) => {
            var promiseId = navigator.userInterface.generateUUID();
            var data = JSON.stringify(requestOptions);
            navigator.userInterface.promises[promiseId] = {resolve, reject};
            webkit.messageHandlers.VinCSS_FIDO2.postMessage({
                "mode": "get",
                "promiseId": promiseId,
                "data": data
            });
        }).then((resString) => {
            console.log(resString);
            if(resString=="" || resString==null) {
                console.log("Throw error");
                throw ("Authenticator error");
            }
            console.log(resString);
            let res = resString;
            let resOb;
            if(res.userHandle!="") {
                resOb = {
                    "id":encode(decode(res.rawId)),
                    "rawId":decode(res.rawId),
                    "response": {
                        "authenticatorData": decode(res.authenticatorData),
                        "clientDataJSON": decode(res.clientDataJSON),
                        "signature": decode(res.signature),
                        "userHandle": decode(res.userHandle)
                    },
                    "type":"public-key"
                };
            } else {
                resOb = {
                    "id":encode(decode(res.rawId)),
                    "rawId":decode(res.rawId),
                    "response": {
                        "authenticatorData": decode(res.authenticatorData),
                        "clientDataJSON": decode(res.clientDataJSON),
                        "signature": decode(res.signature),
                    },
                    "type":"public-key"
                };
            }
            resOb.getClientExtensionResults = () => {return {}};
            return resOb;
        }).catch((errorString) => {
            throw errorString;
        });
        return {};
    };

    window.vincss = {};
    window.vincss.ios = {};
    window.vincss.ios.create = (createOptions) => {
        console.log(createOptions);
        createOptions['publicKey']['challenge'] = encode(createOptions['publicKey']['challenge']);
        createOptions['publicKey']['user']['id'] = encode(createOptions['publicKey']['user']['id']);
        if(createOptions['publicKey']['excludeCredentials']!=undefined) {
            var i = 0;
            for(i = 0;i<createOptions['publicKey']['excludeCredentials'].length; i++) {
                createOptions['publicKey']['excludeCredentials'][i]['id'] = encode(createOptions['publicKey']['excludeCredentials'][i]['id']);
            }
        }
        return new Promise((resolve, reject) => {
            var promiseId = navigator.userInterface.generateUUID();
            var data = JSON.stringify(createOptions);
            navigator.userInterface.promises[promiseId] = {resolve, reject};
            webkit.messageHandlers.VinCSS_FIDO2.postMessage({
                "mode": "create",
                "promiseId": promiseId,
                "data": data
            });
        }).then((resString) => {
            console.log(resString);
            if(resString=="" || resString==null) {
                console.log("Throw error");
                throw ("Authenticator error");
            }
            let res = resString;
            let resOb = {
            "id":encode(decode(res.rawId)),
            "rawId":decode(res.rawId),
            "response": {
                "clientDataJSON": decode(res.clientDataJSON),
                "attestationObject": decode(res.attestationObject)
            },
            "type":"public-key"
            };
            resOb.getClientExtensionResults = () => {return {}};
            return resOb;
        }).catch((errorString) => {
            console.log("promiseError");
            console.log(errorString);
            throw errorString;
        });
        return {};
    };

    window.vincss.ios.get = (requestOptions) => {
        console.log(requestOptions);
        requestOptions['publicKey']['challenge'] = encode(requestOptions['publicKey']['challenge']);
        var i = 0;
        for(i = 0;i<requestOptions['publicKey']['allowCredentials'].length; i++) {
            requestOptions['publicKey']['allowCredentials'][i]['id'] = encode(requestOptions['publicKey']['allowCredentials'][i]['id']);
        }
        return new Promise((resolve, reject) => {
            var promiseId = navigator.userInterface.generateUUID();
            var data = JSON.stringify(requestOptions);
            navigator.userInterface.promises[promiseId] = {resolve, reject};
            webkit.messageHandlers.VinCSS_FIDO2.postMessage({
                "mode": "get",
                "promiseId": promiseId,
                "data": data
            });
        }).then((resString) => {
            console.log(resString);
            if(resString=="" || resString==null) {
                console.log("Throw error");
                throw ("Authenticator error");
            }
            console.log(resString);
            let res = resString;
            let resOb;
            if(res.userHandle!="") {
                resOb = {
                    "id":encode(decode(res.rawId)),
                    "rawId":decode(res.rawId),
                    "response": {
                        "authenticatorData": decode(res.authenticatorData),
                        "clientDataJSON": decode(res.clientDataJSON),
                        "signature": decode(res.signature),
                        "userHandle": decode(res.userHandle)
                    },
                    "type":"public-key"
                };
            } else {
                resOb = {
                    "id":encode(decode(res.rawId)),
                    "rawId":decode(res.rawId),
                    "response": {
                        "authenticatorData": decode(res.authenticatorData),
                        "clientDataJSON": decode(res.clientDataJSON),
                        "signature": decode(res.signature),
                    },
                    "type":"public-key"
                };
            }
            resOb.getClientExtensionResults = () => {return {}};
            return resOb;
        }).catch((errorString) => {
            throw errorString;
        });
        return {};
    };
})()
