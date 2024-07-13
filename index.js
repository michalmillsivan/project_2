const mainContent = document.querySelector("#mainContent"); //the main content div
const API_URL = "https://api.coingecko.com/api/v3/coins/list";
const API_URL_ID = "https://api.coingecko.com/api/v3/coins";
const CACHE_DURATION = 2 * 60 * 1000;
const SELECTED_COINS_KEY = 'selectedCoins';

//const selectedCoins = []
let selectedCoins = JSON.parse(localStorage.getItem(SELECTED_COINS_KEY)) || [];


//creating loader:
const loader = document.createElement("div");
loader.classList.add("spinner-border", "text-primary", "loader");
loader.setAttribute("role", "status");
loader.innerHTML = '<span class="sr-only">Loading...</span>';

//init function:
function init() {
    document.querySelector("#home").addEventListener("click", () => {
        drawHome();
    });
}

async function drawHome() {
    mainContent.innerHTML = ""; //clearing the main content div
    mainContent.append(loader); //appending the loader
    showLoader(loader);
    try {
        drawCoins(coinArray); //drawing the coins, with a function.
        // const result = await getCoinsApi()
        // console.log(result)
        // drawCoins(result)
        hideLoader(loader); //hide loader
    } catch (error) {
        console.error('Error fetching coins:', error); //making sure that i will know what the error is.
    }
}

//loader functions:
function showLoader(loader) {
    loader.style.display = "block";
}
function hideLoader(loader) {
    loader.style.display = "none";
}

//the coins cards:
function drawCoins(coins) {
    const coinsContainer = document.createElement("div"); //creating a container
    mainContent.classList.remove("parallax"); //removing the picture cause its ugly :)
    mainContent.append(coinsContainer); //pushing the container
    coinsContainer.innerHTML = ""; //making sure the container is clean
    coinsContainer.classList.add("coin_cont"); //adding flex
    if (!Array.isArray(coins)) return; //caution
    const coinCards = coins.map(_createCoinCard); //building the cards

    //cards structure:
    function _createCoinCard(coin) {
        const cardCol = document.createElement("div");
        cardCol.classList.add("col-md-4");

        const cardContent = document.createElement("div");
        cardContent.classList.add("card", "flex");

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const toggleDiv = document.createElement("div");
        toggleDiv.classList.add("toggle")

        const cardTitle = document.createElement("h5"); //header
        cardTitle.classList.add("card-title");
        cardTitle.innerText = coin?.symbol;

        const cardText = document.createElement("p"); //content
        cardText.classList.add("card-text");
        cardText.innerText = coin?.name;

        const cardBtn = document.createElement("button"); //more information button
        cardBtn.classList.add("btn", "btn-primary");
        cardBtn.setAttribute("data-toggle", "collapse");
        cardBtn.setAttribute("href", `#coin_${coin.id}`);
        cardBtn.setAttribute("role", "button");
        cardBtn.setAttribute("aria-expanded", "false");
        cardBtn.innerHTML = "More Info";

        const toggleBtn = document.createElement("button")
        toggleBtn.classList.add("btn", "btn-secondary")
        toggleBtn.innerHTML = "Select"
        toggleBtn.setAttribute("data-coin-id", coin.id)
        toggleBtn.addEventListener("click", () => handleToggleCoin(coin, toggleBtn))

        if (selectedCoins.find(selectedCoin => selectedCoin.id === coin.id)) {
            toggleBtn.innerHTML = "Selected";
        } else {
            toggleBtn.innerHTML = "Select";
        }

        //more information event:
        const additionalInfo = document.createElement("div");
        additionalInfo.setAttribute("id", `coin_${coin.id}`);
        additionalInfo.classList.add("additional-info", "collapse");

        const coinImg = document.createElement("div"); //more info - image
        coinImg.classList.add("coin_image");

        const coinPrice = document.createElement("div"); //more info - price
        additionalInfo.append(loader);

        cardBtn.addEventListener("click", async () => {
            showLoader(loader);
            try {
                const coinData = await getCachedCoinData(coin.id); //see if there are cache coins in ls
                coinImg.innerHTML = ''; //clean
                coinPrice.innerHTML = ''; //clean
                if (coinData.image && coinData.image.small) { //adding image to more info section
                    const coinImage = document.createElement("img");
                    coinImage.src = coinData.image.small;
                    coinImg.appendChild(coinImage);
                }
                if (coinData.market_data && coinData.market_data.current_price) { //adding price to more info section
                    const priceUSD = document.createElement("p");
                    priceUSD.innerText = `Price (USD): ${coinData.market_data.current_price.usd}`;
                    coinPrice.appendChild(priceUSD);
                    const priceEUR = document.createElement("p");
                    priceEUR.innerText = `Price (EUR): ${coinData.market_data.current_price.eur}`;
                    coinPrice.appendChild(priceEUR);
                    const priceILS = document.createElement("p");
                    priceILS.innerText = `Price (ILS): ${coinData.market_data.current_price.ils}`;
                    coinPrice.appendChild(priceILS);
                }
                const expanded = cardBtn.getAttribute("aria-expanded") === "true"; //more info is open
                cardBtn.setAttribute("aria-expanded", String(!expanded));
                additionalInfo.classList.toggle("show");
            } catch (error) {
                console.error("Error fetching coin data:", error);
            } finally {
                hideLoader(loader);
            }
        });

        cardBody.append(cardTitle, cardText, cardBtn);
        toggleDiv.append(toggleBtn);
        additionalInfo.append(coinImg, coinPrice);
        cardContent.append(cardBody, additionalInfo, toggleDiv);
        cardCol.append(cardContent);

        return cardCol;
    }
    coinsContainer.append(...coinCards);
}

