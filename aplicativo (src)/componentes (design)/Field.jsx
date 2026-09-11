import { useId } from 'react'

/**
 * Campo de formulário: rótulo + controle + dica/erro, já ligados por id
 * e aria-describedby (leitor de tela anuncia o erro junto com o campo).
 *
 * <Input label="E-mail" type="email" value={x} onChange={...} error={erro} />
 * <Select label="Turno" options={[{value:'abertura',label:'Abertura'}]} />
 * <Textarea label="Comentário" hint="O que aconteceu?" rows={3} />
 */
function Field({ id, label, hint, error, children }) {
  return (
    <div className="gs-field">
      {label && <label className="gs-field__label" htmlFor={id}>{label}</label>}
      {children}
      {error
        ? <p className="gs-field__error" id={`${id}-msg`}>{error}</p>
        : hint ? <p className="gs-field__hint" id={`${id}-msg`}>{hint}</p> : null}
    </div>
  )
}

function useField(idProp, error, hint) {
  const auto = useId()
  const id = idProp || auto
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': (error || hint) ? `${id}-msg` : undefined,
  }
}

export function Input({ id: idProp, label, hint, error, className = '', ...rest }) {
  const a11y = useField(idProp, error, hint)
  return (
    <Field id={a11y.id} label={label} hint={hint} error={error}>
      <input className={['gs-input', error ? 'gs-input--invalid' : '', className].filter(Boolean).join(' ')} {...a11y} {...rest} />
    </Field>
  )
}

export function Textarea({ id: idProp, label, hint, error, className = '', ...rest }) {
  const a11y = useField(idProp, error, hint)
  return (
    <Field id={a11y.id} label={label} hint={hint} error={error}>
      <textarea className={['gs-input', error ? 'gs-input--invalid' : '', className].filter(Boolean).join(' ')} {...a11y} {...rest} />
    </Field>
  )
}

export function Select({ id: idProp, label, hint, error, options = [], children, className = '', ...rest }) {
  const a11y = useField(idProp, error, hint)
  return (
    <Field id={a11y.id} label={label} hint={hint} error={error}>
      <select className={['gs-input', error ? 'gs-input--invalid' : '', className].filter(Boolean).join(' ')} {...a11y} {...rest}>
        {children || options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  )
}
