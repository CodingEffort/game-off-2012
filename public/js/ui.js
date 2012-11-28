/**
 * ui.js
 * Jesse Emond
 * 13/11/2012

  In-game UI is handled in this file.

  Functions you might be looking for right now:
  - showClientMessage inside the UI component
 **/

// Handles the UI logic behind showing a message to the client such as the creation of a new dimension or the death
// of a certain enemy.
Crafty.c("UI", {
	_clientMessages: null,

	init: function() {
		_clientMessages = [];

        this.CASH_FONT_SIZE = 16;
        this.CASH_FONT_PATH = "assets/FontCash.png";
        var ui = this;
        Crafty.load([ui.CASH_FONT_PATH], function() {
            ui.cash = Crafty.e("2D, Canvas, SpriteText")
                .registerFont("CashFont", ui.CASH_FONT_SIZE, ui.CASH_FONT_PATH);

            ui.setCashAmount(0);
        });
	},

	setCashAmount: function(amount) {
        var txt = Math.floor(amount) + "$";
        var OFFSET = 16;
		this.cash.text(txt)
            .attr({w: txt.length * this.CASH_FONT_SIZE, h: this.CASH_FONT_SIZE})
            .attr({x: SCREEN_W - this.cash.w - OFFSET, y: SCREEN_H - this.cash.h - OFFSET});
		return this;
	},

	showClientMessage: function(message) {
		var MAX_MESSAGES = 5;
		var msg = Crafty.e("ClientMessage").setMessage(message);
		msg.bind("Remove", this.removeClientMessage);
		var startY = SCREEN_H-50;
		msg.attr({x: 25, y: startY});

		if (_clientMessages.length >= MAX_MESSAGES) // too many messages?
		{
			// remove the older ones while making space for the next one
			var toRemoveMax = MAX_MESSAGES - _clientMessages.length;
			for (i = 0; i <= toRemoveMax; ++i)
			{
				_clientMessages[i].destroy();
			}
		}

		_clientMessages.push(msg);

		var i;
		var y = startY;
		for (i = _clientMessages.length - 1; i >= 0; --i)
		{
			_clientMessages[i].y = y;
			y -= 10;
		}
	},
	removeClientMessage: function() {
		_clientMessages.shift();
	}
});

// Represents a message to show to the player.
Crafty.c("ClientMessage", {
	init: function() {
		this.requires("FadeIn, FadeOut");
		this.message = this.requires("2D, Canvas, Text")
			.attr({z:10000, w: 500})
            .textColor('#0094FF')
			.fadeIn(0.15);

		this.timeout(function () {
			this.fadeOut(0.05);
		}, 3000);
	},
	setMessage: function(msg) {
		this.message.text(msg);
		return this;
	}
});