//import from ls:
function getCachedCoinData(id) {
    const cacheKey = `coin_${id}`; //creating a uniqe key
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (now - parsedData.timestamp < CACHE_DURATION) {
            return Promise.resolve(parsedData.data);
        }
    }
    return fetchCoinData(id);
}

//adding to ls:
async function fetchCoinData(id) {
    const coinData = await getCoinsApi(id); //fetching the coins
    const cacheKey = `coin_${id}`; //giving each coin a key
    const cacheValue = { //giving it a time stamp so i can make sure it is retrieved after 2 minutes
        data: coinData,
        timestamp: new Date().getTime()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheValue)); //adding to ls
    return coinData;
}

async function getCoinsApi(id) {
    try {
        const response = await fetch(id ? API_URL_ID + "/" + id : API_URL, { method: "GET" }); //if there is id bring specific coin, else bring all
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const coins = await response.json(); //translating data to json
        return coins;
    } catch (error) {
        console.error('Error fetching API:', error);
        throw error;
    }
}

//selected coins:
function handleToggleCoin(coin, toggleBtn) {
    const isSelected = selectedCoins.find(selectedCoin => selectedCoin.id === coin.id)

    if (isSelected) {
        selectedCoins.splice(selectedCoins.indexOf(isSelected), 1)
        toggleBtn.innerHTML = "Select"
    } else {
        if (selectedCoins.length < 5) {
            selectedCoins.push(coin)
            toggleBtn.innerHTML = "Selected"
        } else {
            showReplacementModal(coin, toggleBtn)
        }
    }
    console.log(selectedCoins)
    localStorage.setItem(SELECTED_COINS_KEY, JSON.stringify(selectedCoins))
}

function showReplacementModal(newCoin, newToggleBtn) {
    const modal = document.createElement("div");
    modal.classList.add("modal", "fade");
    modal.setAttribute("tabindex", "-1");
    modal.setAttribute("role", "dialog");
    modal.innerHTML = `
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Select a coin to replace</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="closeButton">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <ul class="list-group">
                        ${selectedCoins.map(coin => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${coin.name}
                                <button class="btn btn-danger btn-sm" data-coin-id="${coin.id}">Replace</button>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    modal.querySelectorAll('[data-coin-id]').forEach(button => {
        button.addEventListener('click', (event) => {
            const coinId = event.target.getAttribute('data-coin-id');
            const coinToReplace = selectedCoins.find(coin => coin.id === coinId);
            selectedCoins.splice(selectedCoins.indexOf(coinToReplace), 1);
            selectedCoins.push(newCoin);

            const replacedToggleBtn = document.querySelector(`[data-coin-id="${coinId}"]`);
            if (replacedToggleBtn) {
                replacedToggleBtn.innerHTML = "Select";
            }

            newToggleBtn.innerHTML = "Selected";

            $(modal).modal('hide');

            $(modal).on('hidden.bs.modal', function () {
                document.body.removeChild(modal);
            });
        });
    });

    modal.querySelector("#closeButton").addEventListener("click", () => {
        $(modal).modal('hide');

        $(modal).on('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    })

    document.body.appendChild(modal);
    $(modal).modal('show');
}

const coinArray = [
    { "id": "dogecoin", "symbol": "doge", "name": "Dogecoin" },
    { "id": "litecoin", "symbol": "ltc", "name": "Litecoin" },
    { "id": "bitcoin", "symbol": "btc", "name": "Bitcoin" },
    { "id": "peercoin", "symbol": "ppc", "name": "Peercoin" },
    { "id": "auroracoin", "symbol": "aur", "name": "Auroracoin" },
    { "id": "intergalactic", "symbol": "🐒", "name": "INTERGALACTIC" },
    { "id": "nxt", "symbol": "nxt", "name": "NXT" },
    { "id": "counterparty", "symbol": "xcp", "name": "Counterparty" },
    { "id": "omni", "symbol": "omni", "name": "Omni" },
    { "id": "namecoin", "symbol": "nmc", "name": "Namecoin" }
];

init()