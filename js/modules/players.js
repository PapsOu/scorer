app.register({
    players: {

        currentPlayer: null,

        registerTemplates: function() {
            app.core.ui.addTemplate('content', 'home', '../views/home.html');
            app.core.ui.addTemplate('app', 'scoreButtons', '../views/blocks/scoreButtons.html');
            app.core.ui.addTemplate('content', 'formPlayer', '../views/forms/player.html');
            app.core.ui.addTemplate('app', 'player-actions', '../views/blocks/player-actions.html');
        },

        initEvents: function() {
            var players = app.players.__get();
            if (players === null)
                app.players.__save([]);

            Handlebars.registerHelper('substr', function(string, start, length) {
                return string.substring(start, length);
            });

            Handlebars.registerHelper('substrUcfirst', function(string, start, length) {
                return app.core.utils.ucfirst(string.substring(start, length));
            });

            Handlebars.registerHelper('json', function(object) {
                return JSON.stringify(object);
            });

            $(document)

                .on('mousedown', '.players-list .player', function() {
                    var item = $(this);
                    var player = JSON.parse(item.attr('data-player'));

                    if ($(this).hasClass('selected')) {
                        $('.players-list .player').removeClass('selected');
                        app.players.currentPlayer = null;
                        $('.scoreButtons').removeClass('active');
                    } else {
                        $('.players-list .player').removeClass('selected');
                        item.addClass('selected');
                        app.players.currentPlayer = player;
                        $('.scoreButtons').addClass('active');
                    }
                })

                .on('mousedown', '.players-list .player .player-icon', function(e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                    var item = $(this).parent();

                    var player = JSON.parse(item.attr('data-player'));
                    app.baseUi.openModal('player-actions', {
                        player: player
                    });
                })

                .on('mousedown', '.colorBoxContainer .colorBox', function() {
                    var container = $(this).closest('.colorBoxContainer');
                    container.find('.colorBox').removeClass('selected');

                    var cls = $(this).attr('class').replace('colorBox ', '');

                    $(this).addClass('selected');

                    $('#color').val(cls);
                })

                .on('mousedown', '.signChanger', function() {
                    var input = $(this).parent().find('input');
                    var val = parseInt(input.val(), 10);
                    if (val != 0)
                        input.val(-1 * val);
                })

                .on('mousedown', '.scoreButtons .btn[data-number]', function() {
                    var input = $(this).closest('.scoreButtons').find('.currentNumber');
                    var currentVal = parseInt(input.text(), 10);
                    var val = parseInt($(this).attr('data-number'), 10);
                    currentVal += val;
                    input.text(currentVal);
                    input.attr('data-positive', (currentVal > 0 ? true : (currentVal == 0 ? null : false)));
                })

                .on('mousedown', '.scoreButtons .btn.validate', function(e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();

                    var newScore = $(this).closest('.scoreButtons').find('.currentNumber').text();
                    app.players.currentPlayer.score = parseInt(app.players.currentPlayer.score, 10) + parseInt(newScore, 10);
                    var oldPlayer = app.players.currentPlayer;

                    var players = $('.players-list .player');
                    var next = players.filter('.selected').next('li');

                    if (next.hasClass('addNewPlayer')) {
                        next = $('.players-list .player').first();
                    }

                    app.players.currentPlayer = JSON.parse(next.attr('data-player'));

                    app.ctrl.editPlayer(oldPlayer);
                });
        },

        initPlugins: function() {

        },

        __save: function(players) {
            localStorage.setItem('players', JSON.stringify(players));
        },

        __get: function() {
            var stored = localStorage.getItem('players');
            var players = (stored !== null ? JSON.parse(stored) : []);
            players.sort(function(a, b) {
                if (a.order < b.order) {
                    return -1;
                } else if (a.order > b.order) {
                    return 1;
                } else {
                    return 0;
                }
            })
            return players;
        },

        ui: {
            initSortables: function() {

                if ($('.players-list .player:not(.addNewPlayer)').length > 1) {
                    $('.players-list').sortable({
                        handle: '.player-order',
                        axis: "y",
                        scroll: true,
                        items: '.player:not(.addNewPlayer)',
                        placeholder: 'player-moving',
                        forcePlaceholderSize: true,
                        stop: function(event, ui) {
                            var players = app.players.__get();
                            $.each($('.players-list .player:not(.addNewPlayer)'), function(i, elem) {
                                var player = JSON.parse($(elem).attr('data-player'));
                                $.each(players, function(j, p) {
                                    if (player.id === p.id)
                                        players[j].order = i + 1;
                                });
                            });
                            app.players.__save(players);
                        }
                    });
                }
            }
        }
    },

    ctrl: {

        states: {

            formPlayer: {
                path: "/newPlayer",
                title: "Nouveau joueur"
            }
        },

        homeAction: function() {
            var players = app.players.__get();
            app.core.ctrl.go('home', {
                players: players
            }).then(function() {
                app.players.ui.initSortables();
                app.core.history.add(app.ctrl.states.home);
                if (app.players.currentPlayer !== null)
                    $('.players-list .player[data-player-id="' + app.players.currentPlayer.id + '"]').trigger('click');
            });
        },

        showFormPlayer: function(player) {
            if (!isDefined(player))
                player = {
                    player: {
                        id: null,
                        name: null,
                        score: 0,
                        color: null
                    }
                };
            else
                player = {
                    player: player
                };

            app.core.ctrl.render('formPlayer', player, true).then(function() {
                $('#name').focus();
                $('.colorBoxContainer').randomize('.colorBox');
                if (player.player.id === null) {
                    setTimeout(function() {
                        $('.colorBoxContainer .colorBox').first().trigger('click');
                    }, 200);
                } else {
                    app.baseUi.closeModal();
                    setTimeout(function() {
                        $('.colorBoxContainer .colorBox.' + player.player.color).trigger('click');
                    }, 200);
                }
            });
        },

        addOrEditPlayer: function(data) {
            if (data.id !== null && data.id !== "") {
                app.ctrl.editPlayer(data);
            } else {
                app.ctrl.addPlayer(data);
            }
        },

        addPlayer: function(data) {
            var players = app.players.__get();

            if (data.score === "")
                data.score = 0;

            data.name = app.core.utils.ucfirst(data.name);

            data.order = players.length + 1;

            data.id = moment().format('x');

            players.push(data);
            app.players.__save(players);
            app.ctrl.homeAction();
        },

        editPlayer: function(data) {
            var players = app.players.__get();

            $.each(players, function(i, player) {
                if (player.id === data.id) {
                    data.name = app.core.utils.ucfirst(data.name);
                    $.extend(true, players[i], data);
                }
            });

            app.players.__save(players);
            app.ctrl.homeAction();
        },

        deletePlayer: function(id) {
            if (confirm("Supprimer le joueur ?")) {
                var players = app.players.__get();

                $.each(players, function(i, player) {
                    if (player.id == id) {
                        players.splice(i, 1);
                    }
                });

                app.players.__save(players);
            }
            app.baseUi.closeModal();
            app.ctrl.homeAction();
        },

        updateSettings: function(data) {
            if (data.clearAllplayers === true) {
                app.players.__save([]);
            }

            if (data.clearScores === true) {
                var players = app.players.__get();
                $.each(players,function(i,player) {
                    players[i].score = 0;
                });
                app.players.__save(players);
            }
            app.core.ui.toast("Paramètres enregistrés", "success");
            app.ctrl.homeAction();
        }
    },
});

$.fn.randomize = function(selector) {
    var elems = selector ? $(this).find(selector) : $(this).children(),
        parents = elems.parent();

    parents.each(function() {
        $(this).children(selector).sort(function() {
            return Math.round(Math.random()) - 0.5;
        }).detach().appendTo(this);
    });

    return this;
};