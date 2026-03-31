import { Metadata } from "next"

import BlogEditor from "@modules/blog/components/editor"

export const metadata: Metadata = {
  title: "Blog Editor | PariharaOnline",
  description:
    "Create and publish markdown blog posts into the local PariharaOnline content workspace.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function BlogEditorPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  return (
    <div className="bg-grey-5 py-12">
      <div className="content-container">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Editorial Workspace
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-grey-90">
            Simple markdown publishing for new spiritual articles
          </h1>
          <p className="mt-4 text-base leading-8 text-grey-60">
            This editor saves directly into the repository under `content/blog`.
            It is intended for local publishing in this workspace.
          </p>
        </div>

        <BlogEditor countryCode={countryCode} />
      </div>
    </div>
  )
}
