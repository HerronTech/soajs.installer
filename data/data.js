/***************************************************************
*
* DASHBOARD CORE_PROVISION
*
***************************************************************/
var provDb = db.getSiblingDB(this.dbPrefix + 'core_provision');
provDb.dropDatabase();

/*
 DASHBOARD EXT KEYS
 */
var files = listFiles('./extKeys');
files.forEach(function(oneFile){
	load(oneFile.name);
});
var records = extKeys;
provDb.dashboard_extKeys.insert(records);

/*
 Environments
 */
files = listFiles('./environments');
files.forEach(function(oneFile){
	load(oneFile.name);
});
records =[];
records.push(dashboard);
provDb.environment.insert(records);

/*
 Products
 */
files = listFiles('./products');
files.forEach(function(oneFile){
	load(oneFile.name);
});
records = [];
records.push(dsbrdProduct);
provDb.products.insert(records);

/*
 Tenants
 */
files = listFiles('./tenants');
files.forEach(function(oneFile){
	load(oneFile.name);
});
records = [];
records.push(dsbrd);
provDb.tenants.insert(records);

/*
 Git Accounts
 */
files = listFiles('./gitAccounts');
files.forEach(function(oneFile){
	load(oneFile.name);
});
records = [];
records.push(soajs_account);
provDb.git_accounts.insert(records);


/***************************************************************
 *
 * DASHBOARD URAC
 *
 ***************************************************************/
var ddb = db.getSiblingDB(this.dbPrefix + 'DBTN_urac');
ddb.dropDatabase();

/*
 Users
 */
files = listFiles('./urac/users');
files.forEach(function(oneFile){
	load(oneFile.name);
});
records = [];
records.push(owner);
ddb.users.insert(records);

/*
 Groups
 */
files = listFiles('./urac/groups');
files.forEach(function(oneFile){
	load(oneFile.name);
});
records = [];
records.push(owner);
ddb.groups.insert(records);

//users
ddb.users.ensureIndex({username: 1}, { unique: true });
ddb.users.ensureIndex({email: 1}, { unique: true });
ddb.users.ensureIndex({username: 1, status: 1});
ddb.users.ensureIndex({email: 1, status: 1});
ddb.users.ensureIndex({groups: 1, 'tenant.id': 1});
ddb.users.ensureIndex({username: 1, 'tenant.id': 1});
ddb.users.ensureIndex({status: 1});
ddb.users.ensureIndex({locked: 1});
ddb.users.ensureIndex({'tenant.id': 1});

//groups
ddb.groups.ensureIndex({code: 1, 'tenant.id': 1});
ddb.groups.ensureIndex({code: 1});
ddb.groups.ensureIndex({'tenant.id': 1});
ddb.groups.ensureIndex({locked: 1});

//tokens
ddb.tokens.ensureIndex({token: 1}, { unique: true});
ddb.tokens.ensureIndex({userId: 1, service: 1, status: 1});
ddb.tokens.ensureIndex({token: 1, service: 1, status: 1});