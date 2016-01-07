'use strict';
var stripe = require('stripe')('');
var Q = require('q');

/**
* @constructor
* @param {string} apiKey - stripe api key
*/
function Stripe(apiKey) {
    stripe.setApiKey(apiKey);
}

/*____________________________TRANSACTIONS____________________________*/

/**
* @method createTransaction
* Creating a transaction charge to be sent to stripe to be processed.
* @param {number} amount - required. a positive integer represented in cents (not dollars!). Minimum amount is $0.50.
* @param {string} currency - 3 letter ISO code for currency (e.g. 'usd'), defaults to 'usd'.
* @param {string} stripeToken - a payment source to be charged, customerId token
* @return promise
*/
Stripe.prototype.createTransaction = function(amount, stripeToken, currency) {
    var deferred = Q.defer();

    if (isNaN(amount)) {
        return Q.reject(new Error('amount is required and must be a number'));
    }
    if (!stripeToken) {
        return Q.reject(new Error('stripeToken required'));
    }

    var charge = {
        amount: amount,
        currency: currency || 'usd',
        customer: stripeToken
    };

    stripe.charges.create(charge, function(err, charge) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(charge);
    });

    return deferred.promise;
};

/**
* @method getTransaction
* retrieving a single transaction charge
* @param {string} chargeId - the identifier of the charge to be retrieved (i.e. the stripe identiification token).
* @return promise
*/
Stripe.prototype.getTransaction = function(chargeId) {
    var deferred = Q.defer();

    if (!chargeId) {
        return Q.reject(new Error('chargeId required'));
    }

    stripe.charges.retrieve(chargeId, function(err, charge) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(charge);
    });

    return deferred.promise;
};

/**
* @method listTransactions
* list all transactions associated with our account
* @param {number} limit - optional. a limit on the number of objects to be returned (1-100).
* @return promise
*/
Stripe.prototype.listTransactions = function(limit) {
    var deferred = Q.defer();

    var paginate = {
        limit: limit || 10
    };

    stripe.charges.list(paginate, function(err, charges) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(charges.data);
    });

    return deferred.promise;
};



/*____________________________USERS____________________________*/

/**
* @method createUser
* creates a stripe customer
* @param {string} email - required. User's email address.
* @param {object} metadata - required. User object
* @param {string or object} description - optional. An arbitrary string which you can attach to a customer object.
* @return promise
*/
Stripe.prototype.createUser = function(email, metadata, description) {
    var deferred = Q.defer();
    if (!email) {
        return Q.reject(new Error('email required'));
    }
    if (!metadata) {
        return Q.reject(new Error('metadata required'));
    }

    var customer = {
        email: email,
        metadata: metadata,
        description: description || ''

    };

    stripe.customers.create(customer, function(err, customer) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(customer);
    });

    return deferred.promise;
};

/**
* @method getUser
* retrieves a single stripe customer
* @param {string} userId - the identifier of the customer to be retrieved (i.e. the customer stripe token).
* @return promise
*/
Stripe.prototype.getUser = function(userId) {
    var deferred = Q.defer();

    if (!userId) {
        return Q.reject(new Error('userId required'));
    }

    stripe.customers.retrieve(userId, function(err, customer) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(customer);
    });

    return deferred.promise;
};

/**
* @method updateUser
* updates a stripe customer
* @param {string} userId - the identifier of the customer to be retrieved (i.e. the customer stripe token).
* @param {object} userObject - an object containing the same fields used to create the user. (e.g. {email: string, metadata: userObject, description: whatever})
* @return promise
*/
Stripe.prototype.updateUser = function(userId, userObject) {
    var deferred = Q.defer();
    if (!userId) {
        return Q.reject(new Error('userId required'));
    }
    if (!userObject) {
        return Q.reject(new Error('userObject required'));
    }


    stripe.customers.retrieve(userId, userObject, function(err, customer) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(customer);
    });

    return deferred.promise;
};

/**
* @method deleteUser
* sets delete to true for a stripe customer
* @param {string} userId - the identifier of the customer to be deleted (i.e. the customer stripe token).
* @return promise
*/
Stripe.prototype.deleteUser = function(userId) {
    var deferred = Q.defer();

    if (!userId) {
        return Q.reject(new Error('userId required'));
    }

    stripe.customers.del(userId, function(err, confirmation) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(confirmation);
    });

    return deferred.promise;
};

/**
* @method listUsers
* lists all stripe customers
* @param {number} limit - optional. a limit on the number of objects to be returned (1-100).
* @return promise
*/
Stripe.prototype.listUsers = function(limit) {
    var deferred = Q.defer();

    var paginate = {
        limit: limit || 10
    };

    stripe.customers.list(paginate, function(err, customers) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(customers.data);
    });

    return deferred.promise;
};



/*____________________________TOKENS____________________________*/

