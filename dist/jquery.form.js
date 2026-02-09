// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols

/**
 * jQuery Form Plugin
 * The easy way to handle forms with jQuery and Bootstrap
 *
 * @version 1.0.3
 * @author Thomas Kirsch <t.kirsch@webcito.de>
 * @license proprietary
 * @link https://github.com/webcito/jquery-form
 */
(function ($) {

    const namespace = '.bs.form'
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
            onBeforeSend: function (form) {
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
            onProgress: function (form, progress) {
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
                .on('submit' + namespace, function (e) {
                    e.preventDefault();
                    submit(form);
                })
                .on('reset' + namespace, function (event) {
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
            element.trigger(eventName + namespace, params);

            if (element.is('form')) {
                element.trigger('any' + namespace, [eventName]);
            } else {
                element.closest('form').trigger('any' + namespace, [eventName]);
            }
        }

        async function submit(form) {
            const settings = form.data('settings');
            let btnHtml = "";
            let submitButton = form.find('[type="submit"]');

            // Prüfen, ob ein Datei-Feld im Formular vorhanden ist
            const hasFileInput = form.find('input[type="file"]').length > 0;

            clear(form);

            let aborted = false;
            const returnBoolean = await settings.onBeforeSend(form);
            if (returnBoolean !== undefined) {
                if (!returnBoolean) {
                    aborted = true;
                }
            }

            if (aborted) {
                trigger(form, 'beforeSend', [null, form, true]);
                return;
            }

            btnHtml = submitButton.html();
            submitButton.html(`<i class="${ICON_LOADING}"></i>`);
            submitButton.prop('disabled', true).addClass('disabled');

            trigger(form, 'beforeSend', [null, form, false]);

            let ajaxOptions = {
                url: form.attr('action') || '',
                method: form.attr('method').toUpperCase(),
                dataType: 'json',
                cache: false,
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
                },
                xhr: function () {
                    let xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            let percentComplete = (evt.loaded / evt.total) * 100;
                            trigger(form, 'progress', [form, percentComplete]);
                            settings.onProgress(form, percentComplete);
                        }
                    }, false);
                    return xhr;
                }
            };

            // FormData bei Datei-Feldern
            if (hasFileInput) {
                ajaxOptions.data = new FormData(form[0]);
                ajaxOptions.contentType = false;
                ajaxOptions.processData = false;
            } else {
                ajaxOptions.data = form.serialize();
                ajaxOptions.contentType = 'application/x-www-form-urlencoded';
            }

            $.ajax(ajaxOptions);
        }

        function clear(form) {
            const settings = form.data('settings');
            if (settings) {
                form.find('.is-valid').removeClass('is-valid');
                form.find('.is-invalid').removeClass('is-invalid');
                form.find('.valid-feedback').remove();
                form.find('.invalid-feedback').remove();
                form.find('.js-form-default-error').remove();
                trigger(form, 'cleared', [form]);
                settings.onCleared(form);
            }
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
