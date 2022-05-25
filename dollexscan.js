//REQUIRE
const tmi = require('tmi.js');
const mysql = require('mysql');
const twitchAPI = require('node-twitch').default;

//paramètres
const parameters = {
  //IRC Server
  tmi: {
    username  : "", //you username, is ur connection ID ,not the username display in the chat (must be in full lowercase)
    oauth     : "", //available at https://id.twitch.tv/oauth2/authorize
    channel   : "marex"     //channel to connect to
  },
  //twitch API
  //u need to create a app on dev.twitch.tv
  twitchAPI: {
    client_id     : "",   //can be found in your twitch's dev console
    client_secret : ""
  },
  //DataBase
  sql: {
    host     : 'localhost',
    user     : 'root',
    database : 'dollexscan'
  }
}

//création des différents connexions
//twitchIRC
const irc = new tmi.Client({
  options: { debug: false },
  identity: {
    username: parameters.tmi.username,
    password: parameters.tmi.oauth
  },
  channels: [`${parameters.tmi.channel}`],
  connection: {
    reconnect: true
  }
});
//SQL
const database = mysql.createConnection({
  host     : parameters.sql.host,
  user     : parameters.sql.user,
  database : parameters.sql.database
});
//twitchAPI
const twitch = new twitchAPI({
  client_id: parameters.twitchAPI.client_id,
  client_secret: parameters.twitchAPI.client_secret
});
//établissement des connexions
irc.connect();
database.connect();

//variables utiles//
//cache des dernier utilisateur ayant envoyé un message
var userList = [];
//taille du cache
var userCache = 25;
//nombre de message envoyé depuis le démarage
var messageNumber = 0;
//si chaine est en live
var isOnline = false;
//id du stream
var StreamID;

//boucle si en live
isLive();
//boucle de lecture des messages
console.log("connecté !!");
irc.on('message', (channel, tags, message, self) => {
  if(self) return;
  //incrémente nombre de message seulement si en live
  if(isOnline == true){
    //ajouter message au compteur
    sendMessageToDatabase(tags.username);
  }
  //vérifie si dernier message provient de dollexbot
  if (tags.username === "dollexbot" && tags.mod === true) {
    //regarde dans le cache les derniers utilisateurs
    for (var i = 0; i < userList.length; i++) {
      var pointed = userList[(messageNumber-i-1)%userCache];
      //ne prend pas en compte streamelements
      if(userList[(messageNumber-i-1)%userCache] !== "streamelements"){
        pointedIndex = (messageNumber-1-1)%userCache;
        var type = sendDollexbotToDatabase(message,pointed);
        console.log(`pointed : ${pointed} est ${type}`);
        break;
      }
    }
  }
  messageNumber++;
  userList[(messageNumber-1)%userCache] = tags.username;
});

async function isLive(){
  var second = 0;
  while(1){
    var date = new Date();
  //vérifie tout les 5s si la chaine est en live
    if(date.getSeconds()%5 == 0 && second != date.getSeconds()){
      second = date.getSeconds();
      //demande à l'API les infos du stream
      const streams = await twitch.getStreams({ channel: `${parameters.tmi.channel}` });
      if(streams.data.length > 0 && isOnline == false){
        //appeller fonction ajouter stream dans BD
        console.log("Stream ON !");
        StreamID = streams.data[0].id;
        addStreamToDataBase(streams.data[0].title,streams.data[0].started_at);
        isOnline = true;
      }else if(streams.data.length = 0 && isOnline === true){
        //appeller fonction ajouter timestamp de fin de stream
        console.log("Stream OFF");
        setStreamEndTimeStamp();
        isOnline = false;
      }
    }
  }
}

function sendMessageToDatabase(viewer){
  var sql = mysql.format("CALL `update`(?,?)", [viewer,StreamID]);
  database.query(sql, function (error, results) {
    if (error) throw error;
  });
}

function sendDollexbotToDatabase(message,username){
  //obtenir type + valeur
  var pieces = message.split(' ');
  console.log(pieces);
  var type = pieces[1];
  switch(type){
    case "CEO":
    var valeur = parseInt(pieces[4],10);
    break;
    case "LOW":
    var valeur = Math.abs(parseInt(pieces[3],10));
    break;
    case "TO":
    var valeur = pieces[2].substring(0,(pieces[2].length)-3);
    break;
  }
  var sql = mysql.format("INSERT INTO dollexbot VALUES (?,CURRENT_TIME,?,?,?)", [StreamID,type,valeur,username]);
  console.log(sql);
  database.query(sql, function (error, results) {
    if (error) throw error;
  });
  return type;
}

function addStreamToDataBase(streamName,startTimeStamp){
  //change timestamp format
  startTimeStamp = startTimeStamp.replace("T"," ");
  startTimeStamp = startTimeStamp.replace("Z","");
  console.log(startTimeStamp);
  var sql = mysql.format("INSERT INTO streams VALUES (?,?,CURRENT_TIME,?)", [StreamID,startTimeStamp,streamName]);
  database.query(sql, function (error, results) {
    if (error) throw error;
  });
}

function setStreamEndTimeStamp(){
  var sql = mysql.format("UPDATE streams SET endTimeStamp = CURRENT_TIME WHERE id = ?", [StreamID]);
  database.query(sql, function (error, results) {
    if (error) throw error;
  });
}

