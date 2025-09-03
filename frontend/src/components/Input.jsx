
function Input({ label, helper, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</span>
      <input
        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 shadow-sm outline-none ring-blue-600/20 transition focus:ring dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        {...props}
      />
      {helper ? <div className="mt-1">{helper}</div> : null}
    </label>
  );
}

export default Input;