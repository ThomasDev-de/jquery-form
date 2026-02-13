# jQuery Form Plugin

[![Version](https://img.shields.io/badge/version-1.0.4-blue.svg)](https://github.com/webcito/jquery-form)
[![License](https://img.shields.io/badge/license-proprietary-orange.svg)](LICENSE)
[![jQuery](https://img.shields.io/badge/jquery-%3E%3D%203.6-blue.svg)](https://jquery.com/)
[![Bootstrap](https://img.shields.io/badge/bootstrap-%3E%3D%205.0-purple.svg)](https://getbootstrap.com/)

A powerful, lightweight jQuery plugin designed to streamline form handling with AJAX and Bootstrap 5. It automates validation display, file uploads, and provides a rich API for modern web applications.

[changelog](CHANGELOG.md)

## 🚀 Key Features

- **Seamless AJAX Integration**: Automatic form submission and state management.
- **Bootstrap 5 Native**: Built-in support for Bootstrap validation states (`is-invalid`, `invalid-feedback`).
- **Smart File Uploads**: Automatic detection of file inputs with native `FormData` support.
- **Real-time Progress**: Built-in upload progress tracking for responsive UIs.
- **Asynchronous Workflow**: Support for `async/await` in pre-submission hooks.
- **Auto-Initialization**: Zero-config initialization via HTML5 data attributes.
- **Enhanced UX**: Automatic "Required" field indicators and modal integration.
- **Event-Driven Architecture**: Comprehensive event system for maximum extensibility.

## 📋 Requirements

| Dependency | Version |
| :--- | :--- |
| **jQuery** | >= 3.6 |
| **Bootstrap** | >= 5.0 |

---

## 📦 Installation

### Via Composer
```bash
composer require webcito/jquery-form
```

### Manual Installation
Download the latest release and include the script in your project:
```html
<script src="dist/jquery.form.min.js"></script>
```

---

### Automatic initialization via Data Attributes

The plugin automatically initializes for forms with `data-bs-toggle="form"` or `data-toggle="form"`. Initialization occurs immediately on page load thanks to a MutationObserver, as well as for any forms added later (e.g., via AJAX). For batch operations, initialization is performed efficiently using debouncing.

```html
<form action="/api/submit" method="POST" data-bs-toggle="form">
    <div class="mb-3">
        <label for="user_email" class="form-label">Email address</label>
        <input type="email" name="email" id="user_email" class="form-control" required>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### 2. JavaScript Initialization
For more control, initialize the plugin manually:

```javascript
$('.my-form').form({
    onSuccess: function(form, response) {
        alert('Form submitted successfully!');
    }
});
```

---

## ⚙️ Configuration

Use `$.form.setDefaults()` to configure global behavior or pass options during initialization.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `autocomplete` | `boolean` | `false` | Globally disables browser autocomplete/autocorrect. |
| `resetOnModalHidden` | `boolean` | `true` | Resets the form when its parent Bootstrap modal is closed. |
| `onBeforeSend` | `function` | `null` | Hook before submission. Supports `async`. Return `false` to abort. |
| `onSuccess` | `function` | `null` | Triggered on successful AJAX response. |
| `onError` | `function` | `null` | Triggered when the server returns errors. |
| `onProgress` | `function` | `null` | Provides upload progress (0-100). |
| `onComplete` | `function` | `null` | Triggered after success or error. |

---

## 📤 File Uploads & Progress Tracking

The plugin handles multi-part form data automatically. Implementing a progress bar is trivial:

```javascript
$('#uploadForm').form({
    onProgress: function(form, progress) {
        const percent = Math.round(progress) + '%';
        $('.progress-bar').css('width', percent).text(percent);
    }
});
```

---

## ⚡ Events API

The plugin triggers namespaced events (`.bs.form`) for deep integration. Events can be listened to on the form element or via delegation.

### Form Events

| Event | Parameters | Description |
| :--- | :--- | :--- |
| `init.bs.form` | `event, $form` | Triggered after initialization. |
| `beforeSend.bs.form` | `event, $form, aborted` | Before AJAX request. `aborted` is true if `onBeforeSend` returned false. |
| `progress.bs.form` | `event, $form, progress` | Upload progress (0-100). |
| `success.bs.form` | `event, $form, response` | On successful AJAX response. |
| `error.bs.form` | `event, $form, errors, jqXHR` | On AJAX error or validation failure. |
| `complete.bs.form` | `event, $form, response` | After request completion (success or error). |
| `cleared.bs.form` | `event, $form` | Triggered when validation states are removed. |
| `resetting.bs.form` | `event, $form` | Triggered on form reset. |
| `any.bs.form` | `event, eventName` | Special event triggered for every plugin action. |

### Field Events

| Event | Parameters | Description |
| :--- | :--- | :--- |
| `error.bs.form` | `event, $field, message` | Triggered on a specific input field when it receives an error. |

```javascript
$(document).on('success.bs.form', '#my-form', function(event, $form, response) {
    console.log('Server response:', response);
});

$(document).on('error.bs.form', 'input', function(event, $field, message) {
    console.warn(`Validation failed for ${$field.attr('name')}: ${message}`);
});
```

---

## 🛠 Public Methods

Call methods using the syntax: `$(selector).form('methodName', parameters)`.

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `setErrors` | `object` | Manually display errors on specific fields. Keys must match field names. |

```javascript
// Manually set errors
$('#my-form').form('setErrors', {
    email: 'Invalid domain',
    password: 'Too weak'
});
```

---

## ❌ Error Handling

The plugin expects a JSON response for validation errors (HTTP 4xx or 5xx).

### Field-Level Errors
Map the input `name` attribute to the error message:
```json
{
  "email": "This email is already registered.",
  "username": "Username is too short."
}
```

### Global Errors
Use the `default` key to display a global Bootstrap alert at the top of the form:
```json
{
  "default": "A critical system error occurred. Please try again later."
}
```

---

## 🎨 Styling

The plugin injects minimal CSS to handle the `required` field indicators:
- Required labels get a `.required` class.
- A red asterisk is displayed via the `:before` pseudo-element.

---

## ⚖️ License

Proprietary. Developed by [Thomas Kirsch](mailto:t.kirsch@webcito.de).
