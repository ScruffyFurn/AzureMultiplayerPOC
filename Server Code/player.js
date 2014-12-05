/**************************************************
** PLAYER SERVER **
This holds all the logic for the player on the server side.

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

var Player = function () {
    var x,
        y,
        id,
        input;
    
    var getX = function () {
        return x;
    };
    
    var getY = function () {
        return y;
    };
    
    var setX = function (newX) {
        x = newX;
    };
    
    var setY = function (newY) {
        y = newY;
    };
    
    var getInput = function () {
        return input;
    }
    
    var setInput = function (i) {
        input = i;
    }
    
    return {
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        id: id,
        getInput : getInput,
        setInput : setInput
    }
};

exports.Player = Player;