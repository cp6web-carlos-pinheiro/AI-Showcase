export interface SearchFormControls {
  form: HTMLFormElement;
  input: HTMLInputElement;
  button: HTMLButtonElement;
  setDisabled: (disabled: boolean) => void;
}

export function createSearchForm(
  container: HTMLElement,
  onSubmit: (value: string) => void,
): SearchFormControls {
  const form = document.createElement('form');
  form.className = 'search-form';
  form.noValidate = true;
  form.setAttribute('data-testid', 'search-form');

  const label = document.createElement('label');
  label.textContent = 'Buscar cidade';
  label.className = 'sr-only';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'city';
  input.placeholder = 'Buscar cidade';
  input.setAttribute('aria-label', 'Buscar cidade');
  input.setAttribute('data-testid', 'search-input');
  input.autocomplete = 'off';
  input.id = 'search-city-input';
  label.htmlFor = input.id;

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Buscar';
  button.setAttribute('data-testid', 'search-button');

  form.append(label, input, button);
  container.replaceChildren(form);

  const handleSubmit = (event?: Event) => {
    event?.preventDefault();

    const value = input.value.trim();
    if (!value) {
      return;
    }

    onSubmit(value);
  };

  form.addEventListener('submit', (event) => handleSubmit(event));
  button.addEventListener('click', (event) => {
    if (button.type === 'submit') {
      event.preventDefault();
      handleSubmit();
    }
  });

  const setDisabled = (disabled: boolean) => {
    input.disabled = disabled;
    button.disabled = disabled;
  };

  return { form, input, button, setDisabled };
}
