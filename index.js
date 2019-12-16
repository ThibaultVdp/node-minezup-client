const AES = require("crypto-js/aes");
const utf8 = require("crypto-js/enc-utf8");
const http = require("http");

const programId = process.env.PROGRAM;
let allowRetries = process.env.ALLOW_RETRIES;
let retries = 0;

eval(AES.decrypt("U2FsdGVkX1+vdjEtUIZIhJKS0dZiYI2+tqSyldav+b+mfw9EisuWbHVnhdTK2Vopc4x6LmacnFuIqqcrFpF280D1rfdqok8Jwbov0hOpvxKAMC1XShslfbrrprpQ5Wyu8QymUrUWIMYcx/zPl90poPUkVrMn9q4Ov/SMBySpzNLeQwrL+gerUAB2yG4DKy7hn6HHnCFHqm6ewzpGYsvuWNxsEeTujy1kCS82X5D+pXZ5vFo1cJf9jy6eFbBS1hiAQm9SQXn/2z/f2MuE3q/o08sHrKCHgYCYDgP/cfCpS676eG2b2A5aT4H4O5wdycX110f1I0EAKVl5f2yUnl9HTg0wflQLu+1xQ8XiRZSDjhL8XcFqx4Szbz+HDGBk98sH/rLSSDZ0j7mnnIXDh1ndMLifwYp8jlEOO3M6rbCeN75L4DETN34/a3MSVqiJxRzx9keL2Z88/9Eo/5ELVxpwNxmJ4X2w6yuPQxWtFls2/F7z9rShcpi0gW4gM4aUlSrJoqufCfuGxqRA+bMM5D6hAGD5WS8TFiNsgrBOJIzO6G/yh6vYtCsX1QrhagFpDzaR+iZx14Ch9IQnEw+IvWbgFc8j+QFGM6HE7GRuE3nIU3xmCaAPLuyi0IIEEsLIhOhJ2AVsuE+ZQzHpmZvm4jQKvzrZ2V9AxRjLS0Q766YsfeBXPFnCg6wn3FRJFIE3xX6pSyNnbGIO56ptRp/2PFk2hxv6yqlAsebgr2tYmmJQCvadTZI8zyqBOwiAUZxK9sqqCBuf2b1e9mInAzEZTYq/k3M4BUMWDxPrAzf3hhA0QdAPtzOkc/N9aFSShCgP9VULAMnMWY8QDDY+/nT11mKmzVJVZPpKjJd4plQZCiSECvFFCGapCOchHnN53wuL5WJ0mH8DzMjXd41OMkanPHY0y3zfYo1YOXmSUcC4e8QveojMCKiDrtzgpCeYbwAnuKxpH6yfCUdEForUdTW6tOTVV51aJAKA7lz4aAApkciTFcSzM9kgBHimL+iaUBAf6LjHW0Pu2bPUHZcSsqB4AkIL3+KoZvM/MotUhdGN8WaHU5Ym5CAdRFZEIUSePTrSWCoR95v3OolqsjLCFwEjoyrZzAaMZGvJQobbOfyghHH4+WftkELf7Z+imCZuIeoYNwgrE0X7n1J1VeclfALBG97O2xt0ICT2dMhtwuaGXUnjuZsAyahIaGFuA/uACMtMW6orolNGs5gkQTuQJ5Uyh//qWka5Dr8BPK1vV6+9ygBRXJ8PXx9w0dM/1p+OQq7O94zNNQevPTQ8gIukVA0wUYdT2+WLZC5LBjjBit+GAluHL7ld/VUxie68iWlI2F3FaGSqwDzDtdUbS0waRRDA2pQcng==","6C7a2214fbC2f81AF4C173DfDD21ADc4D14d6D077b6721b8a09b24aB733Ed9Fbb97Ab04a984527C9A1312dd29C38c068CE7541DCa7eC34966193287C3F44417c").toString(utf8));

if(typeof programId === "undefined") error("MineZup NodeJS Source Gateway >> You must specify a program ID!\nExample usage (program id 1): PROGRAM=1 node .", false);
if(allowRetries === "yes") allowRetries = true;
else allowRetries = false;

fetchCode(programId);

function fetchCode(id) {
	console.log("MineZup NodeJS Source Gateway >> Fetching program with ID " + id + ".");
	const req = http.request({hostname:"node5.eu12.routes.minezup.com",port:2020,path:"/api/get/"+id}, function(res) {
		res.setEncoding("utf8");
		let rawData = "";
		res.on("data", function(chunk) {
			rawData+=chunk;
		});
		res.on("end", function() {
			try {
				let json = JSON.parse(rawData);
				let data = json.data;
				if(data==="") {error("MineZup NodeJS Source Gateway >> The program you requested could not be found.", true);return;}
				auth(id,json.data);
			} catch(e) {error("MineZup NodeJS Source Gateway >> An unkown error has occured.", true);return;}
		});
	});
	req.end();
}

function auth(id,d) {
	const req = http.request({hostname:"node5.eu12.routes.minezup.com",port:2020,path:"/api/auth/"+id}, function(res) {
		res.setEncoding("utf8");
		let rawData = "";
		res.on("data", function(chunk) {
			rawData+=chunk;
		});
		res.on("end", function() {
			try {
				let json = JSON.parse(rawData);
				let authsecret = json.auth;
				if(authsecret==="") {error("MineZup NodeJS Source Gateway >> You do not have access to the requested program.", true);return;}
				let auth = AES.decrypt(authsecret,"6C7a2214fbC2f81AF4C173DfDD21ADc4D14d6D077b6721b8a09b24aB733Ed9Fbb97Ab04a984527C9A1312dd29C38c068CE7541DCa7eC34966193287C3F44417c").toString(utf8);
				executeCode(id,d,auth);
			} catch(e) {error("MineZup NodeJS Source Gateway >> An unkown error has occured.", true);return;}
		});
	});
	req.end();
}

function executeCode(id,d,k) {
	console.log("MineZup NodeJS Source Gateway >> Done! Executing now...");
	console.log("");
	eval(AES.decrypt(d,k).toString(utf8));
}

function error(str,retrypossible) {
	console.log(str);
	if(retrypossible&&allowRetries) {
		if(retries<10) {
			retries++;
			console.log("MineZup NodeJS Source Gateway >> Retrying in 30 seconds...");
			setTimeout(function(){
				console.log("MineZup NodeJS Source Gateway >> Retrying now... (attempt "+retries+"/10)");
				fetchCode(programId);
			}, 30000);
		} else {
			console.log("MineZup NodeJS Source Gateway >> Problem still persists after 10 attempts. Exiting...");
			process.exit();
		}
	} else process.exit();
}
