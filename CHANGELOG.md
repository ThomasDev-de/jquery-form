### [1.0.3] - 2026-02-09

#### Changes
- Fixed and unified event namespace usage (`.bs.form`).
- Updated documentation in `README.md` to reflect namespaced events.
- Code style improvements for event triggers.

### [1.0.2] - 2026-02-09

#### Changes
- Updated version number to 1.0.2.
- Added file upload support with progress tracking (from previous updates).
- Enhanced documentation with full Events and Methods API.

### [1.0.1] - 2026-02-05

#### Problem
The plugin did not wait for asynchronous operations in `onBeforeSend` before submitting the form. Since `onBeforeSend` was called within the `beforeSend` option of `$.ajax`, the AJAX request was made immediately, regardless of whether `onBeforeSend` returned a promise or not. In addition, the AJAX request had already been started, which made asynchronous cancellations or modifications difficult.

#### Solution
The `submit` function has been converted into an asynchronous function (`async function`). The process has been adjusted so that `onBeforeSend` is now called **before** the AJAX request is initialized and waited with `await`. This allows the user to use promises in `onBeforeSend` (e.g. for confirmation dialogs or asynchronous validations).

#### Changes
- **dist/jquery.form.js**:
    - `submit(form)` is now `async`.
    - `onBeforeSend` is now called with `await`.
    - The UI updates (loading icon, deactivating the button) and the triggering of the `beforeSend` event now only take place after `onBeforeSend` has completed successfully.
    - The `xhr` parameter has been removed from `onBeforeSend` because the request does not yet exist at this point.
    - Added additional security check in `clear(form)` to avoid errors with uninitialized settings.
- **README.md**:
    - Documentation of `onBeforeSend` updated (parameter `xhr` removed).
