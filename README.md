# Smart GST Invoice OS

Free, local-first GST invoice maker starter.

## Files
- `index.html` — app shell and invoice template
- `styles.css` — responsive premium UI
- `app.js` — invoice logic, GST checks, live preview, QR upload, local draft and PDF/print actions

## Run
For best results, serve the folder from a local HTTP server (ES modules are used):

```bash
python -m http.server 5500
```

Then open `http://localhost:5500/`.

## Important
- This starter does **not** connect to Paytm, PhonePe, Google Pay or any payment processor.
- The QR section accepts an image uploaded by the user.
- Invoice drafts are stored in the browser's localStorage in this starter.
- No real government e-invoice/IRP or e-way-bill credentials are included.
- The Google Search Console meta tag is intentionally a placeholder. Replace it only with the verification token Google gives for your property.
- The GST Guard is a basic UI validation layer, not legal advice or a substitute for current GST/IRP validation.
