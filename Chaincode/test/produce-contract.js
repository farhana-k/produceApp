/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { ProduceContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('ProduceContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new ProduceContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"produce 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"produce 1002 value"}'));
    });

    describe('#produceExists', () => {

        it('should return true for a produce', async () => {
            await contract.produceExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a produce that does not exist', async () => {
            await contract.produceExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createProduce', () => {

        it('should create a produce', async () => {
            await contract.createProduce(ctx, '1003', 'produce 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"produce 1003 value"}'));
        });

        it('should throw an error for a produce that already exists', async () => {
            await contract.createProduce(ctx, '1001', 'myvalue').should.be.rejectedWith(/The produce 1001 already exists/);
        });

    });

    describe('#readProduce', () => {

        it('should return a produce', async () => {
            await contract.readProduce(ctx, '1001').should.eventually.deep.equal({ value: 'produce 1001 value' });
        });

        it('should throw an error for a produce that does not exist', async () => {
            await contract.readProduce(ctx, '1003').should.be.rejectedWith(/The produce 1003 does not exist/);
        });

    });

    describe('#updateProduce', () => {

        it('should update a produce', async () => {
            await contract.updateProduce(ctx, '1001', 'produce 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"produce 1001 new value"}'));
        });

        it('should throw an error for a produce that does not exist', async () => {
            await contract.updateProduce(ctx, '1003', 'produce 1003 new value').should.be.rejectedWith(/The produce 1003 does not exist/);
        });

    });

    describe('#deleteProduce', () => {

        it('should delete a produce', async () => {
            await contract.deleteProduce(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a produce that does not exist', async () => {
            await contract.deleteProduce(ctx, '1003').should.be.rejectedWith(/The produce 1003 does not exist/);
        });

    });

});
