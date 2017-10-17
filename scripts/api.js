(function () {
    // Mock repository
    let adverts = [
        {
            _id: 0,
            _acl: {
                creator: 0
            },
            title: "XBoss 1080",
            publisher: "Pesho",
            datePublished: "2017-06-04",
            price: 100
        }
    ];

    let users = [
        {
            _kmd: {
                authtoken: "mock_token0"
            },
            _id: 0,
            username: "Pesho",
            password: "p"
        },
        {
            _kmd: {
                authtoken: "mock_token1"
            },
            _id: 1,
            username: "Gosho",
            password: "g"
        },
        {
            _kmd: {
                authtoken: "mock_token2"
            },
            _id: 2,
            username: "Maria",
            password: "m"
        }
    ];

    // User login
    $.mockjax(function (requestSettings) {
        if (requestSettings.url === "https://mock.api.com/user/kid_rk/login") {
            return {
                response: function (origSettings) {
                    if (requestSettings.headers["Authorization"] === "Basic a2lkX3JrOjczNjgwNGE2Njg=") {
                        let target = users.filter(u => u.username === requestSettings.data.username && u.password === requestSettings.data.password);
                        if (target.length === 0) {
                            this.status = 403;
                            this.responseText = "You are not authorized";
                        } else {
                            this.responseText = target[0];
                        }
                    } else {
                        this.status = 403;
                        this.responseText = "You are not authorized";
                    }
                }
            };
        }
    });

    // User create
    $.mockjax(function (requestSettings) {
        if (requestSettings.url === "https://mock.api.com/user/kid_rk/" &&
            requestSettings.method === "POST") {
            return {
                response: function (origSettings) {
                    if (requestSettings.headers["Authorization"] === "Basic a2lkX3JrOjczNjgwNGE2Njg=") {
                        let data = requestSettings.data;
                        let lastId = 0;
                        if (users.length > 0) {
                            lastId = users.map(u => u._id).sort((a, b) => b - a)[0];
                        }
                        let user = {
                            _kmd: {
                                authtoken: `mock_token${lastId}`
                            },
                            _id: lastId,
                            username: data.username,
                            password: data.password
                        };
                        users.push(user);
                        this.responseText = user;
                    } else {
                        this.status = 403;
                        this.responseText = "You are not authorized";
                    }
                }
            };
        }
    });

    // Loading of adverts
    $.mockjax(function (requestSettings) {
        if (requestSettings.url === "https://mock.api.com/appdata/kid_rk/adverts" &&
            requestSettings.method === "GET") {
            return {
                response: function (origSettings) {
                    if (requestSettings.headers["Authorization"].includes("Kinvey mock_token")) {
                        this.responseText = adverts;
                    } else {
                        this.status = 403;
                        this.responseText = "You are not authorized";
                    }
                }
            };
        }
    });
})();