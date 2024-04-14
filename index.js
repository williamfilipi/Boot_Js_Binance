const WebSocket = require('ws')

const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`)

// RENTABILIDADE
const profitability = parseFloat(process.env.PROFITABILITY)
// PREÇO DE VENDA
let sellPrice = 0

ws.onmessage = (event) =>{
    // console.clear()
    const obj = JSON.parse(event.data)
    console.log("Symbol: " + obj.s);
    console.log("Best ask: " + obj.a);

    // Preço atual
    const currentPrice = parseFloat(obj.a)
        if (sellPrice === 0 && currentPrice < 67100){
            newOrder('0.00004', 'BUY')
            console.log('Bom para comprar');
            sellPrice = currentPrice * profitability
        }
        else if (sellPrice !== 0 && currentPrice > sellPrice) {
            newOrder('0.00004', 'SELL')
            console.log('Bom pra vender');
            sellPrice = 0
        }
        else 
            console.log('Esperando.. SellPrice' + sellPrice);
}
    
const axios = require('axios')
const crypto = require('crypto')

async function newOrder(quantity, side) {
    const data = {
        symbol: process.env.SYMBOL,
        type: 'MARKET',
        side,
        quantity,
    }

    const timestamp = Date.now()
    const recvWindow = 60000

    // criptografia
    const signature = 
        crypto.createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams({...data, timestamp, recvWindow})}`)
        .digest('hex') //transformando a criptografia em hexadecimal

        const newData = {...data, timestamp, recvWindow, signature}
        const qs = `?${new URLSearchParams(newData)}`

    try {
       const result = await axios({
            method: 'POST',
            url: `${process.env.API_URL}/v3/order${qs}`,
            headers: {'X-MBX-APIKEY': process.env.API_KEY}
        })
        console.log(result.data);
    } catch (error) {
        console.error(error)
    }
}