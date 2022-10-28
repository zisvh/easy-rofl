const axios = require('axios');
const fs = require('fs');
var JSZip = require("jszip");
var FileSaver = require('file-saver');


// modify theses with your information
const email = "myemail";
const pass = "mypassword";
const gameID = 28562; // this is an example game ID, choose yours in your Bayes portal

// js function call to every other functions
const Bayes = async (req, res) =>
{
  try {
    const token = await get_token();
    get_rofl(token);
  }
  catch (err) {
    console.log(err);
  }
}

const get_rofl = async (token) => {
  const url = `https://lolesports-api.bayesesports.com/scrim/v1/games/${gameID}/downloadRiotReplay`;
  const headers = {"Authorization": `Bearer ${token}`};
  const game_url = await axios.get(url,
    {
      headers: headers
    }
    )
    .then((e) => {
      console.log(e.data.url);
      return e.data.url;
    })
    .catch((err) => console.log(err));
}

// js function to login to Bayes
const portal_login = async () =>
{
  const url = 'https://lolesports-api.bayesesports.com/auth/login';
  const headers = {"Content-Type": "application/json"};
  const creds = {'username': email, 'password': pass};
  const res = await axios.post(url, creds,
      {
          headers : headers
      })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    });
  if (res.data) {
      return res.data;
  }
}

// js function to check if token is fresh or if a new one is needed
const is_stored_token_fresh = async (stored_token) =>
{
    var expire_date = stored_token['expiresAt'];
    return Date.now() < expire_date;
}

// js function to store my Bayes token in a token.json file
const store_token = async (response_token, filename) =>
{
  const expire_date = Date.now() + response_token["expiresIn"];
  response_token["expiresAt"] = expire_date;
  const data = JSON.stringify(response_token);
  fs.writeFile('token.json', data, (err) => {
    if (err) {
        throw err;
    }
    console.log("JSON data is saved.");
});
}

// js function to get Bayes token from file
const get_token_from_file = async (filename) =>
{
  if (!fs.existsSync(filename))
      return undefined;
  const data = fs.readFileSync(filename, 'utf-8');
  const stored_token = JSON.parse(data);
  if (await is_stored_token_fresh(stored_token))
      return stored_token['accessToken'];
  else
      return undefined;
}


// js function to get my Bayes token
const get_token = async () =>
{
    var token = await get_token_from_file("token.json");
    console.log("starting get_token\n");
    if (token == undefined){
        var response_token = await portal_login();
        await store_token(response_token, "token.json");
        // console.log("token enregistré dans le fichier");
        token = response_token['accessToken'];
    }
    return token
}

Bayes();
module.exports = {Bayes};