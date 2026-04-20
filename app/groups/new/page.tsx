export default function NewGroupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-emerald-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-sky-100/70 bg-white/80 p-7 shadow-sm backdrop-blur">
          <div className="mb-6">
            <p className="text-sm font-medium text-emerald-700/90">Groups</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Create a new group
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Set a clear name and gentle cadence. You can add participants and sessions next.
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="name">
                Group name
              </label>
              <input
                id="name"
                name="name"
                placeholder="e.g., Mindful Mondays"
                className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="description">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="What is this group focused on?"
                className="mt-2 w-full resize-none rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-800" htmlFor="timezone">
                  Timezone (optional)
                </label>
                <input
                  id="timezone"
                  name="timezone"
                  placeholder="e.g., America/New_York"
                  className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800" htmlFor="meetingTime">
                  Meeting time (optional)
                </label>
                <input
                  id="meetingTime"
                  name="meetingTime"
                  placeholder="e.g., Mondays 6:00 PM"
                  className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-sky-50"
              >
                Cancel
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Create group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

