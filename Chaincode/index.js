/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const ProduceContract = require('./lib/produce-contract');
const OrderContract   = require('./lib/order-contract');

module.exports.ProduceContract = ProduceContract;
module.exports.OrderContract = OrderContract;
module.exports.contracts = [ ProduceContract ,OrderContract];
