'use strict';
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB;
var stripe = require('stripe')('sk_test_Noga6LDIMjQ2Ze2GGkhbusTL00TpryWaZD');

const getItem = async(event) => {
  const client = await MongoClient.connect(url, {useNewUrlParser:true, useUnifiedTopology:true});
    if(!client){
      return { statusCode: 400, body: JSON.stringify('No client foundx')};
    }
    let status;
    try{
        const db = client.db("sale-db");
        let collection = db.collection('items');
        const data = await collection.find({}).toArray();
        status = data;
    }catch(err){
        status = err;
    }finally{
        client.close();
        return { statusCode: 200, body: JSON.stringify(status)};
    }
}
const buyItem = async (event) => {

  const Body = JSON.parse(event.body);
  const args = {
      amount: parseInt(Body.itemPrice) * 100,
      currency: 'eur',
      source: 'tok_visa'
  }
  try{
    const stripeInfo = await stripe.charges.create(args);
    Body.stripeInfo = stripeInfo;
    Body.paymentStatus = 'success'
  }catch(err){
    return { statusCode: 500, body: JSON.stringify(err)};
  }
  const client = await MongoClient.connect(url, {useNewUrlParser:true, useUnifiedTopology:true});
    if(!client){
      return { statusCode: 404, body: JSON.stringify('client not found')};
    }
    let status;
    try{
        const db = client.db("sale-db");
        let collection = db.collection('sold-items');
        const data = await collection.insertOne(Body);
        status = data;
    }catch(err){
        status = err;
    }finally{
        client.close();
        return { statusCode: 200, body: JSON.stringify(status)};
    }
}

module.exports = {
  getItem,
  buyItem
}