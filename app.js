console.log("starting password manager");

let crypto = require('crypto-js');
let storage = require('node-persist');
storage.initSync();

let argv = require('yargs')
  .command('create', 'Creates a new account', function (yargs) {
      yargs.options({
        name: {
          demand: true,
          alias: 'n',
          description: 'Account name (e.g. Twitter, FB, etc',
          type: 'string'
        },
        username: {
          demand: true,
          alias: 'u',
          description: 'Account username or email',
          type: 'string'
        },
        password: {
          demand: true,
          alias: 'p',
          description: 'Account password',
          type: 'string'
        },
        masterPassword: {
          demand: true,
          alias: 'm',
          description: "Master password",
          type: 'string'
        }
      }).help('help');
  })
  .command('get', 'Gets an existing account', function(yargs){
      yargs.options({
        name: {
          demand: true,
          alias: 'n',
          description: 'Name of target account (e.g. Twitter, FB, etc.',
          type: 'string'
        },
        masterPassword: {
          demand: true,
          alias: 'm',
          description: "Master password",
          type: 'string'
        }
      }).help('help');
  })
  .help('help')
  .argv;

let command = argv._[0];

function getAccounts (masterPassword) {
  var encryptedAccts = storage.getItemSync('accounts'), //typeof accounts is Base64 string
      decryptedAccts = [];
  if(typeof encryptedAccts !== 'undefined') {
    var bytes = crypto.AES.decrypt(encryptedAccts, masterPassword); //typeof bytes hex string
    decryptedAccts = JSON.parse(bytes.toString(crypto.enc.Utf8)); //convert hex string to original obj data via parse
  }
  return decryptedAccts;
}

function saveAccounts(accounts, masterPassword) {
  let encryptNewAccts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword); //accts Base64 string
  //don't forget to turn new encrypted accts into string
  storage.setItemSync('accounts', encryptNewAccts.toString());
  return accounts;
}

function createAccount (account, masterPassword) {
  let decryptedAccts = getAccounts(masterPassword);
  decryptedAccts.push(account);
  saveAccounts(decryptedAccts, masterPassword);
  return account;
}

function getAccount (accountName, masterPassword) {
  let encryptedAccts = getAccounts(masterPassword),
      targetAcct;

  encryptedAccts.forEach(function(acct){
    if(acct['name'] === accountName) {
      targetAcct = acct;
    }
  });
  return targetAcct;
}

if(command === 'create') {
  try {
    let createdAccount = createAccount({
      name: argv.name,
      username: argv.username,
      password: argv.password
    }, argv.masterPassword);
    console.log('Account created, see below');
    console.log(createdAccount);
  } catch (error) {
    console.log("error occured when trying to create account");
  }
} else if (command === 'get') {
    try {
      let fetchedAccount = getAccount(argv.name, argv.masterPassword);

      if(typeof fetchedAccount === 'undefined') {
        console.log('Account not found');
      } else {
        console.log('Account found, see below');
        console.log(fetchedAccount);
      }
    } catch (error) {
    console.log("error occured when fetching account");
  }
}