/**
* @method createToken
* creates a token to be used to charge a transaction with
* @param {string} cardNumber - required. the card number, as a string without any separators.
* @param {string} cvv - required. the card security code, as a string without any separators.
* @param {number} expirationMonth - required. Two digit number representing the card's expiration month.
* @param {number} expirationYear - required. Two or four digit number representing the card's expiration year.
* @return promise
*/
Stripe.prototype.createToken = function(cardNumber, cvv, expirationMonth, expirationYear) {
    var deferred = Q.defer();

    if (!cardNumber) {
        return Q.reject(new Error('cardNumber required'));
    }
    if (!cvv) {
        return Q.reject(new Error('cvv required'));
    }
    if (!expirationMonth) {
        return Q.reject(new Error('expirationMonth required'));
    }
    if (!expirationYear) {
        return Q.reject(new Error('expirationYear required'));
    }

    var cardObj = {
        card: {
            number: cardNumber,
            exp_month: expirationMonth,
            exp_year: expirationYear,
            cvc: cvv
        }
    };

    stripe.tokens.create(cardObj, function(err, token) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(token);
    });

    return deferred.promise;
};

/**
* @method getToken
* retrieves a single stripe token
* @param {string} tokenId - the id of the desired token to retrieve.
* @return promise
*/
Stripe.prototype.getToken = function(tokenId) {
    var deferred = Q.defer();

    if (!tokenId) {
        return Q.reject(new Error('tokenId required'));
    }

    stripe.tokens.retrieve(tokenId, function(err, token) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(token);
    });

    return deferred.promise;
};

/*____________________________ACCOUNT____________________________*/

/**
* @method createAccount
* create a stripe account
* @param {boolean} isManaged - whether or not the account is managed by our platform.
* @param {string} email - required if isManaged is false.
* @return promise
*/
Stripe.prototype.createAccount = function(isManaged, email) {
    var deferred = Q.defer();

    var account = {
        managed: isManaged,
        email: email
    };

    stripe.accounts.create(account, function(err, account) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(account);
    });

    return deferred.promise;
};



/*____________________________CARDS____________________________*/

/**
* @method createCard
* create a card associated with a customer
* @param {string} userId - required. the identifier of the customer the card will be associated with (i.e. the customer stripe token).
* @param {string} cardNumber - required. the card number, as a string without any separators.
* @param {number} expirationMonth - required. Two digit number representing the card's expiration month.
* @param {number} expirationYear - required. Two or four digit number representing the card's expiration year.
* @param {string} cvv - required. the card security code, as a string without any separators.
* @return promise
*/
Stripe.prototype.createCard = function(userId, cardNumber, expirationMonth, expirationYear, cvv) {
    var deferred = Q.defer();

    if (!userId) {
        return Q.reject(new Error('userId required'));
    }
    if (!cardNumber) {
        return Q.reject(new Error('cardNumber required'));
    }
    if (!expirationMonth) {
        return Q.reject(new Error('expirationMonth required'));
    }
    if (!expirationYear) {
        return Q.reject(new Error('expirationYear required'));
    }
    if (!cvv) {
        return Q.reject(new Error('cvv required'));
    }

    var cardDetails = {
        source: {
            object: 'card',
            exp_month: expirationMonth,
            exp_year: expirationYear,
            number: cardNumber,
            cvc: cvv
        }
    };

    stripe.customers.createSource(userId, cardDetails, function(err, card) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(card);
    });

    return deferred.promise;
};

/**
* @method getCard
* retrieve a single customer's stripe card
* @param {string} userId - required. the identifier of the customer (i.e. the customer stripe token).
* @param {string} cardId - required. the ID of the card to be retrieved (i.e. the card stripe token).
* @return promise
*/
Stripe.prototype.getCard = function(userId, cardId) {
    var deferred = Q.defer();

    if (!cardId) {
        return Q.reject(new Error('cardId required'));
    }
    if (!userId) {
        return Q.reject(new Error('userId required'));
    }

    stripe.customers.retrieveCard(userId, cardId, function(err, card) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(card);
    });

    return deferred.promise;
};

/**
* @method deleteCard
* sets delete to true for customers card
* @param {string} userId - required. the identifier of the customer (i.e. the customer stripe token).
* @param {string} cardId - required. the ID of the card to be deleted (i.e. the card stripe token).
* @return promise
*/
Stripe.prototype.deleteCard = function(userId, cardId) {
    var deferred = Q.defer();

    if (!cardId) {
        return Q.reject(new Error('cardId required'));
    }
    if (!userId) {
        return Q.reject(new Error('userId required'));
    }

    stripe.customers.deleteCard(userId, cardId, function(err, card) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(card);
    });

    return deferred.promise;
};

/**
@method listCards
* lists all cards for a customer
* @param {string} userId - the ID of the customer whose cards will be retrieved.
* @return promise
*/
Stripe.prototype.listCards = function(userId) {
    var deferred = Q.defer();

    if (!userId) {
        return Q.reject(new Error('userId required'));
    }

    stripe.customers.listCards(userId, function(err, cards) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(cards.data);
    });

    return deferred.promise;
};

module.exports = Stripe;
