/**************************************************
** GAME SERVER **
This holds all the logic for the game server.
To run: Type the follow in a cmd window with Admin privs
    node server.js  

Copyright (c) 2014, Mickey "ScruffyFurn" MacDonald
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**************************************************/


/**************************************************
** Requirements
**************************************************/
var util = require("util"),
   // io = require("socket.io"),
    express = require('express'),
    Player = require("./player").Player;
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;


/**************************************************
** Variables
**************************************************/
var players;

/**************************************************
** Init function
**************************************************/
function init() {
    players = [];
    
    //Set our Socket.io server to listen on port 8000
    //socket = io.listen(80);
    //Set the event handlers
    setEventHandlers();

};

server.listen(port, function () {
    console.log('Updated : Server listening at port %d', port);
});

/**************************************************
** Set event handlers function
**************************************************/
var setEventHandlers = function () {
    io.sockets.on("connection", onSocketConnection);
    //io.sockets.on("new player", onNewPlayer);
};

/**************************************************
** On socket connection function
**************************************************/
function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
};

/**************************************************
** On client disconnect function
**************************************************/
function onClientDisconnect() {
    util.log("Player has disconnected: " + this.id);
    
    // Find the selected player to remove
    var removePlayer = playerById(this.id);
    
    // Return not found message of player is not in array
    if (!removePlayer) {
        util.log("Player not found: " + this.id);
        return;
    }    ;
    
    //Remove the selected player from the array
    players.splice(players.indexOf(removePlayer), 1);
    
    //Tell other players to remove the selected player
    this.broadcast.emit("remove player", { id: this.id });
};

/**************************************************
** On new player function
**************************************************/
function onNewPlayer(data) {
    /*This creates a new player instance using 
    position data sent by the connected client. 
    The identification number is stored for future 
    reference.*/
    var newPlayer = new Player();
    newPlayer.id = this.id;
    newPlayer.setX(data.x);
    newPlayer.setY(data.y);
    
    util.log("Data X: " + data.x + " Data Y: " + data.y);
    
    //Tell the other players about this new player
    this.broadcast.emit("new player",
                        {
        id: newPlayer.id,
        x: newPlayer.getX(),
        y: newPlayer.getY()
    });
    //Get the other players information for this new player
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        util.log("Existing player: " + i + " ID " + existingPlayer.id + " X " + existingPlayer.getX() + " Y " + existingPlayer.getY());
        
        
        this.emit("new player",
               {
            id: existingPlayer.id,
            x: existingPlayer.getX(),
            y: existingPlayer.getY()
        });
    }    ;
    
    //Add this new player to the players array
    players.push(newPlayer);

    //util.log("New Player ID: " + newPlayer.id + " New player x: " + newPlayer.getX() + " y: " + newPlayer.getY() + " players length " + players.length);
    
};

/**************************************************
** On move player function
**************************************************/
function onMovePlayer(data) {
    //Select player to move
    var movePlayer = playerById(this.id);
    
    
    
    //Display message if id is not found in array
    if (!movePlayer) {
        util.log("Player not found: " + this.id);
        return;
    }    ;
    //Set the players input 
    movePlayer.setInput(data.input);
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    
    //util.log("ID: " + data.id +" Moved X: " +  data.x + " Moved Y: " + data.y);
    
    
    //Tell the other players about the movement
    this.broadcast.emit("move player",
    {
        id: movePlayer.id,
        input : movePlayer.getInput()
    });

};

/**************************************************
** Player find helper function
**************************************************/
function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    }    ;
    
    return false;
}

//Run init function to start the ball rolling
init();