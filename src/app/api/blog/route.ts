import { NextRequest, NextResponse } from "next/server"

import { saveBlogPost } from "@lib/data/blog"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.excerpt || !body.author || !body.content) {
      return NextResponse.json(
        { error: "title, excerpt, author, and content are required." },
        { status: 400 }
      )
    }

    const slug = await saveBlogPost({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      author: body.author,
      publishedAt: body.publishedAt || new Date().toISOString().slice(0, 10),
      tags: Array.isArray(body.tags) ? body.tags : [],
      coverImage: body.coverImage,
      content: body.content,
    })

    return NextResponse.json({ slug }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save blog post.",
      },
      { status: 500 }
    )
  }
}
