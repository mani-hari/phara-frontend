const c = require("ansi-colors")

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    // TODO: we need a good doc to point this to
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
]

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    // Don't hard-fail the build on missing env. Runtime code soft-fails
    // when Medusa is unreachable (see src/middleware.ts and src/lib/data/*),
    // so a deploy with a partially-configured Vercel project still ships
    // a working shell instead of a red 500. Keep the warning loud so the
    // miss is obvious in build logs.
    console.warn(
      c.yellow.bold(
        "\n⚠ Warning: Missing recommended environment variables\n"
      )
    )

    missingEnvs.forEach(function (env) {
      console.warn(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.warn(c.dim(`    ${env.description}\n`))
      }
    })

    console.warn(
      c.yellow(
        "\nThe site will build but Medusa-backed pages will render empty until these are set.\n"
      )
    )
  }
}

module.exports = checkEnvVariables
