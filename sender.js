// ----------------------------------------------------------Dependencies----------------------------------------------------------------------------------- //
const Web3 = require("web3"); 
const con = require("./databse");
const {senderData , infuraLink} = require('./config');
const web3 = new Web3(new Web3.providers.HttpProvider(infuraLink))
// ----------------------------------------------------------Sender & receiver data----------------------------------------------------------------------------------- //

const senderAddress = senderData.senderAddress
const privateKey = senderData.privateKey
let recAddress = "0x0dc7f556d03882527dd92371c74b3739c5553ba2"

let status= " ";
let process = 0;

// -----------------------send ethereum function---------------------------------- //

async function sendEthereum(senderAdddress,privateKey, recAddress, amount){
    var nonce = await web3.eth.getTransactionCount(senderAddress) + 1;
    console.log(nonce);
        sign_transaction(senderAdddress,privateKey, recAddress, amount,nonce)
    };


// -----------------------signing ethereum function---------------------------------- //

async function sign_transaction(senderAddress ,privateKey, recAddress, amount,nonce){
    con.query("Select id,status from transaction order by id desc limit 1",async function(err,result){
        if(err){
            return err;
        }
        if(result.length<=0){
            let status = "pending";
            const createTransaction = await web3.eth.accounts.signTransaction(
                {
                   from: senderAddress,
                   to: recAddress,
                   value: web3.utils.toWei(amount.toString(), 'ether'),
                   gas: '21000',
                //    nonce: nonce
                },
                privateKey
             );
             status = "pending";
             console.log(createTransaction);
             con.query("Insert into transaction(id, from_add, to_add, amount, status, process, transaction_hash, raw_transaction, timestamp) values(?,?,?,?,?,?,?,?,?)",
                [nonce, senderAddress, recAddress, amount, status, process,createTransaction.transactionHash,createTransaction.rawTransaction,Math.floor(Date.now() / 1000)]);

        }
        else{
            if(result[0].status="pending"){
                nonce = result[0].id+1;
            }
            else{
                nonce = nonce +1;
            }
            const createTransaction = await web3.eth.accounts.signTransaction(
                {
                   from: senderAddress,
                   to: recAddress,
                   value: web3.utils.toWei(amount.toString(), 'ether'),
                   gas: '21000',
                //    nonce: nonce
                },
                privateKey
             );
             status = "pending";
             con.query("Insert into transaction(id, from_add, to_add, amount, status, process, transaction_hash, raw_transaction, timestamp) values(?,?,?,?,?,?,?,?,?)",
                [nonce, senderAddress, recAddress, amount, status, process,createTransaction.transactionHash,createTransaction.rawTransaction,Math.floor(Date.now() / 1000)]);
            console.log(createTransaction);
            return createTransaction;
        }
    });
}

// -----------------------broadcasting ethereum function---------------------------------- //

async function broadcast_transaction(){
    con.query("Update transaction set process = 1 where process = 0")
    con.query("Select * from transaction where status = 'pending' || status = 'failed'",async function(err, result){
        if(err){
            return err;
        }
        if(result.length<=0){
            return
        }
        else{
            console.log(result)
            for(let i=0;i<result.length;i++){
                let balance = await web3.eth.getBalance(senderAddress)
                balance_Wei = web3.utils.fromWei(balance.toString(),'ether');
                console.log(balance_Wei + " ETH");
                if(balance_Wei<result[i].amount){
                    console.log("insufficient balance");
                    con.query("Update transaction set timestamp = ? , status = 'Failed - Insufficient Balance' , process = 0 where id = ?"
                    ,[Math.floor(Date.now() / 1000),result[i].id]);
                    continue
                }
                let createReceipt
                try {
                    createReceipt = await web3.eth.sendSignedTransaction(result[i].raw_transaction)
                    console.log(createReceipt.transactionHash)
                    await con.query("Update transaction set timestamp = ? , status = 'successfull' , process = 2 where status = 'pending'",[Math.floor(Date.now() / 1000)]);
                    await console.log("Transaction Successfull with transaction_hash:"+result[i].transaction_hash)
                } catch (error) {
                    console.log(" " +  error)
                    con.query("Update transaction set timestamp = ? , status = 'failed' , process = 0 where id = ?"
                        ,[Math.floor(Date.now() / 1000),result[i].id]);
                 
                    continue
                }
            }
            
        }
    })
}




broadcast_transaction(senderAddress)
// sendEthereum(senderAddress,privateKey,recAddress,0)