/* eslint-disable no-undef */
import { formatSchedule } from '../format/register';

const ServiceRegister = function () {

  let validation;
  // Form elements
  let _card;
  let _form;
  let _submit;
  let _overlay;
  let _form_rcv_num;
  let _form_rcv_ymd;
  let _form_apm_tel;
  let _form_apl_cde;
  let _form_pip_dip;
  let _form_lep_cde;
  let _form_opr_nam;
  // Form values

  const _initValidation = function () {
    validation = FormValidation.formValidation(
      KTUtil.getById('service_register_form'),
      {
        fields: {
          'rcv_nam': { validators: { notEmpty: { message: '필수 입력' } } },
          'rcv_ymd': { validators: { notEmpty: { message: '필수 입력' } } },
          'apm_nam': { validators: { notEmpty: { message: '필수 입력' } } },
          'apm_tel': { validators: { notEmpty: { message: '필수 입력' } } },
          'apm_adr_road': { validators: { notEmpty: { message: '필수 입력' } } },
          'apm_adr_jibun': { validators: { notEmpty: { message: '필수 입력' } } },
          'pro_nam': { validators: { notEmpty: { message: '필수 입력' } } },
          'apy_cde': { validators: { notEmpty: { message: '필수 입력' } } },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap: new FormValidation.plugins.Bootstrap(),
        },
      },
    ).on('plugins.message.displayed', function (event) {
      event.messageElement.style.display = 'none';
    }).on('core.field.valid', function (field) {
      if (field === 'apy_cde') {
        _form_apl_cde.parent().removeClass('is-invalid').addClass('is-valid');
      }
    }).on('core.field.invalid', function (field) {
      if (field === 'apy_cde') {
        _form_apl_cde.parent().removeClass('is-valid').addClass('is-invalid');
      }
    });

    _form_rcv_ymd.on('change.datetimepicker', function () {
      validation.revalidateField('rcv_ymd');
    });

    _form_apm_tel.on('change', _revalidateField);
    _form.find('input[name="apm_adr_road"]').on('change', _revalidateField);
    _form.find('input[name="apm_adr_jibun"]').on('change', _revalidateField);
  };

  const _revalidateField = function (event) {
    validation.revalidateField(event.target.name);
  };

  const _initForm = function () {
    // Automatically adjust textarea height
    autosize(_form.find('textarea[name="apl_exp"]'));

    _form_rcv_ymd.datetimepicker({
      /**
       * @link https://tempusdominus.github.io/bootstrap-4/Options/#locale
       * */
      locale: window.moment.locale('ko'),
      format: 'YYYY/MM/DD HH:mm',
      buttons: {
        showToday: true,
      },
    });

    _form_apm_tel.inputmask('99[9]-999[9]-9999', {
      oncomplete: function (event) {
        $(event.target).change();
      },
    });

    _form_apl_cde.on('change', function (event) {
      if (event.target.value === '도로 누수') {
        _form_pip_dip.parents().eq(1).css('display', 'block');
        _form_lep_cde.parents().eq(1).css('display', 'block');
      } else {
        _form_pip_dip.parents().eq(1).css('display', 'none');
        _form_pip_dip.parents().eq(1).css('display', 'none');
        _form_lep_cde.parents().eq(1).css('display', 'none');
        _form_pip_dip.val('default').selectpicker('refresh');
        _form_lep_cde.val('default').selectpicker('refresh');
      }
    });

    $.ajax({
      url: `${window.location.origin}/service/register/schedule`,
      headers: {
        'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
      },
      dataType: 'json',
      success: function (res) {
        formatSchedule(res).then(function (result) {
          _form_opr_nam.append(result).selectpicker('refresh');
        });
      },
    });

    $(_form).on('reset', function () {
      // On form reset, remove all validation status as well
      validation.resetForm();
      // Remove all validation status on boostrap-select dropdown
      _resetSelectpicker();
      // Save the id and re-fill it after the form resets
      let _id = _form_rcv_num.val();
      setTimeout(() => {
        _form_rcv_num.val(_id);
      }, 250);
    });
  };

  const _handleForm = function () {
    $(_submit).on('click', function (event) {
      event.preventDefault();

      validation.validate().then(function (status) {
        if (status === 'Valid') {
          _toggleBlockOverlay(true);

          _form.ajaxSubmit({
            url: `${window.location.origin}/service/register`,
            method: 'POST',
            headers: {
              'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
            },
            success: function (response, status, xhr, $form) {
              setTimeout(function () {
                _form.resetForm();
                _resetSelectpicker();
                _toggleBlockOverlay(false);
                $.notify({
                  message: '민원이 등록되었습니다',
                }, { type: 'success' });
              }, 2000);
            },
            error: function (response, status, xhr, $form) {
              $.notify({
                // message: '민원을 등록하지 못하였습니다',
                message: xhr,
              }, { type: 'danger' });
              _toggleBlockOverlay(false);
            },
          },
          null,
          'json',
          null,
          );
        } else {
          KTUtil.scrollTop();
          $.notify({
            message: '필수 정보를 먼저 입력해주세요',
          }, { type: 'danger' });
        }
      });
    });
  };

  const _toggleBlockOverlay = function (boolean) {
    if (boolean) {
      _card.addClass('overlay overlay-block');
      _overlay.css('display', 'flex');
    } else {
      _card.removeClass('overlay overlay-block');
      _overlay.css('display', 'none');
    }
  };

  const _resetSelectpicker = function () {
    [_form_apl_cde, _form_lep_cde, _form_pip_dip, _form_opr_nam].forEach(element => {
      element.val('default').selectpicker('refresh');
    });
    // For bootstrap-select, "is-(in)valid" class must be added/removed manually to update validation status
    _form_apl_cde.parent().removeClass('is-valid is-invalid');
  };

  // Public functions
  return {
    init: function () {
      _card = $('#card_register');
      _form = _card.find('form');
      _submit = _form.find('button[type="submit"]');
      _overlay = _card.find('.overlay-layer');

      _form_rcv_num = _form.find('input[name="rcv_num"]');
      _form_rcv_ymd = _form.find('input[name="rcv_ymd"]').parent('.date');
      _form_apm_tel = _form.find('input[name="apm_tel"]');
      _form_apl_cde = _form.find('select[name="apy_cde"]');
      _form_pip_dip = _form.find('select[name="pip_dip"]');
      _form_lep_cde = _form.find('select[name="lep_cde"]');
      _form_opr_nam = _form.find('select[name="opr_nam"]');

      $('form input').on('keypress', function (e) {
        return e.which !== 13;
      });

      _initValidation();
      _initForm();
      _handleForm();
    },
  };
}();

jQuery(document).ready(function () {
  if (document.getElementById('card_register')) ServiceRegister.init();
});
