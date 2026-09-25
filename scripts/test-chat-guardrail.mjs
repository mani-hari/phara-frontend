// Ask Parihara guardrail test set (Layer 1). Run: npm run test:guardrail
// The rules in src/lib/chat/guardrail.ts are tuned against this file:
// every MUST_FLAG message must flag and every MUST_NOT_FLAG message must pass.
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  classifyMessage,
  sanitizeHistory,
  maskPII,
  STANDARD_REPLY,
  ESCALATION_REPLY,
  REDACTED_USER_TURN,
} from "../src/lib/chat/guardrail.ts"
import { CONTACT } from "../src/lib/contact.ts"

// Exact text pasted by a visitor on 16 Sep 2026 (session d95ebbb4), verbatim
// from chat_messages, including the curly apostrophe and the double space.
export const SEP16_PASTE =
  "The Temple Has Stopped Us From Performing Pujas. With profound sadness, we must share that the Sri Garbarakshambigai Temple authorities will no longer permit us to conduct pujas on behalf of devotees. This means, after 13 years of service (since 11th March 2011)— after performing thousands of sacred rituals and delivering prasadam to devotees in over 50 countries—we can no longer offer this divine connection.  This is not our choice. The temple’s decision is final."

const MUST_FLAG = [
  SEP16_PASTE,
  "The Temple Has Stopped Us From Performing Pujas",
  "how can you sell this?",
  "is this even allowed by the temple?",
  "temple authorities banned proxy pujas, how are you doing it",
  "this is fraud",
  "prove that you really perform the pooja",
  "Garbarakshambigai temple authorities will no longer permit anyone to conduct pujas on behalf of devotees. Why are you still selling?",
  "I read that the temple stopped proxy poojas. Is that true?",
  "Another website says the temple has stopped them from performing abhishekam",
  "The temple's decision is final, so how can you sell this?",
  "Are you allowed to do pooja on behalf of devotees at Garbharakshambika temple?",
  "Is your service legit?",
  "is this legit or a scam",
  "you people are frauds",
  "This website is a scam",
  "aap log fraud ho",
  "temple ne mana kar diya hai pooja ke liye, aap kaise kar rahe ho",
  "Garbarakshambigai mandir ne online pooja band kar diya",
  "Is it genuine? Do you really go to the temple?",
  "How do I know you actually perform the abhishekam? Show me proof",
  "you are cheating devotees by selling ghee prasadam",
  "Prasadam is fake, the temple does not permit outsiders",
  "Proxy pujas are not permitted by the temple authorities",
  "The temple put up a notice saying pujas are not allowed to be booked through agents",
  "Is it illegal to sell temple prasadam online?",
  "Who authorized you to perform pooja in the temple?",
  "Do you have permission from the temple to do this?",
  "how is this even possible when the temple banned it",
  "Your company is lying about the pooja",
  "garbarakshambika temple la allow panna matanga nu solranga, neenga eppadi pannureenga",
  "Is this real? The temple has stopped devotees pujas on behalf",
  "I heard online abhishekams are no longer allowed at the temple",
  "u r fake, temple doesnt allow proxy poojas",
  "This is a dhoka, pooja nahi hota hoga",
  "The Sri Garbarakshambigai Temple authorities will no longer permit us to conduct pujas on behalf of devotees.",
  "Are you a genuine service? How can you sell pooja for a temple that stopped it?",
]

