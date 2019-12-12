var express = require('express');
var router = express.Router();
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const ccpPath = path.resolve('/media/nazmus/Edu & Softs/4-2/Thesis/fabric-samples/first-network/connection-org1.json');

/* revoke permission of the token */
router.post('/:id', async function (req, res) {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        // Submit the specified transaction.
        await contract.submitTransaction('changeCarOwner', req.params.id, "no");
        console.log('Transaction has been submitted');
        // Disconnect from the gateway.
        await gateway.disconnect();
        return res.send({message: "Permission Revoked"});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return res.send({message: `Failed to submit transaction: ${error}`});
    }  
});

/* extend maturity time of the token */
router.post('/extend/:id', async function(req, res){
    try {
        var maturity, query, oldmaturity;
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        // Submit the specified transaction.
        const result = await contract.evaluateTransaction('queryCar', req.params.id);
        query = JSON.parse(result.toString());
        oldmaturity=Number(query.maturity);
        if(oldmaturity < new Date().getTime()){
            // Disconnect from the gateway.
            await gateway.disconnect();
            return res.send({message: "token already expired"})
        }else{
            maturity=oldmaturity + 60*1000*Number(req.body.limit);
            maturity=maturity.toString();
            await contract.submitTransaction('extendLimit', req.params.id, maturity);
            console.log('Transaction has been submitted');
            // Disconnect from the gateway.
            await gateway.disconnect();
            return res.send({message: "Token extended"});
        }
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return res.send({message: `Failed to submit transaction: ${error}`});
    }
});

module.exports = router;
