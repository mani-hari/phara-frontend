// Default for the @dashboard slot on /account/* sub-routes it doesn't define,
// so hard loads of those routes resolve instead of 404-ing.
export default function Default() {
  return null
}
