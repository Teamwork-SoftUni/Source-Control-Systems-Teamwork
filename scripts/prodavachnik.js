function startApp() {
    showHideMenuLinks();
    showHomeView();

    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListAds").click(listAdverts);
	    $("#linkCreateAd").click(showCreateAdView);
    $("#linkLogout").click(logoutUser);

    // Bind the form submit buttons
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
	    $("#buttonCreateAd").click(createAdvert);
    $("#buttonEditAd").click(editAdvert);

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
			         $("#linkCreateAd").hide();
            $("#linkLogout").hide();
        } else {
            // We have logged in user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListAds").show();
			            $("#linkCreateAd").show();
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
	
	    function showCreateAdView() {
        $('#formCreateAd').trigger('reset');
        showView('viewCreateAd');
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
                        '<th>Price</th>',
                        '<th>Actions</th>')
                    );

                for (let advert of adverts) {
					
					                    let links = [];

                    if (advert._acl.creator == sessionStorage['userId']) {
                        let deleteLink = $(`<a data-id="${advert._id}" href="#">[Delete]</a>`)
                            .click(function() { deleteAdvert($(this).attr("data-id")) });
                        let editLink = $(`<a data-id="${advert._id}" href="#">[Edit]</a>`)
                            .click(function() { loadAdvertForEdit($(this).attr("data-id")) });
                        links = [deleteLink, ' ', editLink];
                    }
					
                    advertsTable.append($('<tr>').append(
                        $('<td>').text(advert.title),
                        $('<td>').text(advert.publisher),
                        $('<td>').text(advert.datePublished),
                        $('<td>').text(advert.price),
                        $('<td>').append(links)
                    ));
                }

                $('#ads').append(advertsTable);
            }
        }
    }
	
	    // advertisement/create
    function createAdvert() {
        const kinveyAuthHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };

        const kinveyUserUrl =
            `${kinveyBaseUrl}user/${kinveyAppKey}/${sessionStorage.getItem('userId')}`;

        $.ajax({
            method: "GET",
            url: kinveyUserUrl,
            headers: kinveyAuthHeaders,
            success: afterPublisherRequest
        });

        function afterPublisherRequest(publisher) {
            let advertData = {
                title: $('#formCreateAd input[name=title]').val(),
                publisher: publisher.username,
                datePublished: $('#formCreateAd input[name=datePublished]').val(),
                price: Number($('#formCreateAd input[name=price]').val())
            };

            const kinveyAdvertsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adverts";
            $.ajax({
                method: "POST",
                url: kinveyAdvertsUrl,
                headers: kinveyAuthHeaders,
                data: advertData,
                success: createAdvertSuccess
            });

            function createAdvertSuccess(response) {
                listAdverts();
            }
        }
    }

    // advertisement/delete
    function deleteAdvert(advertId) {
        const kinveyBookUrl = kinveyBaseUrl + "appdata/" +
            kinveyAppKey + "/adverts/" + advertId;
        const kinveyAuthHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };

        $.ajax({
            method: "DELETE",
            url: kinveyBookUrl,
            headers: kinveyAuthHeaders,
            success: deleteBookSuccess
        });

        function deleteBookSuccess(response) {
            listAdverts();
        }
    }

    // advertisement/edit GET
    function loadAdvertForEdit(advertId) {
        const kinveyBookUrl = kinveyBaseUrl + "appdata/" +
            kinveyAppKey + "/adverts/" + advertId;
        const kinveyAuthHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };

        $.ajax({
            method: "GET",
            url: kinveyBookUrl,
            headers: kinveyAuthHeaders,
            success: loadAdvertForEditSuccess
        });

        function loadAdvertForEditSuccess(advert) {
            $('#formEditAd input[name=id]').val(advert._id);
            $('#formEditAd input[name=title]').val(advert.title);
            $('#formEditAd input[name=publisher]').val(advert.publisher);
            $('#formEditAd input[name=datePublished]').val(advert.datePublished);
            $('#formEditAd input[name=price]').val(advert.price);
            showView('viewEditAd');
        }
    }

    // advertisement/edit POST
    function editAdvert() {
        const kinveyAdvertUrl =  kinveyBaseUrl + "appdata/" + kinveyAppKey +
            "/adverts/" + $('#formEditAd input[name=id]').val();
        const kinveyAuthHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };

        let advertData = {
            title: $('#formEditAd input[name=title]').val(),
            publisher: $('#formEditAd input[name=publisher]').val(),
            datePublished: $('#formEditAd input[name=datePublished]').val(),
            price: $('#formEditAd input[name=price]').val()
        };

        $.ajax({
            method: "PUT",
            url: kinveyAdvertUrl,
            headers: kinveyAuthHeaders,
            data: advertData,
            success: editAdvertSuccess
        });

        function editAdvertSuccess(response) {
            listAdverts();
        }
    }
}