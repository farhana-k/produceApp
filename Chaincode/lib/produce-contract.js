/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const OrderContract = require('./order-contract');

class ProduceContract extends Contract {

    async produceExists(ctx, produceId) {
        const buffer = await ctx.stub.getState(produceId);
        return (!!buffer && buffer.length > 0);
    }

    async createProduce(
        ctx, 
        produceId, 
        produceName,
        harvestDate,
        bestBefore,
        farmName,
        quantity
        ) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'farmer-agro-com') {
            const exists = await this.produceExists(ctx, produceId);
            if (exists) {
                throw new Error(`This product with id ${produceId} already exists`);
            }
            const produceAsset = {
                produceName,
                harvestDate,
                bestBefore,
                quantity,
                status: 'In Farm',
                ownedBy: farmName,                
                assetType: 'product',
            };
            const buffer = Buffer.from(JSON.stringify(produceAsset));
            await ctx.stub.putState(produceId, buffer);

            // let addProduceEventData = { Type: 'Produce creation', Model: model };
            // await ctx.stub.setEvent('addProduceEvent', Buffer.from(JSON.stringify(addProduceEventData)));

        } else {
            return `User under following MSP:${mspID} cannot able to perform this action`;
        }
    }

    async readProduce(ctx, produceId) {
        const exists = await this.produceExists(ctx, produceId);
        if (!exists) {
            throw new Error(`The produce ${produceId} does not exist`);
        }
        const buffer = await ctx.stub.getState(produceId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }


    async deleteProduce(ctx, produceId) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'farmer-agro-com') {
        const exists = await this.produceExists(ctx, produceId);
        if (!exists) {
            throw new Error(`The produce ${produceId} does not exist`);
        }
        await ctx.stub.deleteState(produceId);
        } else {
            return `User under following MSP:${mspID} cannot able to perform this action`;
        }
    }

    async checkMatchingOrders(ctx, produceId) {
        const exists = await this.produceExists(ctx, produceId);
        if (!exists) {
            throw new Error(`The produce ${produceId} does not exist`);
        }

        const produceBuffer = await ctx.stub.getState(produceId);
        const produceDetails = JSON.parse(produceBuffer.toString());

        const queryString = {
            selector: {
                assetType  : 'order',
                produceName: produceDetails.produceName,
                // harvestDate: produceDetails.harvestDate,
                quantity: produceDetails.quantity,
            },
        };

        const orderContract = new OrderContract();
        const orders = await orderContract.queryAllOrders(
            ctx,
            JSON.stringify(queryString)
        );

        return orders;
    }


    async matchOrder(ctx, produceId, orderId) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'farmer-agro-com') {

        const orderContract = new OrderContract();

        const produceDetails = await this.readProduce(ctx, produceId);
        const orderDetails   = await orderContract.readOrder(ctx, orderId);

        if (
            orderDetails.produceName === produceDetails.produceName &&
            orderDetails.quantity === produceDetails.quantity
        ) {
            produceDetails.ownedBy = orderDetails.buyerName;
            produceDetails.status = 'Sold out';

            const newproduceBuffer = Buffer.from(JSON.stringify(produceDetails));
            await ctx.stub.putState(produceId, newproduceBuffer);

            await orderContract.deleteOrder(ctx, orderId);
            await this.deleteProduce(ctx, produceId);
            return `produce ${produceId} is sold to ${orderDetails.buyerName}`;
        } else {
            return 'Order is not matching';
        }
    } else {
        return `User under following MSP:${mspID} is unauthorised to perform this action`;
    }
    }

    async queryAllProduces(ctx) {
        const queryString = {
            selector: {
                assetType: 'product',
            },
            sort: [{ harvestDate: 'asc' }],
        };
        let resultIterator = await ctx.stub.getQueryResult(
            JSON.stringify(queryString)
        );
        let result = await this.getAllResults(resultIterator, false);
        return JSON.stringify(result);
    }

    async getAllResults(iterator, isHistory) {
        let allResult = [];

        for (
            let res = await iterator.next();
            !res.done;
            res = await iterator.next()
        ) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.timestamp = res.value.timestamp;
                    jsonRes.Value = JSON.parse(res.value.value.toString());
                } else {
                    jsonRes.Key = res.value.key;
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                }
                allResult.push(jsonRes);
            }
        }
        await iterator.close();
        return allResult;
    }

    async checkMatchingOrders(ctx, productId) {
        const exists = await this.produceExists(ctx, productId);
        if (!exists) {
            throw new Error(`The Product with ID ${productId} does not exist`);
        }

        const productBuffer = await ctx.stub.getState(productId);
        const productDetails = JSON.parse(productBuffer.toString());

        const queryString = {
            selector: {
                assetType: 'order',
                productName: productDetails.productName,
                quantity: productDetails.quantity,
            },
        };

        const orderContract = new OrderContract();
        const orders = await orderContract.queryAllOrders(
            ctx,
            JSON.stringify(queryString)
        );

        return orders;
    }


}

module.exports = ProduceContract;
