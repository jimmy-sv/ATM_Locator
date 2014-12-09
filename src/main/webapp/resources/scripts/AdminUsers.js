var user;               //Instance of current loaded user

window.onload = function() {
    jQuery("#findName").autocomplete({
        serviceUrl: getHomeUrl() + "users",
        minChars: 2,
        deferRequestBy: 200,
        delimiter: /(,|;)\s*/,
        zIndex: 1000
    })
}

//Request to find user by name or email
function FindUser(){
    var findValue = $("#findName").val().replace('.','*');

   //Send request
    $.ajax({
        url: getHomeUrl()+"users/"+findValue,
        type : "GET",
        context: document.body,
        dataType: "json",
        statusCode: {
            200: function(response) {
                                showData(response);
                                $("#findName").val("");
                                return response;
                            },
            404: couldNotFind
        }
    })
}

//Show popover if cant find such user
function couldNotFind(message){
        //show popover if user not found
        $('#findName').attr("data-content", "Can't find user with this name or e-mail");
        $('#findName').popover("show");
        //hide user form
        $("#userData").slideUp();
}

//Show user profile
function showData(response){
    user = response;
    //fill fields in form by user data
    fillFields(user);
    //show form
    $("#userData").slideDown();
}
//Fill user profile
function fillFields(user){
    $("#avatar").attr("src",getHomeUrl()+"resources/images/"+user.avatar);
    $("#login").val(user.login);
    $("#nickname").val(user.name);
    $("#email").val(user.email);
    $("#genPassword").prop("checked" ,false).change();
    if(user.enabled != 0){
        $("#enabled").prop("checked" ,true).change();
    } else {
        $("#enabled").prop("checked" ,false).change();
    }
    $("#save").prop('disabled', true);
}
//hide form
function clearForm(){
    $("#userData").slideUp();
}

function askForDeleting(){
    $("#questionModal").modal("show");
}

//Delete user from server
function deleteUser(){
    //Send request
    $.ajax({
        url:getHomeUrl()+"users/"+user.id,
        type : "DELETE",
        context: document.body,
        dataType: "json",
        statusCode: {
            200: showAlert,
            404: showAlert,
            406: showAlert
        }
    })
    //hide user form
    $("#questionModal").modal("hide");
 //   $("#userData").slideUp();
}

function showAlert(className, html) {
    $("#message").removeClass();
    $("#message").addClass(className);
    $("#resultDefinition").empty();
    $("#resultDefinition").append(html);
    $("#message").slideDown(500);
  //  setTimeout(hideAlert, 10000)
}

function hideAlert(){

    $("#message").slideUp(500);
}

function getUpdatedFields(){
    updatedUser = {
        login : $("#login").val(),
        name : $("#nickname").val(),
        email : $("#email").val(),
        enabled : $("#enabled").prop("checked") == true ? 1 : 0
    }

    if(updatedUser.login === user.login){
        delete updatedUser.login;
    }

    if(updatedUser.name === user.name){
        delete updatedUser.name;
    }

    if(updatedUser.email === user.email){
        delete updatedUser.email;
    }

    if(updatedUser.enabled === user.enabled){
        delete updatedUser.enabled;
    }

    return updatedUser;
}

function updateUser(){
    //checking login
    if(! validateLogin($('#login').prop("value"))){
        $('#login').attr("data-content", "Login is too short(min 4 letters) or has unsupported character");
        $('#login').popover("show");
        return;
    }
    //checking login
    if(! validateLogin($('#nickname').prop("value"))){
        $('#nickname').attr("data-content", "NickName is too short(min 4 letters) or has unsupported character");
        $('#nickname').popover("show");
        return;
    }
    //checking E-Mail
    if(!validateEmail($('#email').prop("value"))){
        $('#email').popover("show");
        return;
    };


    var data = JSON.stringify(getUpdatedFields());
    if (data === "{}" && $("#genPassword").prop("checked") == false){
        showAlert("alert alert-info", "Nothing to update");
        return;
    };
    var url =getHomeUrl()+"users/"+user.id+"?generatePassword="+($("#genPassword").prop("checked") == true ? true : false);
    $.ajax({
        url : url,
        type : "PATCH",
        context : document.body,
        contentType: "application/json; charset=utf-8",
        data : data,
        dataType : "json",
        statusCode: {
            200: function(){
                showAlert("alert alert-success", "Operation successfully processed");
                user.login = $("#login").val();
                user.name = $("#nickname").val();
                user.email = $("#email").val();
                user.enabled = $("#enabled").prop("checked") == true ? 1 : 0;
            },
            406: function (response) {
                showAlert("alert alert-warning", WARNING_MESSAGE);
                for (var i = 0; i < response.responseJSON.length; i++) {
                    var item = response.responseJSON[i];
                    $('#' + item.field).attr("data-content", item.code);
                    $('#' + item.field).popover("show");
                }
            },
            500: function(){ showAlert("alert alert-danger", "kuhf")}
        }
    })
}

function hidePopover(element){
    $('#'+element).popover("destroy");
}

function setModified(){
    if(JSON.stringify(getUpdatedFields()) !== "{}") {
        $("#save").prop('disabled', false);
    }else{
        $("#save").prop('disabled', true);
    }
}







