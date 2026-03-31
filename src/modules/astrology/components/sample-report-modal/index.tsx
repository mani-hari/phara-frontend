"use client"

import { X } from "lucide-react"
import { useState } from "react"

type SampleReport = {
  title: string
  summary: string
  file: string
}

export default function SampleReportModal({
  reports,
}: {
  reports: SampleReport[]
}) {
  const [activeReport, setActiveReport] = useState<SampleReport | null>(null)

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {reports.map((report) => (
          <article
            key={report.title}
            className="rounded-3xl border border-[#e6d7cb] bg-white p-6 shadow-[0_24px_50px_rgba(47,36,29,0.08)]"
          >
            <div className="rounded-2xl border border-dashed border-brand-200 bg-[#fbf3eb] p-5">
              <div className="space-y-3 rounded-xl bg-white/80 p-4">
                <div className="h-3 w-28 rounded-full bg-brand-200" />
                <div className="h-3 w-full rounded-full bg-brand-100" />
                <div className="h-3 w-5/6 rounded-full bg-brand-100" />
                <div className="h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-[#f5ebe0]" />
              </div>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-grey-90">
              {report.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-grey-50">
              {report.summary}
            </p>
            <button
              type="button"
              onClick={() => setActiveReport(report)}
              className="mt-5 inline-flex items-center rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              See sample
            </button>
          </article>
        ))}
      </div>

      {activeReport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 py-8">
          <div className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-grey-10 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                  Sample Report
                </p>
                <h3 className="mt-2 text-xl font-semibold text-grey-90">
                  {activeReport.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="rounded-full border border-grey-10 p-2 text-grey-60 transition-colors hover:border-grey-20 hover:text-grey-90"
                aria-label="Close sample report"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <iframe
              src={`${activeReport.file}#toolbar=0&navpanes=0`}
              title={activeReport.title}
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </>
  )
}
