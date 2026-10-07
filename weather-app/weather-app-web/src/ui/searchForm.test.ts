import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSearchForm } from './searchForm';

describe('RF-01: searchForm', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(container);
  });

  it('envia o texto limpo ao clicar no botão e ao pressionar Enter no formulário', () => {
    const onSubmit = vi.fn();
    const { form, input, button } = createSearchForm(container, onSubmit);

    input.value = '  Rio de Janeiro  ';
    button.click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Rio de Janeiro');

    onSubmit.mockClear();
    input.value = '  São Paulo  ';
    form.requestSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('São Paulo');
  });

  it('ignora envio com valor vazio ou só espaços', () => {
    const onSubmit = vi.fn();
    const { input, button } = createSearchForm(container, onSubmit);

    input.value = '';
    button.click();
    expect(onSubmit).not.toHaveBeenCalled();

    input.value = '   ';
    button.click();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('não dispara ao digitar no campo', () => {
    const onSubmit = vi.fn();
    const { input } = createSearchForm(container, onSubmit);

    input.value = 'Rio';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('desabilita e habilita campo e botão', () => {
    const onSubmit = vi.fn();
    const { input, button, setDisabled } = createSearchForm(container, onSubmit);

    setDisabled(true);
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    setDisabled(false);
    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(false);
  });

  it('renderiza formulário com label associado e hooks de data-testid', () => {
    const onSubmit = vi.fn();
    const { form, input, button } = createSearchForm(container, onSubmit);

    expect(form.getAttribute('data-testid')).toBe('search-form');
    expect(input.getAttribute('data-testid')).toBe('search-input');
    expect(button.getAttribute('data-testid')).toBe('search-button');

    const label = form.querySelector('label');
    expect(label).not.toBeNull();
    expect(label?.htmlFor).toBe(input.id);
    expect(button.type).toBe('submit');
  });
});
