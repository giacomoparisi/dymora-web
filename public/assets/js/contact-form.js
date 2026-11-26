/* Request form (ContactForm.astro): checks the required fields, lists the errors in an
   accessible summary, then opens the visitor's mail app with a ready message to the address
   in `data-to`. Nothing is sent from the page. */
(() => {
  const forms = document.querySelectorAll('form[data-contact-form]');
  if (!forms.length) return;

  const labelOf = (input) => (input.labels?.[0]?.textContent ?? input.name).replace('*', '').trim();

  forms.forEach((form) => {
    const summary = form.querySelector('[data-cf-summary]');
    const status = form.querySelector('[data-cf-status]');
    const required = () => Array.from(form.querySelectorAll('input[required], textarea[required]'));

    const clear = (input) => {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      const err = document.getElementById(`${input.id}-error`);
      if (err) err.textContent = '';
    };

    form.addEventListener('input', (e) => {
      if (e.target.matches('[aria-invalid]')) clear(e.target);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
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
          const a = document.createElement('a');
          a.href = `#${id}`;
          a.textContent = text;
          li.append(a);
          list.append(li);
        });
        summary.append(title, list);
        summary.hidden = false;
        summary.focus();
        return;
      }

      const data = new FormData(form);
      const get = (k) => String(data.get(k) ?? '').trim();
      const lines = [
        `Nome: ${get('name')}`,
        get('company') && `Azienda: ${get('company')}`,
        `Email: ${get('email')}`,
        get('phone') && `Telefono: ${get('phone')}`,
        get('message') && `\nLe mie esigenze:\n${get('message')}`,
      ].filter(Boolean);
      const subject = `Richiesta di sopralluogo o demo — ${get('name')}`;
      const to = form.dataset.to;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

      status.replaceChildren();
      const strong = document.createElement('strong');
      strong.textContent = 'Il messaggio è pronto nella tua app di posta: invialo per completare la richiesta.';
      const small = document.createElement('small');
      small.append('Se non si è aperta, scrivici a ');
      const mail = document.createElement('a');
      mail.href = `mailto:${to}`;
      mail.textContent = to;
      small.append(mail, '.');
      status.append(strong, small);
      status.hidden = false;
    });
  });
})();
