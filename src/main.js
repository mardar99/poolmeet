import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const MPContractAddress = "0xE3504C5b0ED9a00C853D7f1e3abF4108140C3f94"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let pools = []

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getPools = async function() {
  const _productsLength = await contract.methods.getPoolsLength().call()
  const _pools = []
  for (let i = 0; i < _productsLength; i++) {
    let _pool = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getPool(i).call()
      let r = await contract.methods.getRoute(i).call()
      resolve({
        index: i,
        creator: p[0],
        numOfPassengers: p[1],
        initNumOfPassengers: p[2],
        passengers: p[3],
        price: new BigNumber(p[4]),
        origin: r[0],
        destination: r[1],
        time: r[2],
        dates: r[3]
      })
    })
    _pools.push(_pool)
  }
  pools = await Promise.all(_pools)

  renderPools()
}

function renderPools() {
  document.getElementById("marketplace").innerHTML = ""
  pools.forEach((_pool) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = productTemplate(_pool)
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

function productTemplate(_pool) {
  const _tmp = _pool.passengers.includes(kit.defaultAccount) ? `<button type="button" class="btn btn-dark btn-sm viewPass" data-bs-toggle="modal" data-bs-target="#viewPass" id="${_pool.index}">View Passengers</button>` : `<button type="button" class="btn btn-outline-dark btn-sm joinPool" id="${_pool.index}">Join for ${_pool.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</button>`  
  const button = _pool.numOfPassengers > 0 || _pool.passengers.includes(kit.defaultAccount)  ? _tmp : `<button type="button" class="btn btn-outline-secondary btn-sm" disabled>Full</button>`
  return `
    <div class="card p-3 mb-2">
        <div class="mt-3">
            <h3 class="heading">${_pool.origin}<span style="font-size: medium; font-weight: 400; margin-left: 5px;">to</span></h3><h3>${_pool.destination}</h3>
            <p class="text-muted">${_pool.dates} - ${_pool.time}</p>
            <div class="mt-3">
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${(_pool.initNumOfPassengers - _pool.numOfPassengers) * 100 / _pool.initNumOfPassengers}%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="mt-3" style="display: flex; justify-content: space-between;"> <div class="mt-2"> <span class="text1">${_pool.numOfPassengers} spaces left <span class="text2">of ${_pool.initNumOfPassengers}</span></span></div> <div> ${button} </div></div>
            </div>
        </div>
    </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getPools()
  notificationOff()
});

document
  .querySelector("#newPoolBtn")
  .addEventListener("click", async (e) => {
    const datesList = document.getElementsByClassName("check");
    let dates = ""
    for (let i of datesList){
      dates += i.checked ? i.id +  ", " : "" 
    }
    dates = dates.slice(0, -2)

    const params = [
      document.getElementById("newOrigin").value,
      document.getElementById("newDestination").value,
      document.getElementById("newTime").value,
      dates,
      document.getElementById("newPassengerss").value,
      new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    notification(`⌛ Adding pool...`)
    try {
      const result = await contract.methods
        .createPool(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added the pool.`)
    getPools()
  })

document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if (e.target.className.includes("joinPool")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(pools[index].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for pool...`)
    try {
      const result = await contract.methods
        .joinPool(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully joined.`)
      getPools()
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
  if (e.target.className.includes("viewPass")){
    const index = e.target.id
    const passengers = pools[index].passengers;

    document.getElementById("passengersList").innerHTML = ""
    passengers.forEach((_passenger) => {
      const newDiv = document.createElement("div")
      newDiv.className = "col-md-4"
      newDiv.innerHTML = `${_passenger}`
      document.getElementById("passengersList").appendChild(newDiv)
    })
  }
})  