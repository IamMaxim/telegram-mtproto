//     telegram-mt-node
//     Copyright 2014 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     https://github.com/enricostara/telegram-mt-node

//     MTProto module
//
// This module provide the `MTProto classes & method` as defined by the Telegram specification. The MTProto
// is the standard protocol to communicate with the Telegram data-center.

// Export the sub-modules
exports.net = require('./net');
exports.security = require('./security');
exports.utility = require('./utility');
exports.time = require('./time');

// Import dependencies
var TypeBuilder = require('telegram-tl-node').TypeBuilder;
var PlainMessage = require('./plain-message');
// Export PlainMessage
exports.PlainMessage = PlainMessage;

// MtProto API as provided by Telegram
var api = require('./tl-schema.json');

// Declare the `type` module
var type = { _id: 'type'};
// List the `mtproto` constructors
var constructors = ['ResPQ', 'P_Q_inner_data', 'Server_DH_Params', 'Server_DH_inner_data', 'Client_DH_Inner_Data', 'Set_client_DH_params_answer'];
// Build the `type` list
TypeBuilder.buildTypes(api.constructors, constructors, type);
// Export the 'type' module
exports.type = type;

// Declare the `service` module
var service = { _id: 'service'};
// List the `mtproto' methods
var methods = ['req_pq', 'req_DH_params', 'set_client_DH_params'];
// Build registered methods
TypeBuilder.buildTypes(api.methods, methods, service, PlainMessage);
// Export the 'service' module
exports.service = service;