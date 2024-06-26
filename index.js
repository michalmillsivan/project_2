const mainContent = document.querySelector("#main-content")
const API_URL = "https://api.coingecko.com/api/v3/coins/list"

function init() {

    document.querySelector("#about").addEventListener("click", () => {
        drawAbout()
    })
    document.querySelector("#home").addEventListener("click", () => {
        drawHome()
    })
    document.querySelector("#reports").addEventListener("click", () => {
        drawReports()
    })

}

async function initCoins() {
    // try {
    //     const result = await getCoinsApi();
    //     console.log(result)
    //     drawCoins(result)
    // } catch (error) {
    //     console.error('Error fetching coins:', error);
    // }
    try {

        drawCoins(coinArray)
    } catch (error) {
        console.error('Error fetching coins:', error);
    }
}

function drawAbout() {
    // DO A LOT OF THINGS!
    mainContent.innerHTML = ""
    const header = document.createElement("h1")
    header.innerText = "About Me"
    mainContent.append(header)
}
function drawHome() {
    // DO A LOT OF THINGS!
    mainContent.innerHTML = ""
    const header = document.createElement("h1")
    header.innerText = "Home"
    mainContent.append(header)
}
function drawReports() {
    // DO A LOT OF THINGS!
    mainContent.innerHTML = ""
    const header = document.createElement("h1")
    header.innerText = "Reports"
    mainContent.append(header)
}

function drawCoins(coins) {
    const coinsContainer = document.querySelector("#coinsContainer")
    coinsContainer.innerHTML = ""
    if (!Array.isArray(coins)) return;

    const coinCards = coins.map(_createCoinCard)
    function _createCoinCard(coin) {
        const cardCol = document.createElement("div")
        cardCol.classList.add("col-md-4")

        const cardContent = document.createElement("div")
        cardContent.classList.add("card")

        const cardBody = document.createElement("div")
        cardBody.classList.add("card-body")

        const cardTitle = document.createElement("h5")
        cardTitle.classList.add("card-title")
        cardTitle.innerText = coin?.symbol;

        const cardText = document.createElement("p")
        cardText.classList.add("card-text")
        cardText.innerText = coin?.name;

        const cardBtn = document.createElement("a")
        // cardBtn.classList.add("btn btn-primary")
        // cardBody.href = "#XXXXXX"
        cardBtn.innerHTML = "More Info"

        cardBody.append(cardTitle, cardText, cardBtn)
        cardContent.append(cardBody)
        cardCol.append(cardContent)

        return cardCol;
    }
    coinsContainer.append(...coinCards)

}

async function getCoinsApi() {
    try {
        const response = await fetch(API_URL, {method: "GET"})
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const coins = await response.json();
        console.log(coins)
        return coins;
    } catch (error) {
        console.error('Error fetching API:', error);
        throw error;
    }
}

const coinArray = [
    {"id":"dogecoin","symbol":"doge","name":"Dogecoin"},
    {"id":"litecoin","symbol":"ltc","name":"Litecoin"},
    {"id": "bitcoin","symbol": "btc","name": "Bitcoin"},
    {"id":"peercoin","symbol":"ppc","name":"Peercoin"},
    {"id":"auroracoin","symbol":"aur","name":"Auroracoin"},
    {"id":"intergalactic","symbol":"🐒","name":"INTERGALACTIC"},
    {"id":"nxt","symbol":"nxt","name":"NXT"},
    {"id":"counterparty","symbol":"xcp","name":"Counterparty"},
    {"id":"omni","symbol":"omni","name":"Omni"},
    {"id":"namecoin","symbol":"nmc","name":"Namecoin"}   
]

init()
initCoins()