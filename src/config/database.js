import firebird from "node-firebird";

const dbOptions = {
    host: 'localhost',
    port: 3050,
    // database: 'D:\\luizdev\\node\\node-firebird\\src\\db\\BANCO.DB',    
    database: 'd:/Marchand/database/SERRANEW.GDB',
    user: 'SYSDBA',
    password: 'sgdbkey',
    lowercase_keys: true, // set to true to lowercase keys
    role: null,            // default    
    pageSize: 4096,        // default when creating database
    encoding: "UTF8"
};

function fbQuery(ssql, params, callback){

    firebird.attach(dbOptions, function(err, db) {
            
        if (err) {
            console.log(1, err.message)
            return callback(err, []); 
        } 

        db.query(ssql, params, function(err, result) {
            
            db.detach();

            if (err) {
                console.log(2, err.message)
                return callback(err, []);
            } else {
                return callback(undefined, result);
            }
        });

    });
}

function fbExecute(ssql, params, callback){

    firebird.attach(dbOptions, function(err, db) {
            
        if (err) {
            console.log(1, err.message)
            return callback(err, []); 
        } 

        db.execute(ssql, params, function(err, result) {
            
            db.detach();

            if (err) {
                console.log(2, err.message)
                return callback(err, []);
            } else {
                return callback(undefined, result);
            }
        });

    });
}

async function fbQueryTrx(transaction, ssql, parameters){

    return new Promise(function (resolve, reject) {
        transaction.query(ssql, parameters, function(err, result){
            if (err) {
                console.log(3, err.message)
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

export { firebird, fbQuery, fbExecute, fbQueryTrx, dbOptions };