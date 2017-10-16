function startApp() {
    showHideMenuLinks();
    showHomeView();

    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListAds").click(listAdverts);
    $("#linkLogout").click(logoutUser);

    // Bind the form submit buttons
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);

    const kinveyBaseUrl = "https://mock.api.com/";
    const kinveyAppKey = "kid_rk";
    const kinveyAppSecret = "736804a668";

    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();
    }

    function showHideMenuLinks() {
        $("#linkHome").show();
        if (sessionStorage.getItem('authToken') === null) {
            // No logged in user
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListAds").hide();
            $("#linkLogout").hide();
        } else {
            // We have logged in user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListAds").show();
            $("#linkLogout").show();
        }
    }

    function showHomeView() {
        showView('viewHome');
    }

    function showLoginView() {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }

    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }

    // user/login
    function loginUser() {
        const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/login";
        const kinveyAuthHeaders = {
            'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
        };
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };

        $.ajax({
            method: "POST",
            url: kinveyLoginUrl,
            headers: kinveyAuthHeaders,
            data: userData,
            success: loginSuccess
        });

        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listAdverts();
        }
    }

    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
    }

    // user/register
    function registerUser() {
        const kinveyRegisterUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
        const kinveyAuthHeaders = {
            'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
        };

        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };

        $.ajax({
            method: "POST",
            url: kinveyRegisterUrl,
            headers: kinveyAuthHeaders,
            data: userData,
            success: registerSuccess
        });

        function registerSuccess(userInfo) {
            console.log(userInfo);
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listAdverts();
        }
    }

    // user/logout
    function logoutUser() {
        sessionStorage.clear();
        $('#loggedInUser').text("");
        showHideMenuLinks();
        showHomeView();
    }

    // advertisement/all
    function listAdverts() {
        $('#ads').empty();
        showView('viewAds');

        const kinveyAdvertsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adverts";
        const kinveyAuthHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };
        $.ajax({
            method: "GET",
            url: kinveyAdvertsUrl,
            headers: kinveyAuthHeaders,
            success: loadAdvertsSuccess
        });

        function loadAdvertsSuccess(adverts) {
            if (adverts.length === 0) {
                $('#ads').text('No advertisements available.');
            } else {
                let advertsTable = $('<table>')
                    .append($('<tr>').append(
                        '<th>Title</th>',
                        '<th>Publisher</th>',
                        '<th>Date Published</th>',
                        '<th>Price</th>')
                    );

                for (let advert of adverts) {
                    advertsTable.append($('<tr>').append(
                        $('<td>').text(advert.title),
                        $('<td>').text(advert.publisher),
                        $('<td>').text(advert.datePublished),
                        $('<td>').text(advert.price)
                    ));
                }

                $('#ads').append(advertsTable);
            }
        }
    }
}