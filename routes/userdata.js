var express = require('express');
var router = express.Router();
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const ccpPath = path.resolve('/media/nazmus/Edu & Softs/4-2/Thesis/fabric-samples/first-network/connection-org2.json');

/* get userdata with the token */
router.post('/:id', async function(req, res, next) {
    try {
        // Create a new file system based wallet for managing identifirstties.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user2');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user2', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        //queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryCar', req.params.id);
        var obj = JSON.parse(result.toString());

        if (obj.data == 'yes') {
            if(Number(obj.maturity) < new Date().getTime()){
                await contract.submitTransaction('changeCarOwner', req.params.id, "no");
                return res.send({message: "Token expired!"});
            }else{
            const result1 = await contract.evaluateTransaction('queryCar', obj.key);
            return res.send(JSON.parse(result1.toString()));
            }
        } else {
            console.log(`Permission not granted for user ${obj.uid}`);
            return res.send({message: `Permission not granted for user ${obj.uid}`});
        }

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.send({message: `Failed to submit transaction: ${error}`});
    }
});

module.exports = router;
