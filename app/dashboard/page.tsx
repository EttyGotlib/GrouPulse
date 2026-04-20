const demoGroups = [
  {
    id: 'grp_1',
    name: 'Mindful Mondays',
    description: 'Anxiety support and grounding skills.',
    participantsCount: 8,
    nextSession: 'Mon • 6:00 PM',
  },
  {
    id: 'grp_2',
    name: 'Grief & Growth',
    description: 'Processing loss with compassion and connection.',
    participantsCount: 10,
    nextSession: 'Thu • 7:30 PM',
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-emerald-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700/90">GrouPulse</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Your groups at a glance. Keep sessions organized, participants supported, and
              notes secure.
            </p>
          </div>

          <a
            href="/groups/new"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Create group
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demoGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl border border-sky-100/70 bg-white/80 p-6 shadow-sm backdrop-blur"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{group.name}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {group.description}
                  </p>
                </div>
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800">
                  {group.participantsCount} participants
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Next:</span> {group.nextSession}
                </p>
                <a
                  href="#"
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Open
                </a>
              </div>
            </div>
          ))}

          <a
            href="/groups/new"
            className="group flex min-h-[156px] items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-white/50 p-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white/70"
          >
            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 group-hover:bg-emerald-100">
              + New group
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

