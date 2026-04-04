function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="panel relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="button-secondary h-11 w-11 rounded-full px-0 py-0 text-lg"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
