Demo: https://mardar99.github.io/poolmeet/

poolmeet is a network where users can create "pools", which are reservations to share a vehicle for transportation, in this way, if someone has a route, which makes some days, or all, and does it at a certain time, you can create a pool, allowing others to join for the registered price, also, there is only a limited number of seats, and each time a passenger joins, this number is decreased.

To create a pool, the user must provide all the information requested, such as the point of origin, destination, departure time and days, so that other users will know if they share this route and would like to join the pool.

If any pool is full, no external user can join, and once joined the pool, you will be able to see the addresses of the other participating passengers.

# Solidity

createPool: Imtroducing the parameters of origin, destination, time, dates, initial number of passengers and a price, it adds the pool to the pools map.

getPool: Returns the basic data of a pool, like the creator address, the total number of passengers, the passengers addresses list, and the pool join price by his index.

getPoolsLength: Returns the length od pools.

getRoute: Returns the data od a route, like the origin, destination, time, and dates by his index.

joinPool: Adds the passenger to the passenger list, and transacts the money from the passenger account to the creator of the pool by the index of the pool.

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
