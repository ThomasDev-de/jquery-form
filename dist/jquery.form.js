// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols

/**
 * @version 1.00
 * @since 2022-10-28
 * @author Thomas Kirsch <t.kirsch@webcito.de>
 */
(function ($) {
    $.fn.form = function (options) {
        let setup = $.extend(true, {
            autocomplete:false,
            resetOnModalHidden: true,
            onBeforeSend: function (form, xhr) {
            },
            onSuccess: function (form, response) {
            },
            onError: function (form, errors) {
            },
            onComplete: function (form, response) {
            },
            onCleared: function (form) {
            },
            onReset: function (form) {
            },
            onInit: function (form) {
            },
        }, options || {});

        function setRequired(form) {
            form
                .find('input[required],textarea[required],select[required]')
                .each(function (i, el) {
                    const element = $(el);

                    if(element.attr('id') && form.find('[for="'+element.attr('id')+'"]').length){
                        form.find('[for="'+element.attr('id')+'"]').addClass('required');
                    }

                    else if( element.prev('label').length) {
                        element.prev('label').addClass('required');
                    }
                });
        }

        function setStyleOnHead(){
            let styleElement = $('#style_js_form');
            if (!styleElement.length){
                $('<style>', {
                    id: 'style_js_form',
                    rel: 'stylesheet',
                    html: '.js-form-init .required::after { content: "*"; color: red; margin: 0 0.3em; margin-left: 0.3em; }'
                }).appendTo('head');
            }
        }

        function events(form) {
            form
                .on('submit', function (e) {
                    e.preventDefault();
                    submit(form);
                })
                .on('reset', function (event) {
                    setup.onReset(event, form);
                    trigger(form, 'resetting', [form]);
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
                            trigger(errorElement, 'error', [errorElement, errors[inputName]]);
                        }
                    }
                }
            }
        }

        function createDefaultError(form, message) {
            let modal = form.closest('.modal')
            let inModal = modal.length;

             $('<div>', {
                class: 'js-form-default-error alert alert-danger alert-dismissible fade show mb-0',
                html: [
                    '<i class="fa-solid fa-triangle-exclamation fa-fw me-2"></i>',
                    message,
                    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
                ].join('')
            }).appendTo(inModal ? modal.find('.modal-body') : form);
        }

        /**
         *
         * @param {$|jQuery} element
         * @param {string} eventName
         * @param {array|null} params
         */
        function trigger(element, eventName, params=null){
            element.trigger(eventName, params);

            if(element.is('form')){
                element.trigger('any', [eventName]);
            }
            else{
                element.closest('form').trigger('any', [eventName]);
            }
        }

        function submit(form) {
            let btnHtml = "";
            let submitButton = form.find('[type="submit"]');
            $.ajax({
                url: form.attr('action') || '',
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
                    trigger(form, 'beforeSend', [xhr, form]);
                    setup.onBeforeSend(form, xhr);
                },
                success: function (response) {
                    trigger(form, 'success', [form, response || {}]);
                    setup.onSuccess(form, response || {});
                },
                error: function (jqXHR) {
                    let errors = jqXHR.responseJSON || {};
                    setErrors(form, errors);
                    trigger(form, 'error', [form, errors, jqXHR]);
                    setup.onError(form, errors);
                },
                complete: function (jqXHR) {
                    let data = jqXHR.responseJSON || {};
                    submitButton
                        .prop('disabled', false)
                        .removeClass('disabled')
                        .html(btnHtml);
                    trigger(form, 'complete', [form, data]);
                    setup.onComplete(form, data);
                }
            });
        }

        function clear(form) {
            form.find('.is-valid').removeClass('is-valid');
            form.find('.is-invalid').removeClass('is-invalid');
            form.find('.valid-feedback').remove();
            form.find('.invalid-feedback').remove();
            form.find('.js-form-default-error').remove();
            trigger(form, 'cleared',  [form]);
            setup.onCleared(form);
        }

        function init(form) {
            if (!form.hasClass('js-form-init')) {
                if (!setup.autocomplete) {
                    form
                        .prop('autocorrect', "off")
                        .prop('autocapitalize', "off")
                        .prop('autocomplete', "off");
                    form.find('input:visible').prop('autocomplete', "off");
                    form.find('input[type="password"]').prop('autocomplete', "new-password");
                }
                setStyleOnHead();
                setRequired(form);
                events(form);

                form.addClass('js-form-init');

                setTimeout(function(){
                    setup.onInit(form);
                    trigger(form, 'init',  [form]);
                },0);

            }
        }

        return $(this).each(function (i, e) {
            let form = $(e);
            init(form);
            return form;
        });
    };
    $('[data-toggle="form"], [data-bs-toggle="form"]').form();
}(jQuery));
