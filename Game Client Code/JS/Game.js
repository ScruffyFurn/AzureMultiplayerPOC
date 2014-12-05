/**************************************************
** Main Game Class **
This is the main class that will hold all of our game logic.

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

//Init EnchantJS
enchant();

//We use the Window on load event to setup our game
//This is our "entry point"
window.onload = function () {

    var stage;
    //Create our game and pass in the window bounds
    var game = new Game(window.screen.height, window.screen.width);



    //Setup and preload our sprite sheet
    game.spriteSheetWidth = 256;
    game.spriteSheetHeight = 16;
    game.preload(['sprites.png']);

    //Set our frame rate to 15 frames per second
    game.fps = 15;
    //Set the width and height for each individual sprite in our sprite sheet
    game.spriteWidth = 16;
    game.spriteHeight = 16;
    //Set the our games scale to 1
    game.scale = 1.0;


    // Initialise the socket connection to the server
    var socket = io.connect('http://twitchdemobackupserver.azurewebsites.net:80');
    game.socket = socket;
    //Create our player
    var localplayer = new Player(game);

    // Initialise the remote players array
    var remotePlayers = [];

    //*****************************SOCKET EVENTS SETUP
    // Start listening for events
    // Socket events
    game.socket.on("connect", onSocketConnected);
    game.socket.on("disconnect", onSocketDisconnect);
    game.socket.on("new player", onNewPlayer);
    game.socket.on("move player", onMovePlayer);
    game.socket.on("remove player", onRemovePlayer);
    //***********************************************

    //Our function to setup and add items to our stage
    var setStage = function () {
        stage = new Group();
        stage.addChild(localplayer.object); //add the player
        game.rootScene.addChild(stage); //add the stage to the scene
    };

    game.onload = function () {
        //Setup the player
        localplayer.setPlayer();


        //Setup our Stage
        setStage();

        //Our Player Update
        localplayer.object.on('enterframe', function () {
            localplayer.update(true);
        });


    };




    //**************************
    //SOCKET EVENT HANDLERS
    //**************************

    // Socket connect to the server
    function onSocketConnected() {
        //Display socket connected message in console
        console.log("Connected to socket server");

        //Tell the server to create a new player
        game.socket.emit("new player",
                    {
                        x: localplayer.getX(),
                        y: localplayer.getY()
                    });
    };

    // Socket disconnect from the server
    function onSocketDisconnect() {
        console.log("Disconnected from socket server");
    };

    // New Player
    function onNewPlayer(data) {
        //Display new player message in console
        console.log("New player connected: " + data.id);

        /*Create a new player with placement information
        from the server. Then set the id of the new player
        and add it to the remote players array*/
        var newPlayer = new Player(game);
        newPlayer.id = data.id;

        //Initialize the new player
        newPlayer.setPlayer();

        //Set the x,y of the player
        newPlayer.setX(data.x);
        newPlayer.setY(data.y);

        //Set up the players update function
        newPlayer.object.on('enterframe', function () {
            newPlayer.update(false);
        });

        //Add him to the stage and the remotePlayers array
        stage.addChild(newPlayer.object);
        remotePlayers.push(newPlayer);
    };

    // Player moves
    function onMovePlayer(data) {
        //Select the player to move
        var movePlayer = playerById(data.id);

        //Display console message if the id is not in the array
        if (!movePlayer) {
            console.log("Player not found: " + data.id);
            return;
        };

        //We set the movePlayer's input
        //Remember, movePlayer is an object within the remotePlayer array
        //The input value that we are passing is a replacement for listening for key input
        movePlayer.setInput(data.input);

    };

    // Remove a Player
    function onRemovePlayer(data) {
        //Find the selected player to remove
        var removePlayer = playerById(data.id);

        //Display a console message if the id is not in array
        if (!removePlayer) {
            console.log("Player not found: " + data.id);
            return;
        };
        //Remove player from stage
        stage.removeChild(removePlayer.object);

        //Remove the selected player from the remote player array
        remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);

    };
    //********************************************************************************

    /**************************************************
    ** Player find helper function
    **************************************************/
    function playerById(id) {
        var i;
        for (i = 0; i < remotePlayers.length; i++) {
            if (remotePlayers[i].id == id)
                return remotePlayers[i];
        };

        return false;
    };

    //Unleash the hounds!(start the game)
    game.start();
};
