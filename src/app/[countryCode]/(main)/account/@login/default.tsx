// Rendered for the @login slot on any /account/* sub-route it doesn't itself
// define (signin, register, google-callback, …). Without a default, a hard load
// of those routes 404s because this parallel slot can't be resolved.
export default function Default() {
  return null
}
