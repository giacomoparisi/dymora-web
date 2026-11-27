/* Request form (ContactForm.astro): checks the required fields and lists the errors in an
   accessible summary. Then, with `data-endpoint` set, it POSTs the request to the Google Apps
   Script web app (answer: JSON { ok }); without it, it opens the visitor's mail app with a
   ready message to the address in `data-to`. A failed POST offers that ready message too. */
(() => {
  const forms = document.querySelectorAll('form[data-contact-form]');
  if (!forms.length) return;

  const TIMEOUT_MS = 20000; // Apps Script can take several seconds on a cold start.
  const labelOf = (input) => (input.labels?.[0]?.textContent ?? input.name).replace('*', '').trim();

  forms.forEach((form) => {
    const summary = form.querySelector('[data-cf-summary]');
    const status = form.querySelector('[data-cf-status]');
    const submit = form.querySelector('[data-cf-submit]');
    const submitText = submit.textContent;
    const endpoint = form.dataset.endpoint;
    const to = form.dataset.to;
    const required = () => Array.from(form.querySelectorAll('input[required], textarea[required]'));
    // Sent as elapsed_ms: the endpoint quietly drops forms filled faster than a person could.
    let startedAt = Date.now();

    const clear = (input) => {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      const err = document.getElementById(`${input.id}-error`);
      if (err) err.textContent = '';
    };

    const fields = () => {
      const data = new FormData(form);
      const get = (k) => String(data.get(k) ?? '').trim();
      return { name: get('name'), company: get('company'), email: get('email'), phone: get('phone'), message: get('message'), website: get('website') };
    };

    const mailtoHref = (v) => {
      const lines = [
        `Nome: ${v.name}`,
        v.company && `Azienda: ${v.company}`,
        `Email: ${v.email}`,
        v.phone && `Telefono: ${v.phone}`,
        v.message && `\nLe mie esigenze:\n${v.message}`,
      ].filter(Boolean);
      const subject = `Richiesta di sopralluogo o demo — ${v.name}`;
      return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    };

    const link = (href, text) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      return a;
    };

    // kind: 'success' | 'error' | 'info'; title is plain text, note a list of strings and nodes.
    const showStatus = (kind, title, note = []) => {
      status.replaceChildren();
      const strong = document.createElement('strong');
      strong.textContent = title;
      status.append(strong);
      if (note.length) {
        const small = document.createElement('small');
        small.append(...note);
        status.append(small);
      }
      status.className = `cf__status cf__status--${kind}`;
      status.hidden = false;
    };

    const setBusy = (busy) => {
      submit.disabled = busy;
      submit.textContent = busy ? 'Invio in corso…' : submitText;
      form.setAttribute('aria-busy', String(busy));
    };

    const send = async (values) => {
      const body = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => body.append(key, value));
      body.set('elapsed_ms', String(Date.now() - startedAt));
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        // URL-encoded body and no custom headers: a CORS "simple request", no preflight.
        // Apps Script answers with a redirect to script.googleusercontent.com, which fetch follows.
        const response = await fetch(endpoint, {
          method: 'POST',
          body,
          credentials: 'omit',
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        return response.ok && result.ok === true;
      } catch {
        return false;
      } finally {
        clearTimeout(timer);
      }
    };

    form.addEventListener('input', (e) => {
      if (e.target.matches('[aria-invalid]')) clear(e.target);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submit.disabled) return;
      summary.hidden = true;
      summary.replaceChildren();
      status.hidden = true;

      const errors = [];
      required().forEach((input) => {
        clear(input);
        input.value = input.value.trim();
        if (input.validity.valid) return;
        const text = input.type === 'email' && input.validity.typeMismatch
          ? 'Inserisci un indirizzo email valido.'
          : 'Campo obbligatorio.';
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', `${input.id}-error`);
        const err = document.getElementById(`${input.id}-error`);
        if (err) err.textContent = text;
        errors.push({ id: input.id, text: `${labelOf(input)}: ${text}` });
      });

      if (errors.length) {
        const title = document.createElement('strong');
        title.textContent = 'Controlla questi campi:';
        const list = document.createElement('ul');
        errors.forEach(({ id, text }) => {
          const li = document.createElement('li');
          li.append(link(`#${id}`, text));
          list.append(li);
        });
        summary.append(title, list);
        summary.hidden = false;
        summary.focus();
        return;
      }

      const values = fields();

      if (!endpoint) {
        window.location.href = mailtoHref(values);
        showStatus('info', 'Il messaggio è pronto nella tua app di posta: invialo per completare la richiesta.', [
          'Se non si è aperta, scrivici a ', link(`mailto:${to}`, to), '.',
        ]);
        return;
      }

      setBusy(true);
      const ok = await send(values);
      setBusy(false);
      if (ok) {
        form.reset();
        startedAt = Date.now();
        showStatus('success', 'Grazie, abbiamo ricevuto la tua richiesta.', [
          "Ti scriveremo all'indirizzo che hai indicato.",
        ]);
      } else {
        showStatus('error', 'Non siamo riusciti a inviare la richiesta.', [
          'Riprova, oppure apri ', link(mailtoHref(values), `l'email già pronta per ${to}`), '.',
        ]);
      }
    });
  });
})();
