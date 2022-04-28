# jquery-form
A jQuery plugin for forms

requires

- bootstrap > V.5
- jquery > V.3

example

```
<form action="/path/to/action" methos="post" id="form_test">
    <input type="text" required class="form-control" name="name">
</form>

<script>
    $('#form_test').form({
        resetOnModalHidden: true // If the form element is in a modal, it will be reset after the modal is hidden
    });
    
    $(document)
        .on('success', '#form_test', function (e, $form, response) {
            // do something
        })
        .on('error', '#form_test', function (e, $form, responseJSON) {
            // do something
        })
        .on('beforeSend', '#form_test', function (e, $form) {
            // do something
        })
        .on('complete', '#form_test', function (e, $form, responseJSON) {
            // do something
        })
        .on('cleared', '#form_test', function (e, $form) {
            // do something
        })
        .on('init', '#form_test', function (e, $form) {
            // do something
        })
        .on('error', '#form_test [nbame="name"]', function (e, $inputElement, message) {
            // do something
        });
</script>
```
