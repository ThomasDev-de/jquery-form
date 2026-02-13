# jquery-form

A lightweight jQuery plugin to easily handle forms with AJAX and Bootstrap (>= 5.0).

[changelog](CHANGELOG.md)

## FEATURES

- Automatic AJAX handling (Submit & Reset)
- Integration with Bootstrap validation styles (`is-invalid`, `invalid-feedback`)
- Support for asynchronous pre-checks (`onBeforeSend` with Promise/async)
- Automatic handling of file uploads (`FormData`)
- Support for data attributes for automatic initialization
- Extensive callbacks and events

## REQUIREMENTS

- [Bootstrap](https://getbootstrap.com/) >= 5.0
- [jQuery](https://jquery.com/) >= 3.6

## INSTALLATION

### Composer
```bash
composer require webcito/jquery-form
```

### Manual
Include the `dist/jquery.form.js` file in your project:
```html
<script src="path/to/dist/jquery.form.js"></script>
```

## USAGE

### Automatische Initialisierung via Data Attributes
Das Plugin initialisiert sich automatisch für Formulare mit `data-bs-toggle="form"` oder `data-toggle="form"`. Dies geschieht dank eines MutationObservers sofort beim Laden der Seite sowie für alle später (z.B. per AJAX) hinzugefügten Formulare. Bei Massen-Operationen wird die Initialisierung performant gebündelt (Debouncing).

```html
<form action="/path/to/api" method="post" data-bs-toggle="form">
    <input type="text" name="name" required class="form-control">
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### Manual initialization via JavaScript
```javascript
$('#form_example').form({
    onSuccess: function(form, response) {
        console.log('Success!', response);
    }
});
```

## OPTIONS

```javascript
const DEFAULTS = {
    autocomplete: false,        // Disables autocomplete for all fields
    resetOnModalHidden: true,   // Resets the form when a surrounding modal is closed
    onBeforeSend: async function(form){}, // Called before sending (supports async)
    onSuccess: function(form, response){},
    onError: function(form, errors){},
    onComplete: function(form, response){},
    onCleared: function(form){},
    onReset: function(event, form){},
    onInit: function(form){},
}
```

### Special Case: `onBeforeSend`
`onBeforeSend` can be `async` or return a Promise. If the function explicitly returns `false`, the submission process is aborted.

```javascript
onBeforeSend: async function(form) {
    const result = await myConfirmationDialog();
    return result; // If result === false, the form will not be submitted
}
```

## EVENTS

The plugin triggers events on the form element.

```javascript
$(document)
    .on('success', '#form_example', function (event, $form, responseJSON) {
        // Successfully sent
    })
    .on('error', '#form_example', function (event, $form, responseJSON, xhr) {
        // Error during sending or validation error
    })
    .on('beforeSend', '#form_example', function (event, xhr, $form, aborted) {
        // Before sending (xhr is null for async abortion)
    })
    .on('complete', '#form_example', function (event, $form, responseJSON) {
        // Request completed (success or error)
    })
    .on('cleared', '#form_example', function (event, $form) {
        // Validation markers have been removed
    })
    .on('init', '#form_example', function (event, $form) {
        // Plugin initialized
    })
    .on('error', '#form_example [name="name"]', function (e, $inputElement, message) {
        // Specific error for an input field
    })
    .on('any', '#form_example', function (e, eventName) {
        // Fired on every event above
    });
```

## METHODS

### setErrors
Manually sets errors for specific fields.

```javascript
$('form').form('setErrors', {
    email: 'Email address is already taken',
    password: 'Password is too short'
});
```

## ERROR HANDLING

The plugin expects error responses as a JSON object. The key must correspond to the `name` attribute of the input.

```json
{
  "email": "Invalid email address",
  "password": "Required field"
}
```
If the key `"default"` is used, a global error message (Bootstrap Alert) is displayed in the form.

```json
{
  "default": "An unknown error has occurred."
}
```
