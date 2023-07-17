'use strict';

// Class Definition
var KTLogin = function () {
  var _login;

  var _showForm = function (form) {
    var cls = 'login-' + form + '-on';
    form = 'kt_login_' + form + '_form';

    _login.removeClass('login-forgot-on');
    _login.removeClass('login-signin-on');
    _login.removeClass('login-signup-on');

    _login.addClass(cls);

    KTUtil.animateClass(KTUtil.getById(form), 'animate__animated animate__backInUp');
  };

  var _handleSignInForm = function () {
    var validation;
    
    let _form = $('#kt_login_signin_form');

    // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
    validation = FormValidation.formValidation(
      KTUtil.getById('kt_login_signin_form'),
      {
        fields: {
          'LoginName': { validators: { notEmpty: { message: '아이디를 입력해주세요' } } },
          'LoginKey': { validators: { notEmpty: { message: '비밀번호를 입력해주세요' } } },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          submitButton: new FormValidation.plugins.SubmitButton(),
          //defaultSubmit: new FormValidation.plugins.DefaultSubmit(), // Uncomment this line to enable normal button submit after form validation
          bootstrap: new FormValidation.plugins.Bootstrap(),
        },
      },
    );

    $('#kt_login_signin_submit').on('click', function (e) {
      e.preventDefault();

      var btn = $(this);
      
      btn
        .attr('disabled', true);
      
      validation.validate().then(function (status) {
        if (status === 'Valid') {
          _form.ajaxSubmit(
            {
              url: `${window.location.origin}/auth/signin`,
              method: 'POST',
              headers: {
                'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
              },
              error: function (response, status, xhr, $form) {
                setTimeout(function () {
                  btn
                    .removeClass(
                      'spinner spinner-darker-danger spinner-left',
                    )
                    .attr('disabled', false);
                  $.notify({
                    message: response.responseJSON.message,
                  }, { type: 'danger' });
                }, 250);
              },
              success: function (response, status, xhr, $form) {
                setRemember();

                setTimeout(function () {
                  btn
                    .removeClass(
                      'spinner spinner-darker-danger spinner-left',
                    )
                    .attr('disabled', false);
                  resetForm(_form);

                  if (status === 'success') {
                    sessionStorage.setItem('workspace', '영주');
                    window.location.replace('/');
                  }
                }, 250);
              },
            },
            null,
            'json',
            null,
          );
        } else {
          btn
            .attr('disabled', false);
        }
      });
    });

    // Handle forgot button
    $('#kt_login_forgot').on('click', function (e) {
      e.preventDefault();
      _showForm('forgot');
    });

    // Handle signup
    $('#kt_login_signup').on('click', function (e) {
      e.preventDefault();
      _showForm('signup');
    });
  };

  var _handleSignUpForm = function (e) {
    var validation;

    let _form = $('#kt_login_signup_form');

    // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
    validation = FormValidation.formValidation(
      KTUtil.getById('kt_login_signup_form'),
      {
        fields: {
          'UserLastName': { validators: { notEmpty: { message: '필수 입력값입니다' } } },
          'UserFirstName': { validators: { notEmpty: { message: '필수 입력값입니다' } } },
          'LoginNameNew': { validators: { notEmpty: { message: '필수 입력값입니다' } } },
          'LoginKeyNew': { validators: { notEmpty: { message: '필수 입력값입니다' } } },
          'rLoginKeyNew': {
            validators: {
              notEmpty: {
                message: '필수 입력값입니다',
              },
              identical: {
                compare: function () {
                  return KTUtil.getById('kt_login_signup_form').querySelector('input[name="LoginKeyNew"]').value;
                },
                message: '비밀번호가 일치하지 않습니다',
              },
            },
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap: new FormValidation.plugins.Bootstrap(),
        },
      },
    );

    $('#kt_login_signup_submit').on('click', function (e) {
      e.preventDefault();

      var btn = $(this);

      btn
        .attr('disabled', true);

      validation.validate().then(function (status) {
        if (status === 'Valid') {
          _form.ajaxSubmit(
            {
              url: `${window.location.origin}/auth/signup`,
              method: 'POST',
              headers: {
                'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
              },
              error: function (response, status, xhr, $form) {
                setTimeout(function () {
                  btn
                    .attr('disabled', false);
                  $.notify({
                    message: response.responseJSON.message,
                  }, { type: 'danger' });
                }, 250);
              },
              success: function (response, status, xhr, $form) {
                setTimeout(function () {
                  btn
                    .attr('disabled', false);
                  resetForm(_form);

                  if (status === 'success') {
                    _showForm('signin');

                    $.notify({
                      message: response.responseJSON.message,
                    }, { type: 'success' });
                  }
                }, 250);
              },
            },
            null,
            'json',
            null,
          );
        } else {
          btn
            .attr('disabled', false);
        }
      });
    });

    // Handle cancel button
    $('#kt_login_signup_cancel').on('click', function (e) {
      e.preventDefault();

      _showForm('signin');
    });
  };

  var _handleForgotForm = function (e) {
    var validation;

    let _form = $('#kt_login_forgot_form');

    // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
    validation = FormValidation.formValidation(
      _form,
      {
        fields: {
          email: {
            validators: {
              notEmpty: {
                message: 'Email address is required',
              },
              emailAddress: {
                message: 'The value is not a valid email address',
              },
            },
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap: new FormValidation.plugins.Bootstrap(),
        },
      },
    );

    // Handle submit button
    $('#kt_login_forgot_submit').on('click', function (e) {
      e.preventDefault();

      var btn = $(this);

      btn
        .addClass(
          'spinner spinner-darker-danger spinner-left',
        )
        .attr('disabled', true);

      validation.validate().then(function (status) {
        if (status === 'Valid') {
          _form.ajaxSubmit(
            {
              url: `${window.location.origin}/auth/resetKey`,
              method: 'POST',
              headers: {
                'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
              },
              error: function (response, status, xhr, $form) {
                setTimeout(function () {
                  btn
                    .removeClass(
                      'spinner spinner-darker-danger spinner-left',
                    )
                    .attr('disabled', false);
                  $.notify({
                    message: response.responseJSON.message,
                  }, { type: 'danger' });
                }, 250);
              },
              success: function (response, status, xhr, $form) {
                setTimeout(function () {
                  btn
                    .removeClass(
                      'spinner spinner-darker-danger spinner-left',
                    )
                    .attr('disabled', false); // remove
                  resetForm(_form);

                  _showForm('signin');

                  $.notify({
                    message: response.responseJSON.message,
                  }, { type: 'success' });
                }, 250);
              },
            },
            null,
            'json',
            null,
          );
        } else {
          btn
            .attr('disabled', false);
        }
      });
    });

    // Handle cancel button
    $('#kt_login_forgot_cancel').on('click', function (e) {
      e.preventDefault();

      _showForm('signin');
    });
  };

  function setRemember() {
    // Login Form을 Submit할 경우,
    if ($("input[name='remember']").is(':checked')) {
      // ID 기억하기 체크시 쿠키에 저장
      var userId = $("input[id='form-username']").val();
      setCookie('cookieUserId', userId, 30); // 7일동안 쿠키 보관
    } else {
      deleteCookie('cookieUserId');
    }
  }

  function setCookie(cookieName, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var cookieValue =
      escape(value) +
      (exdays == null ? '' : '; expires=' + exdate.toGMTString());
    document.cookie = cookieName + '=' + cookieValue;
  }

  function deleteCookie(cookieName) {
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - 1);
    document.cookie =
      cookieName + '= ' + '; expires=' + expireDate.toGMTString();
  }

  function getCookie(cookieName) {
    cookieName = cookieName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cookieName);
    var cookieValue = '';
    if (start !== -1) {
      start += cookieName.length;
      var end = cookieData.indexOf(';', start);
      if (end === -1) end = cookieData.length;
      cookieValue = cookieData.substring(start, end);
    }
    return unescape(cookieValue);
  }

  function resetForm(formElement) {
    formElement.clearForm();
  }

  // Public Functions
  return {
    // public functions
    init: function () {
      _login = $('#kt_login');

      _handleSignInForm();
      _handleSignUpForm();
      _handleForgotForm();
    },
  };
}();

// Class Initialization
jQuery(document).ready(function () {
  KTLogin.init();
});
