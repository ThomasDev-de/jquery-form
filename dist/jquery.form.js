// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols

/**
 * @version 1.00
 * @since 2022-10-28
 * @author Thomas Kirsch <t.kirsch@webcito.de>
 */
(function ($) {
    $.form = {
        setDefaults: function (options) {
            this.DEFAULTS = $.extend({}, this.DEFAULTS, options || {});
        },
        getDefaults: function () {
            return this.DEFAULTS;
        },
        DEFAULTS: {
            autocomplete: false,
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
        }
    };

    $.fn.form = function (options = null, params = null) {

        const optionsSet = typeof options === 'object' && options !== null;
        const methodCalled = !optionsSet && options !== null;

        const ICON_WARNING = 'bi bi-cone-striped';
        const ICON_LOADING = 'bi bi-arrow-clockwise';

        function setRequired(form) {
            form
                .find('input[required],textarea[required],select[required]')
                .each(function (i, e) {
                    const el = $(e);
                    // if (el.is(':visible')) {
                        form.find('[for="' + el.attr('id') + '"]').addClass('required');
                    // }
                });

            // form.find('label').each(function (i, l) {
            //     const $label = $(l);
            //     const $input = $('#' + $label.attr('for'));
            //
            //     if ($input.length && $input.is(':visible') && $input.prop('required')) {
            //         $label.addClass('required');
            //     }
            // });
            //
            // form
            //     .find('input[required],textarea[required],select[required]')
            //     .each(function (i, el) {
            //         const element = $(el);
            //
            //         if(element.attr('id') && form.find('[for="'+element.attr('id')+'"]').length){
            //             form.find('[for="'+element.attr('id')+'"]').addClass('required');
            //         }
            //
            //         else if( element.prev('label').length) {
            //             element.prev('label').addClass('required');
            //         }
            //     });
        }

        function setStyleOnHead() {
            setTimeout(function () {
                if (!$('#style_js_form').length) {
                    $('<style>', {
                        id: 'style_js_form',
                    })
                        .appendTo('head')
                        .html('.js-form-init {\n' +
                            '    label.required:before{\n' +
                            '        float: right;\n' +
                            '        content: \'*\' !important;\n' +
                            '        color: red;\n' +
                            '        margin-left: 5px;\n' +
                            '    }\n' +
                            '}');
                }
            }, 500); // delay of 500 milliseconds
        }

        function events(form) {
            const settings = form.data('settings');
            form
                .on('submit', function (e) {
                    e.preventDefault();
                    submit(form);
                })
                .on('reset', function (event) {
                    settings.onReset(event, form);
                    trigger(form, 'resetting', [form]);
                });

            if (settings.resetOnModalHidden) {
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
                                html: `<i class="${ICON_WARNING} me-2"></i>` + errors[inputName]
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
                    `<i class="${ICON_WARNING} me-2"></i>`,
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
        function trigger(element, eventName, params = null) {
            element.trigger(eventName, params);

            if (element.is('form')) {
                element.trigger('any', [eventName]);
            } else {
                element.closest('form').trigger('any', [eventName]);
            }
        }

        function submit(form) {
            const settings = form.data('settings');
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
                    let aborted = false;

                    const returnBoolean = settings.onBeforeSend(form, xhr);
                    if (returnBoolean !== undefined) {
                        if (!returnBoolean) {
                            aborted = true;
                            xhr.abort();
                        }
                    }
                    if (!aborted) {
                        btnHtml = submitButton.html();
                        submitButton.html(`<i class="${ICON_LOADING}"></i>`)
                        submitButton.prop('disabled', true).addClass('disabled');
                    }

                    trigger(form, 'beforeSend', [xhr, form, aborted]);
                },
                success: function (response) {
                    trigger(form, 'success', [form, response || {}]);
                    settings.onSuccess(form, response || {});
                },
                error: function (jqXHR) {
                    let errors = jqXHR.responseJSON || {};
                    setErrors(form, errors);
                    trigger(form, 'error', [form, errors, jqXHR]);
                    settings.onError(form, errors);
                },
                complete: function (jqXHR) {
                    let data = jqXHR.responseJSON || {};
                    submitButton
                        .prop('disabled', false)
                        .removeClass('disabled')
                        .html(btnHtml);
                    trigger(form, 'complete', [form, data]);
                    settings.onComplete(form, data);
                }
            });
        }


        function clear(form) {
            const settings = form.data('settings');
            form.find('.is-valid').removeClass('is-valid');
            form.find('.is-invalid').removeClass('is-invalid');
            form.find('.valid-feedback').remove();
            form.find('.invalid-feedback').remove();
            form.find('.js-form-default-error').remove();
            trigger(form, 'cleared', [form]);
            settings.onCleared(form);
        }

        function init(form) {
            if (!form.hasClass('js-form-init')) {
                // is not initialized and option set, store options on a form element
                if (optionsSet) {
                    const setup = $.extend({}, $.form.DEFAULTS, form.data(), options || {});
                    form.data('settings', setup);
                } else {
                    // store default option on form element.
                    const setup = $.extend({}, $.form.DEFAULTS, form.data());
                    form.data('settings', setup);
                }
                const settings = form.data('settings');
                if (!settings.autocomplete) {
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

                setTimeout(function () {
                    settings.onInit(form);
                    trigger(form, 'init', [form]);
                }, 0);
            }
        }

        return $(this).each(function (i, e) {
            const form = $(e);
            init(form);
            if (methodCalled) {
                switch (options) {
                    case 'setErrors': {
                        setErrors(form, params);
                        return form;
                    }
                }
            } else {
                return form;
            }
        });
    };

    $('[data-toggle="form"], [data-bs-toggle="form"]').form();
}(jQuery));
