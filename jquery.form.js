/**
 * @version 1.00
 * @since 2022-04-28
 * @author Thomas Kirsch <t.kirsch@webcito.de>
 */
(function ($) {
    $.fn.form = function (options) {
        let setup = $.extend(true, {
            resetOnModalHidden: true
        }, options || {});

        function setRequired(form) {
            form
                .find('input[required],textarea[required],select[required]')
                .each(function (i, e) {
                    $(this).prev('label').addClass('required');
                });
        }

        function events(form) {
            form.on('submit', function (e) {
                e.preventDefault();
                submit(form);
            });

            if (setup.resetOnModalHidden) {
                let modal = form.closest('.modal');
                if (modal.length) {
                    modal.on('hidden.bs.modal', function () {
                        form.get(0).reset();
                        clear(form);
                    });
                }
            }
        }

        function setErrors(form, error) {
            let errors = error || options;
            if (errors) {
                for (let inputName in errors) {
                    if (inputName === 'default') {
                        createDefaultError(form, errors[inputName]);
                    } else {
                        let errorElement = form.find(`[name="${inputName}"]`);
                        if (errorElement.length) {
                            errorElement.addClass('is-invalid');
                            $('<div>', {
                                class: 'invalid-feedback',
                                html: '<i class="fa-solid fa-triangle-exclamation fa-fw me-2"></i>' + errors[inputName]
                            }).insertAfter(errorElement);
                            errorElement.trigger('error', [errorElement, errors[inputName]]);
                        }
                    }
                }
            }
        }

        function createDefaultError(form, message) {
            let modal = form.closest('.modal')
            let inModal = modal.length;
            let alertElement = $('<div>', {
                class: 'js-form-default-error alert alert-danger alert-dismissible fade show mb-0',
                html: [
                    '<i class="fa-solid fa-triangle-exclamation fa-fw me-2"></i>',
                    message,
                    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
                ].join('')
            }).appendTo(inModal ? modal.find('.modal-body') : form);
        }

        function submit(form) {
            let btnHtml = "";
            let submitButton = form.find('[type="submit"]');
            $.ajax({
                url: form.attr('action'),
                method: form.attr('method').toUpperCase(),
                data: form.serialize(),
                dataType: 'json',
                contentType: 'application/x-www-form-urlencoded',
                cache: false,
                beforeSend: function (xhr) {
                    clear(form);
                    btnHtml = submitButton.html();
                    submitButton.html('<i class="fa-solid fa-spinner fa-spin fa-fw"></i>')
                    submitButton.prop('disabled', true).addClass('disabled');
                    form.trigger('beforeSend', [form]);
                    // xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                },
                success: function (response) {
                    form.trigger('success', [form, response || {}]);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    setErrors(form, jqXHR.responseJSON || {});
                    form.trigger('error', [form, jqXHR.responseJSON || {}]);

                },
                complete: function (jqXHR, textStatus) {
                    submitButton
                        .prop('disabled', false)
                        .removeClass('disabled')
                        .html(btnHtml);
                    form.trigger('complete', [form, jqXHR.responseJSON || {}]);
                }
            });
        }

        function clear(form) {
            form.find('.is-valid').removeClass('is-valid');
            form.find('.is-invalid').removeClass('is-invalid');
            form.find('.valid-feedback').remove();
            form.find('.invalid-feedback').remove();
            form.find('.js-form-default-error').remove();
            form.trigger('cleared', [form]);
        }

        function init(form) {
            if (!form.hasClass('js-form-init')) {
                form.attr('autocomplete', 'off');
                setRequired(form);
                events(form);
                form.trigger('init', [form]);
                form.addClass('js-form-init');
            }
        }

        return $(this).each(function (i, e) {
            let form = $(this);
            init(form);
            return form;
        });
    };

}(jQuery));
