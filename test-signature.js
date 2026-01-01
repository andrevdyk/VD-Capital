// Save this as test-signature.js and run: node test-signature.js
// This uses PayFast's OFFICIAL signature generation method

const crypto = require('crypto');

// PayFast's official signature generation function
const generateSignature = (data, passPhrase = null) => {
  // Create parameter string
  let pfOutput = "";
  for (let key in data) {
    if(data.hasOwnProperty(key)){
      if (data[key] !== "") {
        pfOutput +=`${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  if (passPhrase !== null) {
    getString +=`&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
}; 

// Your actual values
const params = {
  merchant_id: '10042975',
  merchant_key: 'l0c0zcoj2h13o',
  return_url: 'https://0d069999052c.ngrok-free.app/billing?success=true',
  cancel_url: 'https://0d069999052c.ngrok-free.app/billing?cancelled=true',
  notify_url: 'https://0d069999052c.ngrok-free.app/api/payfast/notify',
  amount: '25.00',
  item_name: 'Monthly Subscription',
  custom_str1: 'c8e7a246-3ed4-4506-bf46-5d9dc9a61885',
  subscription_type: '1',
  frequency: '3',
  cycles: '0',
};

const passphrase = 'SomethingNew';

console.log('Testing PayFast Signature (OFFICIAL METHOD)');
console.log('============================================\n');

// Generate signature using PayFast's official method
const signature = generateSignature(params, passphrase);

console.log('✅ Generated signature:', signature);
console.log('');

// Build the string that was signed (for debugging)
let pfOutput = "";
for (let key in params) {
  if(params.hasOwnProperty(key)){
    if (params[key] !== "") {
      pfOutput +=`${key}=${encodeURIComponent(params[key].trim()).replace(/%20/g, "+")}&`
    }
  }
}
let getString = pfOutput.slice(0, -1);
if (passphrase !== null) {
  getString +=`&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
}

console.log('String that was signed:');
console.log(getString);
console.log('');

// Build final URL
const queryString = Object.keys(params)
  .map(key => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
  .join('&');

const finalUrl = `https://sandbox.payfast.co.za/eng/process?${queryString}&signature=${signature}`;

console.log('Final URL:');
console.log(finalUrl);
console.log('');

console.log('============================================');
console.log('✅ This should now work with PayFast!');