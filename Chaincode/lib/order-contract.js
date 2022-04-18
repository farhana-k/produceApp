/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
// const ProduceContract = require('./produce-contract');

async function getCollectionName(ctx) {
    const collectionName = 'CollectionOrder';
    return collectionName;
}

class OrderContract extends Contract {
    
    async orderExists(ctx, orderId) {
        const collectionName = await getCollectionName(ctx);
        const data = await ctx.stub.getPrivateDataHash(collectionName, orderId);
        return !!data && data.length > 0;
    }

    async createOrder(ctx, orderId) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'buyer-agro-com') {
            const exists = await this.orderExists(ctx, orderId);
            if (exists) {
                throw new Error(`The asset order ${orderId} already exists`);
            }
            const orderAsset = {};
            const transientData = ctx.stub.getTransient();
            if (
                transientData.size === 0 ||
                !transientData.has('produceName') ||
                !transientData.has('quantity') ||
                !transientData.has('buyerName') 
            ) {
                throw new Error(
                    'The privateValue key was not specified in transient data. Please try again.'
                );
            }
            orderAsset.produceName = transientData.get('produceName').toString();
            orderAsset.quantity = transientData.get('quantity').toString();
            orderAsset.buyerName = transientData.get('buyerName').toString();
            orderAsset.assetType = 'order';

            const collectionName = await getCollectionName(ctx);
            await ctx.stub.putPrivateData(
                collectionName,
                orderId,
                Buffer.from(JSON.stringify(orderAsset))
            );
        } else {
            return `Under following MSP: ${mspID} cannot able to perform this action`;
        }
    }

    async readOrder(ctx, orderId) {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The asset order ${orderId} does not exist`);
        }
        let privateDataString;
        const collectionName = await getCollectionName(ctx);
        const privateData = await ctx.stub.getPrivateData(collectionName, orderId);
        privateDataString = JSON.parse(privateData.toString());
        return privateDataString;
    }

    async deleteOrder(ctx, orderId) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'buyer-agro-com' || mspID === 'farmer-agro-com') {
            const exists = await this.orderExists(ctx, orderId);
            if (!exists) {
                throw new Error(`The asset order ${orderId} does not exist`);
            }
            const collectionName = await getCollectionName(ctx);
            await ctx.stub.deletePrivateData(collectionName, orderId);
        } else {
            return `Under following MSP: ${mspID} cannot able to perform this action`;
        }
    }

    async queryAllOrders(ctx, queryString) {
        if (queryString.length === 0) {
            queryString = JSON.stringify({
                selector: {
                    assetType: 'order',
                },
            });
        }

        const collectionName = await getCollectionName(ctx);
        let resultsIterator = await ctx.stub.getPrivateDataQueryResult(
            collectionName,
            queryString
        );

        // let produceContract = new ProduceContract();
        // let result = await produceContract.getAllResults(resultsIterator.iterator);
        // NOTE: If the above line of code isn't working please uncomment the below line
        // and un comment getAllResults() function in this file

        // console.log(resultsIterator);
        
        let result = await this.getAllResults(resultsIterator.iterator);

        return JSON.stringify(result);
    }

    
    async getAllResults(iterator) {
        let allResult = [];

        for (
            let res = await iterator.next();
            !res.done;
            res = await iterator.next()
        ) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                    jsonRes.Key = res.value.key;
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                
                allResult.push(jsonRes);
            }
        }
        await iterator.close();
        return allResult;
    }
}

module.exports = OrderContract;

