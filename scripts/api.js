(function () {
    // Mock repository
    let adverts = [
        {
            _id: 0,
            _acl: {
                creator: 0
            },
            title: "XBoss 1080",
            description: "Modded gaming console",
            publisher: "Pesho",
            datePublished: "2017-06-04",
            price: 100,
            image: "./static/fuze-f1.png"
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

    // Get user info
    $.mockjax(function (requestSettings) {
        if (requestSettings.url.match(/https:\/\/mock\.api\.com\/user\/kid_rk\/(.+)/)) {
            let userId = requestSettings.url.match(/https:\/\/mock\.api\.com\/user\/kid_rk\/(.+)/)[1];
            return {
                response: function (origSettings) {
                    if (requestSettings.headers["Authorization"].includes("Kinvey mock_token")) {
                        let target = users.filter(u => u._id === Number(userId));
                        this.responseText = target.shift();
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

    // Create advert
    $.mockjax(function (requestSettings) {
        if (requestSettings.url === "https://mock.api.com/appdata/kid_rk/adverts" &&
            requestSettings.method === "POST") {
            return {
                response: function (origSettings) {
                    if (requestSettings.headers["Authorization"].includes("Kinvey mock_token")) {
                        let data = requestSettings.data;
                        let lastId = 0;
                        if (adverts.length > 0) {
                            lastId = adverts.map(a => a._id).sort((a, b) => b - a)[0];
                        }
                        let token = requestSettings.headers["Authorization"].replace("Kinvey ", "");
                        let creator = users.filter(u => u._kmd.authtoken === token)[0]._id;
                        let advert = {
                            _id: ++lastId,
                            _acl: {
                                creator: creator
                            },
                            title: data.title,
                            description: data.description,
                            publisher: data.publisher,
                            datePublished: data.datePublished,
                            price: data.price
                        };
                        adverts.push(advert);
                        this.responseText = advert;
                    } else {
                        this.status = 403;
                        this.responseText = "You are not authorized";
                    }
                }
            };
        }
    });

    // Delete advert
    $.mockjax(function (requestSettings) {
        if (requestSettings.url.match(/https:\/\/mock\.api\.com\/appdata\/kid_rk\/adverts\/(.+)/) &&
            requestSettings.method === "DELETE") {
            let advertId = Number(requestSettings.url.match(/https:\/\/mock\.api\.com\/appdata\/kid_rk\/adverts\/(.+)/)[1]);
            return {
                response: function (origSettings) {
                    if (requestSettings.headers["Authorization"].includes("Kinvey mock_token")) {
                        adverts = adverts.filter(a => a._id !== advertId);
                        this.responseText = adverts;
                    } else {
                        this.status = 403;
                        this.responseText = "You are not authorized";
                    }
                }
            };
        }
    });

    // Load single advert
    $.mockjax(function (requestSettings) {
        if (requestSettings.url.match(/https:\/\/mock\.api\.com\/appdata\/kid_rk\/adverts\/(.+)/) &&
            requestSettings.method === "GET") {
            let advertId = Number(requestSettings.url.match(/https:\/\/mock\.api\.com\/appdata\/kid_rk\/adverts\/(.+)/)[1]);
            return {
                response: function (origSettings) {
                    if (requestSettings.headers["Authorization"].includes("Kinvey mock_token")) {
                        let advert = adverts.filter(a => a._id === advertId);
                        this.responseText = advert.shift();
                    } else {
                        this.status = 403;
                        this.responseText = "You are not authorized";
                    }
                }
            };
        }
    });

    // Edit advert
    $.mockjax(function (requestSettings) {
        if (requestSettings.url.match(/https:\/\/mock\.api\.com\/appdata\/kid_rk\/adverts\/(.+)/) &&
            requestSettings.method === "PUT") {
            let advertId = Number(requestSettings.url.match(/https:\/\/mock\.api\.com\/appdata\/kid_rk\/adverts\/(.+)/)[1]);
            return {
                response: function (origSettings) {
                    if (requestSettings.headers["Authorization"].includes("Kinvey mock_token")) {
                        let advert = adverts.filter(a => a._id === advertId);
                        let data = requestSettings.data;
                        if (advert.length > 0) {
                            advert = advert[0];
                            advert.title = data.title;
                            advert.description = data.description;
                            advert.publisher = data.publisher;
                            advert.datePublished = data.datePublished;
                            advert.price = data.price;
							advert.image = data.image;
                            this.responseText = advert;
                        }
                        this.responseText = {};
                    } else {
                        this.status = 403;
                        this.responseText = "You are not authorized";
                    }
                }
            };
        }
    });
})();