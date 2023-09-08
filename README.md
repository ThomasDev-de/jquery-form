# jquery-form

A jQuery plugin for forms

## REQUIREMENTS

- bootstrap >= 5.0
- jQuery >= 3.6

## USAGE

```html
<form action="/path/to/action" method="post" id="form_example">
    <input type="text" required class="form-control" name="name">
</form>

<script src="dist/jquery.form.js"></script>
<script>
    $('#form_example').form(options);
</script>
```

## OPTIONS

```js
const DEFAULTS = {
    resetOnModalHidden: true, // If the form element is in a modal, it will be reset after the modal is hidden
    onBeforeSend: function(form, xhr){},
    onSuccess: function(form, response){},
    onError: function(form, errors){},
    onComplete: function(form, response){},
    onCleared: function(form){},
    onReset: function(event, form){},
    onInit: function(form){},
}
```

## EVENTS
```javascript
$(document)
    .on('success', '#form_example', function (event, $form, responseJSON) {
        // do something
    })
    .on('error', '#form_example', function (event, $form, responseJSON, xhr) {
        // do something
    })
    .on('beforeSend', '#form_example', function (event, xhr, $form) {
        // do something
    })
    .on('complete', '#form_example', function (event, $form, responseJSON) {
        // do something
    })
    .on('cleared', '#form_example', function (event, $form) {
        // do something
    })
    .on('resetting', '#form_example', function (event, $form) {
        // do something
    })
    .on('init', '#form_example', function (event, $form) {
        // do something
    })
    .on('error', '#form_example [name="name"]', function (e, $inputElement, message) {
        // do something
    })
    .on('any', '#form_example', function (e, eventName) {
        // do something
    });
```

## ERROR HANDLING

The plugin expects error messages as JSON object.  
The key must match the input name field and the value should contain the error message.  
Example:

```json
{
  "first_name": "This field must not be empty",
  "email": "This is not a valid email address",
  "password_repeat": "The password repetition does not match"
}
```
If the errors are returned properly, the plugin will bring up the error messages in the correct place   
and the input fields will be marked as invalid.
