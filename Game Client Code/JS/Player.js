/**************************************************
** GAME PLAYER CLASS **
This is the local player class that will hold all of our player objects logic.

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
var Player = function (game) {

    var id;


    /*************************************************
	 ** Input 
     Used for non-local players
     Is a replacement for listening for game.input
	 *************************************************/
    var INPUT_TYPES = { NONE: 0, UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4 }
    var input = 0;

    //Create a new sprite named player
    var player = new Sprite(game.spriteWidth, game.spriteHeight);

    //Our player setup function. This gets called once when the player is created
    var setPlayer = function () {
        player.spriteOffset = 5; //Select the sprite from our sheet for the first frame
        player.startingX = 6; //Our starting point X
        player.startingY = 14; //Our starting point Y
        player.x = player.startingX * game.spriteWidth; //Calculate our position on the X plane
        player.y = player.startingY * game.spriteHeight; //Calculate our position on the Y plane
        player.direction = 0; //Set our initial direction
        player.walk = 0; //Set our walk to 0
        player.frame = player.spriteOffset + player.direction; //Set the first frame of our animation
        player.image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight); //Create a new surface for our player sprite
        player.image.draw(game.assets['sprites.png']); //Draw the selected player sprite 
    };

    //This is our player movement function. It handles input and updates the sprites position 
    var move = function () {
        //Get the current frame
        player.frame = player.spriteOffset + player.direction * 2 + player.walk;

        //Our movement checks
        if (player.isMoving) { //if the player is moving...
            player.moveBy(player.xMovement, player.yMovement);
            if (!(game.frame % 2)) {
                player.walk++;
                player.walk %= 2;
            }
            if ((player.xMovement && player.x % 16 === 0) || (player.yMovement && player.y % 16 === 0)) {
                player.isMoving = false;
                player.walk = 1;
            }
        } else { //if the player is NOT moving ...
            player.xMovement = 0;
            player.yMovement = 0;
            //Check for input
            //For local stuff we just care about game.input.whatever
            //Once we get/or don't get that input, depending on if there is any
            //We also set the input variable, this tells the server what button we pressed
            //That way we can properly be updated on each client
            if (game.input.up) {
                input = INPUT_TYPES.UP;
                player.direction = 1;
                player.yMovement = -4;
            } else if (game.input.right) {
                input = INPUT_TYPES.RIGHT;
                player.direction = 2;
                player.xMovement = 4;
            } else if (game.input.left) {
                input = INPUT_TYPES.LEFT;
                player.direction = 3;
                player.xMovement = -4;
            } else if (game.input.down) {
                input = INPUT_TYPES.DOWN;
                player.direction = 0;
                player.yMovement = 4;
            }
            else {
                //We set the input to none because we are not moving
                //We then tell the server that we are not moving, this is to stop the remote players from walking forever and ever
                input = INPUT_TYPES.NONE;
                player.isMoving = false;
                game.socket.emit("move player", { id: id, input: input, x: player.x, y: player.y });
            }
            if (player.xMovement || player.yMovement) {
                var x = player.x + (player.xMovement ? player.xMovement / Math.abs(player.xMovement) * 16 : 0);
                var y = player.y + (player.yMovement ? player.yMovement / Math.abs(player.yMovement) * 16 : 0);
                if (0 <= x && x < window.screen.width && 0 <= y && y < window.screen.height) { //Bounds checking
                    player.isMoving = true;
                    game.socket.emit("move player", { id: id, input: input, x: player.x, y: player.y });
                    move();
                }
            }
        }
    };

    var serverPlayerUpdate = function () {
        //Get the current frame
        player.frame = player.spriteOffset + player.direction * 2 + player.walk;

        //If input is none we just axe the movement by setting player.isMoving to false
        if (input == INPUT_TYPES.NONE)
            player.isMoving = false;

        if (player.isMoving) {
            player.moveBy(player.xMovement, player.yMovement);
            if (!(game.frame % 2)) {
                player.walk++;
                player.walk %= 2;
            }
            if ((player.xMovement && player.x % 16 === 0) || (player.yMovement && player.y % 16 === 0)) {
                player.isMoving = false;
                player.walk = 1;
            }
        }
        else {
            //Player is not moving
            player.xMovement = 0;
            player.yMovement = 0;
            switch (input) {
                case INPUT_TYPES.UP:
                    player.direction = 1;
                    player.yMovement = -4;
                    break;
                case INPUT_TYPES.RIGHT:
                    player.direction = 2;
                    player.xMovement = 4;
                    break;
                case INPUT_TYPES.LEFT:
                    player.direction = 3;
                    player.xMovement = -4;
                    break;
                case INPUT_TYPES.DOWN:
                    player.direction = 0;
                    player.yMovement = 4;
                    break;
                case INPUT_TYPES.NONE:
                    player.isMoving = false;
                    player.xMovement = 0;
                    player.yMovement = 0;
                    break;
            }

            if (player.xMovement || player.yMovement) {
                var x = player.x + (player.xMovement ? player.xMovement / Math.abs(player.xMovement) * 16 : 0);
                var y = player.y + (player.yMovement ? player.yMovement / Math.abs(player.yMovement) * 16 : 0);
                if (0 <= x && x < window.screen.width && 0 <= y && y < window.screen.height) { //Bounds checking
                    player.isMoving = true;
                    //Unlike our normal update we don't need to emit here
                }
            }
        }

    }

    //Our cool little update function that determines how we update
    //If its local, we just call move
    //Otherwise we call the serverPlayerUpdate, see above
    var update = function (isLocal) {
        if (isLocal)
            move();
        else
            serverPlayerUpdate();
    }

    //Movement getter and setters
    var getX = function () {
        return player.x;
    };

    var getY = function () {
        return player.y;
    };

    var setX = function (newX) {
        player.x = newX;
    };

    var setY = function (newY) {
        player.y = newY;
    };

    var getInput = function () {
        return input;
    }

    var setInput = function (i) {
        input = i;
    }

    return {
        setPlayer: setPlayer,
        object: player,//Returns player as object (Saves confusion) 
        update: update,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        id: id,
        getInput: getInput,
        setInput: setInput
    }
}