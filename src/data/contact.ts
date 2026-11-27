// Contact form settings (ContactForm.astro, contact-form.js).
//
// `endpoint` is the /exec URL of the Google Apps Script web app in
// integrations/google-apps-script/. While it is empty the form keeps opening the
// visitor's mail app with a ready message, so the site works before the deploy.
// Before filling it in: /privacy/, /cookie/ and the CSP connect-src in
// BaseLayout.astro must already cover Google Apps Script.
export const contact = {
  endpoint: '',
  email: 'info@dymora.eu',
};
