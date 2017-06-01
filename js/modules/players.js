app.register({
    players: {
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
        },

        __save: function(players) {
            localStorage.setItem('players', JSON.stringify(players));
        },

        __get: function() {
            var stored = localStorage.getItem('players');
            return (stored !== null ? JSON.parse(stored) : []);
        },
        ui: {
            initSortables: function() {
                $('.players-list').sortable({
                    handle: '.player-order',
                    axis: "y",
                    scroll: true,
                    items: '.player',
                    placeholder: 'player-moving',
                    forcePlaceholderSize: true
                });
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
            console.info(players);
            app.core.ctrl.go('home', {
                players: players
            }).then(function() {
                app.players.ui.initSortables();
                app.core.history.add(app.ctrl.states.home);
                app.featureDiscovery.showFeatureDiscovery();
            }, function() {
                alert('pas ok');
            });
        },

        showFormPlayer: function() {
            app.core.ctrl.render('formPlayer', {}, true).then(function() {

            });
        },

        addPlayer: function(data) {
            var players = app.players.__get();
            players.push(data);
            app.players.__save(players);
            app.ctrl.homeAction();
        },
    },
});