import Promise from 'bluebird'
import { bytesToHex, sha1BytesSync,
  bytesFromHex, strDecToHex } from '../bin'

/**
*  Server public key, obtained from here: https://core.telegram.org/api/obtaining_api_id
*
* -----BEGIN RSA PUBLIC KEY-----
* MIIBCgKCAQEAwVACPi9w23mF3tBkdZz+zwrzKOaaQdr01vAbU4E1pvkfj4sqDsm6
* lyDONS789sVoD/xCS9Y0hkkC3gtL1tSfTlgCMOOul9lcixlEKzwKENj1Yz/s7daS
* an9tqw3bfUV/nqgbhGX81v/+7RFAEd+RwFnK7a+XYl9sluzHRyVVaTTveB2GazTw
* Efzk2DWgkBluml8OREmvfraX3bkHZJTKX4EQSjBbbdJ2ZXIsRrYOXfaA+xayEGB+
* 8hdlLmAjbCVfaigxX0CDqWeR1yFL9kwd9P0NsZRPsmoqVwMbMu7mStFai6aIhc3n
* Slv8kg9qv1m6XHVQY3PnEw+QQtqSIXklHwIDAQAB
* -----END RSA PUBLIC KEY-----
*/


const publisKeysHex = [{
  //eslint-disable-next-line
  modulus : 'c150023e2f70db7985ded064759cfecf0af328e69a41daf4d6f01b538135a6f91f8f8b2a0ec9ba9720ce352efcf6c5680ffc424bd634864902de0b4bd6d49f4e580230e3ae97d95c8b19442b3c0a10d8f5633fecedd6926a7f6dab0ddb7d457f9ea81b8465fcd6fffeed114011df91c059caedaf97625f6c96ecc74725556934ef781d866b34f011fce4d835a090196e9a5f0e4449af7eb697ddb9076494ca5f81104a305b6dd27665722c46b60e5df680fb16b210607ef217652e60236c255f6a28315f4083a96791d7214bf64c1df4fd0db1944fb26a2a57031b32eee64ad15a8ba68885cde74a5bfc920f6abf59ba5c75506373e7130f9042da922179251f',
  exponent: '010001'
}]

const publicKeysParsed = {} //TODO Move cache to ApiManager
let prepared = false



export const KeyManager = (Serialization) => {

  const mapPrepare = ({ modulus, exponent }) => {
    const RSAPublicKey = new Serialization()
    RSAPublicKey.storeBytes(bytesFromHex(modulus), 'n')
    RSAPublicKey.storeBytes(bytesFromHex(exponent), 'e')

    const buffer = RSAPublicKey.getBuffer()

    const fingerprintBytes = sha1BytesSync(buffer).slice(-8)
    fingerprintBytes.reverse()

    publicKeysParsed[bytesToHex(fingerprintBytes)] = {
      modulus,
      exponent
    }
  }

  const setPrepared = () => { prepared = true }

  const prepareRsaKeys = () => prepared
    ? Promise.resolve()
    : Promise
      .map(publisKeysHex, mapPrepare)
      .then(setPrepared)

  const selectRsaKey = fingerprints => () => {
    let fingerprintHex, foundKey
    for (let i = 0; i < fingerprints.length; i++) {
      fingerprintHex = strDecToHex(fingerprints[i])
      foundKey = publicKeysParsed[fingerprintHex]
      if (foundKey)
        return { fingerprint: fingerprints[i], ...foundKey }
    }

    return false
  }

  const selectRsaKeyByFingerPrint = fingerprints =>
    prepareRsaKeys()
      .then(selectRsaKey(fingerprints))

  return {
    prepare: prepareRsaKeys,
    select : selectRsaKeyByFingerPrint
  }
}

export default KeyManager
