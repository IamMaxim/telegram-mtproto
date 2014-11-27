//     telegram-mt-node
//     Copyright 2014 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     https://github.com/enricostara/telegram-mt-node

// Export utilities
exports.createMessageId = createMessageId;
exports.createSHA1Hash = createSHA1Hash;
exports.createRandomBuffer = createRandomBuffer;
exports.createNonce = createNonce;
exports.modPow = modPow;

// Import dependencies
var crypto = require('crypto');
var BigInteger = require('jsbn');
var CryptoJS = require("node-cryptojs-aes").CryptoJS;
var getLogger = require('get-log');

// Create a message ID starting from the local time
function createMessageId() {
    var logger = getLogger('utility.createMessageId');
    // Constants
    var thousand = new BigInteger((1000).toString());
    var lowerMultiplier = new BigInteger((4294964).toString());
    // Take the time and sum the time-offset with the server clock
    var time = new BigInteger((require('./time').getLocalTime()).toString());
    // Divide the time by 1000 `result[0]` and take the fractional part `result[1]`
    var result = time.divideAndRemainder(thousand);
    // Prepare lower 32 bit using the fractional part of the time
    var lower = result[1].multiply(lowerMultiplier);
    // Create the message id
    var messageId = result[0].shiftLeft(32).add(lower);
    if (logger.isDebugEnabled()) {
        logger.debug('MessageId(%s) was created with time = %s and offset = %s, lower = %s,  messageID binary = %s',
            messageId.toString(), time, lower,  messageId.toString(2));
    }
    return messageId.toString();
}

// Create SHA1 hash starting from a buffer or an array of buffers
function createSHA1Hash(buffer) {
    var logger = getLogger('utility.createSHA1Hash');
    var sha1sum = crypto.createHash('sha1');
    if (require('util').isArray(buffer)) {
        if (logger.isDebugEnabled()) logger.debug('It\'s an Array of buffers');
        for (var i = 0; i < buffer.length; i++) {
            sha1sum.update(buffer[i]);
        }
    } else {
        if (logger.isDebugEnabled()) logger.debug('It\'s only one buffer');
        sha1sum.update(buffer);
    }
    return sha1sum.digest();
}

// Create a random Buffer
function createRandomBuffer(bytesLength) {
    return new Buffer(crypto.randomBytes(bytesLength));
}

// Create a new nonce
function createNonce(bytesLength) {
    return '0x' + createRandomBuffer(bytesLength).toString('hex');
}

// Mod Pow
function modPow(x, e, m) {
    var logger = getLogger('utility.aesDecrypt');
    var bigX = (typeof x == 'number') ? new BigInteger(x + '', 10) : new BigInteger(x.toString('hex'), 16);
    var bigE = (typeof e == 'number') ? new BigInteger(e + '', 10) : new BigInteger(e.toString('hex'), 16);
    var bigM = (typeof m == 'number') ? new BigInteger(m + '', 10) : new BigInteger(m.toString('hex'), 16);
    var bigResult = bigX.modPow(bigE, bigM);
    if (logger.isDebugEnabled()) logger.debug('X = %s, E = %s, M = %s, result = %s', bigX, bigE, bigM, bigResult);
    var result = new Buffer(bigResult.toByteArray());
    if (result.length > 256) {
        result = result.slice(result.length - 256);
    }
    return result;
}