const MUST_NOT_FLAG = [
  "which pooja is best for conceiving",
  "Which pooja is best for conceiving a child?",
  "my periods stopped last month, which pooja should I do",
  "the temple is beautiful",
  "how long does it take",
  "How long does it take to receive the prasadam in the US?",
  "is the prasadam genuine ghee?",
  "is the ghee pure",
  "hi",
  "Namaste",
  "Good morning, I need help",
  "What is the status of my order 1234?",
  "Where is my order? I placed it last week, email is test@example.com",
  "How much does the Garbarakshambigai ghee cost?",
  "What is the price of Rahu Ketu pooja in USD?",
  "Can you do the pooja on behalf of my mother? It's not possible for me to travel.",
  "I didn't notice the delivery date for my pooja",
  "Will I get a video of the pooja?",
  "Will I get video proof after the pooja?",
  "Women are not allowed in the temple during periods, right?",
  "Can women on periods attend the pooja, is this allowed?",
  "My husband cheated on me, which pooja can help our marriage?",
  "I lost money in a fraud, which homam helps recover finances?",
  "It is impossible for me to visit the temple, can you send prasadam?",
  "Do you have Shirdi Sai Baba udi?",
  "Is there a Hanuman pooja?",
  "What is Sarpa Dosha and how is it remedied?",
  "Book the Sudarshana Homam for my son",
  "What is the difference between a pooja and a homam?",
  "How do I find my nakshatram?",
  "What happens during the Garbarakshambigai Abhishekam?",
  "Hi, how are you doing? I want to book a pooja",
  "How do you perform the pooja when I am abroad?",
  "Which temple is the Rahu Ketu pooja done at?",
  "Payment button won't click, why not able to book ghee pooja",
  "For payment online option not working",
  "When was my pooja performed? My order number is 5678",
  "Does this pooja really do anything for health?",
  "I am lying in bed sick, which pooja for health",
  "which pooja for health",
  "Can I get the prasadam delivered to Canada?",
  "Thank you so much, blessings",
  "Is the oil prasadam safe to apply during pregnancy?",
  "Mera kaam ban jayega kya is pooja se?",
  "The temple lies in Thanjavur district, right?",
  "Please send the prasadam to my new address",
]

test(`MUST_FLAG: ${MUST_FLAG.length} adversarial messages flag`, () => {
  assert.ok(MUST_FLAG.length >= 30)
  const missed = MUST_FLAG.filter((m) => !classifyMessage(m).flagged)
  assert.deepEqual(missed, [], `not flagged:\n${missed.join("\n")}`)
})

test(`MUST_NOT_FLAG: ${MUST_NOT_FLAG.length} benign messages pass`, () => {
  assert.ok(MUST_NOT_FLAG.length >= 30)
  const wrong = MUST_NOT_FLAG
    .map((m) => [m, classifyMessage(m)])
    .filter(([, r]) => r.flagged)
    .map(([m, r]) => `${m}  <- ${r.reason}`)
  assert.deepEqual(wrong, [], `false positives:\n${wrong.join("\n")}`)
})

test("each flag carries a reason", () => {
  for (const m of MUST_FLAG) assert.ok(classifyMessage(m).reason.length > 0, m)
  for (const m of MUST_NOT_FLAG) assert.equal(classifyMessage(m).reason, "", m)
})

test("fixed replies use the site's official WhatsApp number and never apologise", () => {
  for (const reply of [STANDARD_REPLY, ESCALATION_REPLY]) {
    const digits = reply.match(/\+91[\d\s-]+\d/)[0].replace(/\D/g, "")
    assert.equal(digits, CONTACT.whatsapp)
    assert.doesNotMatch(reply, /sorry|apolog/i)
  }
  assert.match(ESCALATION_REPLY, /Monday to Saturday, 9 AM to 6 PM IST/)
})

test("sanitizeHistory replaces flagged user turns in content AND parts", () => {
  const history = [
    { role: "user", content: SEP16_PASTE, parts: [{ type: "text", text: SEP16_PASTE }] },
    { role: "assistant", content: STANDARD_REPLY },
    { role: "user", content: "which pooja for health" },
  ]
  const { messages, flaggedCount } = sanitizeHistory(history)
  assert.equal(flaggedCount, 1)
  assert.equal(messages[0].content, REDACTED_USER_TURN)
  assert.deepEqual(messages[0].parts, [{ type: "text", text: REDACTED_USER_TURN }])
  assert.equal(messages[2].content, "which pooja for health")
  assert.ok(!JSON.stringify(messages).includes("authorities"))
})

test("maskPII masks emails and phone numbers", () => {
  const out = maskPII("mail me at a.b@example.com or +91 98765 43210, order 1234")
  assert.equal(out, "mail me at [email] or [phone], order 1234")
})
