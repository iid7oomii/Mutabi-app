const STYLES = {
  primary: { background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' },
  danger:  { background: 'linear-gradient(135deg, #dc2626, #ef4444)' },
}

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const isGhost = variant === 'ghost'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={isGhost ? undefined : (disabled ? { background: '#9ca3af', cursor: 'not-allowed' } : STYLES[variant])}
      className={isGhost
        ? `transition ${className}`
        : `font-semibold text-white rounded-xl transition ${className}`
      }
      {...props}
    >
      {children}
    </button>
  )
}
