export interface FAQQuestion {
  question: string
  answer: string
}

export interface FAQCategory {
  slug: string
  title: string
  description: string
  icon: string
  questions: FAQQuestion[]
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    slug: "hindu-pujas-and-rituals",
    title: "Hindu Pujas & Rituals",
    description:
      "Learn about sacred Hindu worship ceremonies, fire rituals, and their spiritual significance",
    icon: "Flame",
    questions: [
      {
        question: "What is a puja and why is it performed in Hinduism?",
        answer:
          "A puja is a sacred worship ceremony in Hinduism where devotees offer prayers, flowers, fruits, and other items to a deity to seek blessings and express devotion. Puja can be performed daily at home (Nitya Puja) or as special ceremonies (Naimittika Puja) for occasions like festivals, birthdays, or planetary remedies. PariharaOnline offers a wide range of authentic pujas performed by experienced Vedic priests at renowned temples across India.",
      },
      {
        question: "What is a homam or havan and how does it differ from a puja?",
        answer:
          "A homam (also called havan or yajna) is a sacred Vedic fire ritual where offerings such as ghee, herbs, and grains are made into a consecrated fire while chanting specific mantras. While a puja involves worship of a deity through offerings at an altar, a homam channels spiritual energy through Agni (the fire god) who acts as a divine messenger carrying offerings to the gods. Homams are considered particularly powerful for planetary remedies (graha shanti) and removing negative influences.",
      },
      {
        question: "Can a puja be performed remotely on my behalf?",
        answer:
          "Yes, remote pujas (also known as proxy pujas or sankalpa pujas) have been a long-standing tradition in Hinduism. A qualified priest performs the puja at a temple or sacred location on your behalf after taking a sankalpa (sacred intention) with your name, birth star (nakshatram), and gotram. PariharaOnline arranges authentic remote pujas at major temples, and you can watch live-streamed ceremonies and receive consecrated prasadam delivered to your doorstep.",
      },
      {
        question: "How do I choose the right puja for my needs?",
        answer:
          "Choosing the right puja depends on your specific intention, whether it is for prosperity, health, removing obstacles, or planetary remedies. Consulting a Vedic astrologer who can analyze your birth chart (Janma Kundali) is the most reliable way to determine which puja or homam will be most beneficial. PariharaOnline provides personalized puja recommendations based on your horoscope analysis, helping you select the most auspicious ceremony for your situation.",
      },
      {
        question: "What is a sankalpam and why is it important in a puja?",
        answer:
          "Sankalpam is a sacred declaration of intent made at the beginning of any Vedic ritual, where the priest formally states the purpose of the puja, the names of the devotees, their nakshatram (birth star), gotram (lineage), and the specific prayers being offered. It establishes a spiritual connection between the devotee and the divine, making the ritual personally effective. Without a proper sankalpam, a puja is considered incomplete, which is why PariharaOnline collects your details carefully before every ceremony.",
      },
      {
        question:
          "How long does a typical puja or homam take to complete?",
        answer:
          "The duration of a puja or homam varies significantly depending on the type and complexity of the ritual. A simple archana or abhishekam may take 15 to 30 minutes, while elaborate homams like Maha Mrityunjaya Homam or Navagraha Homam can take 2 to 4 hours. Complex multi-day rituals such as Athi Rudram or Sahasra Chandi Homam may span several days. PariharaOnline provides estimated durations for each ceremony on the service page so you can plan accordingly.",
      },
      {
        question:
          "What is prasadam and will I receive it after the puja?",
        answer:
          "Prasadam (also spelled prasad) refers to the sanctified offerings that have been blessed by the deity during the puja, typically including sacred ash (vibhuti), kumkum, flowers, fruits, and sweets. Receiving and consuming prasadam is believed to transfer divine blessings to the devotee. PariharaOnline ships consecrated prasadam worldwide after every puja, carefully packaged with reverence, along with photos or video recordings of the completed ceremony.",
      },
    ],
  },
  {
    slug: "vedic-astrology-basics",
    title: "Vedic Astrology Basics",
    description:
      "Understanding Jyotish Shastra, birth charts, and planetary influences",
    icon: "Star",
    questions: [
      {
        question:
          "What is Vedic astrology and how is it different from Western astrology?",
        answer:
          "Vedic astrology, known as Jyotish Shastra, is an ancient Indian system of astrology that uses the sidereal zodiac (based on fixed star positions) rather than the tropical zodiac used in Western astrology. This creates an approximately 23-degree difference between the two systems, meaning your Vedic sun sign may differ from your Western one. Jyotish places greater emphasis on the Moon sign (Rasi), lunar mansions (Nakshatrams), and planetary periods (Dashas) to provide detailed life predictions and spiritual guidance.",
      },
      {
        question: "What is a Janma Kundali or birth chart?",
        answer:
          "A Janma Kundali (birth chart or horoscope) is a celestial map showing the exact positions of the nine Vedic planets (Navagrahas) at the precise time and location of your birth. It consists of 12 houses (bhavas), each governing different life areas such as career, marriage, health, and finances. The chart is the foundation of all Vedic astrological analysis and is essential for determining dashas, doshas, and suitable parihara remedies.",
      },
      {
        question:
          "What are the Navagrahas (nine planets) in Vedic astrology?",
        answer:
          "The Navagrahas are the nine celestial bodies in Vedic astrology: Surya (Sun), Chandra (Moon), Mangala (Mars), Budha (Mercury), Guru or Brihaspati (Jupiter), Shukra (Venus), Shani (Saturn), Rahu (North Lunar Node), and Ketu (South Lunar Node). Each graha governs specific aspects of life and exerts unique influences based on its placement in your birth chart. When a graha is poorly placed or in a weak position, specific pujas and homams can be performed as parihara (remedies) to mitigate negative effects.",
      },
      {
        question: "What is a dasha period and how does it affect my life?",
        answer:
          "A dasha is a planetary period system unique to Vedic astrology that divides your life into major periods ruled by specific planets. The most commonly used system is Vimshottari Dasha, which spans 120 years and cycles through all nine planets in a fixed sequence. The planet ruling your current dasha period significantly influences your experiences, opportunities, and challenges during that time. Understanding your dasha transitions helps in timing important decisions and identifying when specific parihara rituals may be most beneficial.",
      },
      {
        question: "What does it mean when a planet is exalted or debilitated?",
        answer:
          "A planet is exalted (uchcha) when it occupies the zodiac sign where its positive qualities are strongest, such as Jupiter in Cancer or Sun in Aries, granting powerful beneficial effects. Conversely, a debilitated (neecha) planet is in the sign where it is weakest, like Saturn in Aries or Moon in Scorpio, which can create challenges in the areas that planet governs. However, debilitation can be cancelled (Neechabhanga Raja Yoga) under certain conditions, and specific remedial pujas through PariharaOnline can help strengthen a debilitated planet's positive influence.",
      },
      {
        question: "What are doshas in Vedic astrology?",
        answer:
          "Doshas in Vedic astrology refer to unfavorable planetary combinations or placements in a birth chart that can cause difficulties in specific life areas. Common doshas include Mangal Dosha (Mars affliction affecting marriage), Kaal Sarpa Dosha (Rahu-Ketu axis trapping all planets), Shani Dosha (Saturn's malefic influence), and Pitru Dosha (ancestral karmic debts). Each dosha has specific Vedic remedies including pujas, homams, and charitable acts. PariharaOnline specializes in authentic parihara ceremonies to address these astrological doshas.",
      },
      {
        question:
          "How accurate is Vedic astrology for predicting future events?",
        answer:
          "Vedic astrology is a sophisticated system refined over thousands of years by ancient rishis, and experienced Jyotish practitioners can provide remarkably detailed insights about life patterns, timing of events, and karmic tendencies. Its predictive accuracy depends heavily on the precision of birth data (exact time, date, and place) and the skill of the astrologer interpreting the chart. Rather than viewing predictions as fixed outcomes, Jyotish emphasizes free will and recommends parihara (remedial measures) to navigate planetary influences more favorably.",
      },
    ],
  },
  {
    slug: "nakshatram-and-rasi",
    title: "Nakshatram & Rasi Guide",
    description:
      "Complete guide to the 27 birth stars and 12 zodiac signs in Hindu astrology",
    icon: "Sparkles",
    questions: [
      {
        question: "What are the 27 Nakshatrams (birth stars) in Vedic astrology?",
        answer:
          "The 27 Nakshatrams are lunar mansions that divide the zodiac into equal segments of 13 degrees and 20 minutes each. They are: Ashwini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishta, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, and Revati. Your birth nakshatram is determined by the Moon's position at your exact time of birth and plays a crucial role in determining your personality, compatibility, and auspicious timings for rituals.",
      },
      {
        question: "What are the 12 Rasis (zodiac signs) in Hindu astrology?",
        answer:
          "The 12 Rasis (zodiac signs) in Vedic astrology are Mesha (Aries), Vrishabha (Taurus), Mithuna (Gemini), Karka (Cancer), Simha (Leo), Kanya (Virgo), Tula (Libra), Vrischika (Scorpio), Dhanu (Sagittarius), Makara (Capricorn), Kumbha (Aquarius), and Meena (Pisces). In Jyotish, your Rasi (Moon sign) is considered more important than your Sun sign and is determined by which zodiac sign the Moon occupied at your birth. Each Rasi contains two and a quarter Nakshatrams, creating a detailed framework for astrological analysis.",
      },
      {
        question: "How is my Nakshatram determined and why is it important?",
        answer:
          "Your Nakshatram (birth star) is determined by the precise longitude of the Moon at the exact moment of your birth, which places it within one of the 27 lunar mansions. It is one of the most important factors in Hindu astrology as it influences your personality traits, emotional tendencies, health predispositions, and spiritual inclinations. Your Nakshatram is essential for matching horoscopes for marriage (Nakshatra Porutham), selecting auspicious dates (muhurtham), and performing personalized pujas, which is why PariharaOnline requests this information for all ceremonies.",
      },
      {
        question: "What is the relationship between Nakshatram and Rasi?",
        answer:
          "Each of the 12 Rasis (zodiac signs) contains exactly two and a quarter Nakshatrams, creating a structured mapping between the two systems. For example, Mesha Rasi (Aries) contains Ashwini, Bharani, and the first quarter (pada) of Krittika. The Nakshatram provides a more granular and precise reading than the Rasi alone, as each Nakshatram is further divided into four padas (quarters), each with distinct characteristics. Together, Rasi and Nakshatram form the foundation of personalized Vedic horoscope readings.",
      },
      {
        question: "What are Nakshatram padas and how do they affect predictions?",
        answer:
          "Each of the 27 Nakshatrams is divided into four padas (quarters), creating 108 total divisions of the zodiac, each spanning 3 degrees and 20 minutes. Each pada falls within a specific Navamsa (D-9 chart division) and carries its own subtle characteristics, influencing career aptitudes, relationship patterns, and spiritual tendencies. The pada determines your birth syllable (aksharamala), traditionally used for naming ceremonies (Namakaranam), and refines astrological predictions beyond the Nakshatram level.",
      },
      {
        question:
          "Which Nakshatrams are considered auspicious or inauspicious?",
        answer:
          "In Vedic tradition, Nakshatrams are classified by their nature: Deva (divine) Nakshatrams like Ashwini, Pushya, and Shravana are generally considered auspicious, while Rakshasa (demonic) Nakshatrams like Ashlesha, Mula, and Jyeshtha are considered challenging but powerful. However, no Nakshatram is inherently good or bad as each carries unique strengths. Certain Nakshatrams like Mula, Ashlesha, and Jyeshtha are associated with Gandanta (karmic knots) that may require specific shanti pujas, which PariharaOnline can arrange with qualified priests.",
      },
      {
        question:
          "How does Nakshatram compatibility work for marriage matching?",
        answer:
          "Nakshatram-based marriage compatibility, known as Nakshatra Porutham or Koota matching, evaluates the harmony between two individuals' birth stars across multiple dimensions. The system typically assesses 10 poruthams (compatibility factors) including Dina (health), Gana (temperament), Mahendra (prosperity), Rasi (emotional), and Rajju (marital longevity), among others. A minimum of 6 out of 10 matches is generally recommended, with Rajju Porutham considered non-negotiable for marital wellbeing. PariharaOnline provides detailed compatibility analysis and recommends specific pujas if doshas are found in the matching.",
      },
    ],
  },
  {
    slug: "hindu-festival-calendar",
    title: "Hindu Festival Calendar",
    description:
      "Major Hindu festivals, auspicious dates, and special puja timings",
    icon: "Calendar",
    questions: [
      {
        question:
          "What are the major Hindu festivals celebrated throughout the year?",
        answer:
          "The Hindu calendar features numerous major festivals including Makar Sankranti and Pongal (January), Maha Shivaratri (February-March), Holi (March), Ugadi and Tamil New Year (April), Akshaya Tritiya (April-May), Ganesh Chaturthi (August-September), Navaratri and Durga Puja (September-October), Dussehra (October), Diwali (October-November), and Kartik Purnima (November). Each festival has specific pujas and rituals associated with it. PariharaOnline offers special festival puja packages timed to these auspicious occasions.",
      },
      {
        question: "What is a Panchang and how is it used to determine auspicious dates?",
        answer:
          "A Panchang (also called Panchangam) is the traditional Hindu almanac that tracks five key elements of time: Tithi (lunar day), Vara (weekday), Nakshatram (lunar mansion), Yoga (Sun-Moon angular relationship), and Karana (half of a Tithi). Priests and astrologers consult the Panchang to determine Shubh Muhurtham (auspicious timings) for ceremonies, weddings, housewarming, and other important events. PariharaOnline schedules all pujas based on Panchang calculations to ensure maximum spiritual efficacy.",
      },
      {
        question: "What is the significance of Ekadashi in Hinduism?",
        answer:
          "Ekadashi, the 11th day of each lunar fortnight, is one of the most sacred fasting days in Hinduism, dedicated to Lord Vishnu. There are 24 Ekadashis in a year, each with a unique name and significance, such as Nirjala Ekadashi, Vaikunta Ekadashi, and Mokshada Ekadashi. Observing Ekadashi vrata (fast) is believed to cleanse sins, bring spiritual merit, and help the devotee attain moksha (liberation). Special Vishnu pujas and Satyanarayana Katha are particularly powerful when performed on Ekadashi.",
      },
      {
        question:
          "What is Pradosham and which pujas are performed during it?",
        answer:
          "Pradosham is the auspicious twilight period occurring on the 13th day (Trayodashi) of each lunar fortnight, sacred to Lord Shiva. It falls twice a month, during both the waxing (Shukla Paksha) and waning (Krishna Paksha) phases of the Moon. The Pradosham period, lasting approximately 1.5 hours around sunset, is considered especially powerful for Shiva worship, Rudra Abhishekam, and Mrityunjaya Homam. PariharaOnline offers special Pradosham puja packages at major Shiva temples for devotees seeking Shiva's blessings.",
      },
      {
        question: "Why is Navaratri important and what pujas are performed during the nine nights?",
        answer:
          "Navaratri is a nine-night festival honoring the three forms of the Divine Feminine: Durga (days 1-3 for destruction of evil), Lakshmi (days 4-6 for prosperity), and Saraswati (days 7-9 for wisdom and knowledge). Each night involves specific pujas, chanting of Durga Saptashati or Lalita Sahasranamam, and Kumari Puja. The festival culminates on Vijayadashami (Dasara), symbolizing the victory of good over evil. PariharaOnline arranges elaborate Navaratri Chandi Homam and Kumkum Archana services during this powerful spiritual period.",
      },
      {
        question: "What are Rahu Kalam and Yamagandam and why should they be avoided?",
        answer:
          "Rahu Kalam and Yamagandam are inauspicious time periods that occur daily, calculated based on the day of the week and the local sunrise time. Rahu Kalam (approximately 1.5 hours) is ruled by the shadow planet Rahu and is considered unsuitable for starting new ventures or auspicious activities. Yamagandam, associated with Yama (the lord of death), is similarly avoided for important beginnings. However, Rahu Kalam is actually considered auspicious for propitiating Rahu through specific remedial pujas and visits to Rahu temples.",
      },
      {
        question: "What is the significance of Amavasya and Purnima for pujas?",
        answer:
          "Amavasya (new moon) and Purnima (full moon) are the two most spiritually charged days in the Hindu lunar calendar. Amavasya is especially important for Pitru Tarpanam (ancestral rites), as the veil between the physical and ancestral realms is believed to be thinnest. Purnima is considered ideal for Satyanarayan Puja, Guru worship, and mantras dedicated to the Moon. Specific months add additional significance, such as Thai Amavasya for ancestors and Guru Purnima for spiritual teachers. PariharaOnline offers targeted puja services on both Amavasya and Purnima dates.",
      },
    ],
  },
  {
    slug: "temple-services-online",
    title: "Online Temple Services",
    description:
      "How online puja booking works and what to expect from remote temple services",
    icon: "Building2",
    questions: [
      {
        question: "How does online puja booking work at PariharaOnline?",
        answer:
          "Booking a puja on PariharaOnline is a simple three-step process: first, browse our catalog and select the puja or homam that suits your needs. Second, provide your details including name, nakshatram (birth star), gotram (lineage), and the specific sankalpa (intention) for the puja. Third, complete the payment and choose your preferred date. Our team coordinates with temple priests to perform the puja on the scheduled date, and you receive prasadam delivery along with photos or video recordings of the ceremony.",
      },
      {
        question:
          "At which temples are the pujas performed?",
        answer:
          "PariharaOnline partners with renowned temples across India, including major temples in Tamil Nadu, Andhra Pradesh, Karnataka, Kerala, and other states known for their Vedic traditions. These include temples dedicated to various deities such as Shiva, Vishnu, Devi, Ganesha, Subramanya, and Navagraha temples. Each puja listing specifies the temple where it will be performed, ensuring full transparency about the sacred location of your ceremony.",
      },
      {
        question: "Can I watch the puja being performed live?",
        answer:
          "Yes, PariharaOnline offers live streaming for select puja services, allowing you to witness the ceremony in real time from anywhere in the world. For pujas where live streaming is available, you will receive a private video link before the scheduled ceremony time. Additionally, all pujas are documented through photographs and video recordings that are shared with you after completion, so you have a permanent record of the sacred ceremony performed on your behalf.",
      },
      {
        question:
          "Who performs the pujas and what are their qualifications?",
        answer:
          "All pujas on PariharaOnline are performed by qualified Vedic priests (Vadhyars or Pandits) who have undergone rigorous training in Agama Shastra and Vedic rituals. Many of our priests come from traditional Brahmin lineages with generations of temple service and hold certifications from recognized Vedic institutions or temple authorities. We ensure that every priest follows authentic traditional procedures specific to the deity and temple tradition (sampradaya) for the puja being performed.",
      },
      {
        question: "Can I book a puja for someone else as a gift?",
        answer:
          "Absolutely. Booking a puja on behalf of a family member, friend, or loved one is a meaningful spiritual gift that is fully supported on PariharaOnline. You simply provide the beneficiary's name, nakshatram, gotram, and other required details during booking, and the sankalpa will be taken in their name. The prasadam can be shipped directly to the beneficiary's address, and you can choose to include a personalized message with the delivery.",
      },
      {
        question: "What information do I need to provide when booking a puja?",
        answer:
          "To book a puja on PariharaOnline, you typically need to provide the full name of the devotee(s), their Nakshatram (birth star), Rasi (zodiac sign), Gotram (family lineage), and the specific sankalpa or prayer intention. For planetary remedy pujas, your date, time, and place of birth may also be needed for accurate astrological assessment. If you are unsure of your gotram, the default Kashyapa gotram is traditionally used, and our team can help determine your nakshatram from your birth details.",
      },
      {
        question:
          "What happens if a puja needs to be rescheduled due to temple closures?",
        answer:
          "In rare cases where a temple closure, festival schedule conflict, or unforeseen circumstance affects your booked puja date, PariharaOnline will notify you promptly and reschedule the ceremony to the next auspicious date. Our team consults the Panchang to select an alternative muhurtham that maintains the spiritual efficacy of the ritual. You will receive full communication throughout the process and can request a different date or a full refund if the new schedule does not work for you.",
      },
    ],
  },
  {
    slug: "prasad-delivery-worldwide",
    title: "Prasad Delivery Worldwide",
    description:
      "Shipping sacred prasad internationally with tracking and care",
    icon: "Package",
    questions: [
      {
        question: "Does PariharaOnline ship prasadam internationally?",
        answer:
          "Yes, PariharaOnline ships consecrated prasadam to devotees worldwide, including the United States, Canada, United Kingdom, Australia, Singapore, Malaysia, the Middle East, and Europe. We use reliable international courier services to ensure your sacred prasadam reaches you safely. Shipping times vary by destination, typically ranging from 5 to 15 business days for international deliveries, and all packages are sent with tracking information so you can monitor the delivery status.",
      },
      {
        question: "How is the prasadam packaged for shipping?",
        answer:
          "Prasadam is packaged with the utmost care and reverence to maintain its sanctity during transit. Sacred items like vibhuti (holy ash), kumkum, turmeric, and sacred threads are sealed in clean, food-safe containers and placed in protective packaging. Perishable items like sweets or fruits are packed with appropriate preservation methods for the expected transit time. Each prasadam package is treated as a sacred offering and handled with the same devotion with which it was blessed at the temple.",
      },
      {
        question: "What items are typically included in a prasadam package?",
        answer:
          "A typical prasadam package from PariharaOnline includes vibhuti (sacred ash), kumkum (vermillion), chandanam (sandalwood paste), sacred thread (raksha), blessed flowers or flower petals, turmeric, and temple-specific blessed items. Depending on the puja type, you may also receive sanctified coins, rudraksha beads, or deity-specific items like bilva leaves for Shiva pujas. Every package also includes a certificate confirming the completion of your puja with details of the ceremony.",
      },
      {
        question: "Can I track my prasadam delivery?",
        answer:
          "Yes, once your prasadam has been dispatched after the puja completion, PariharaOnline provides a tracking number and courier details via email and SMS. You can monitor the real-time status of your package through the courier's tracking portal. For domestic Indian deliveries, tracking is updated frequently with expected delivery dates. International shipments include customs tracking so you can follow your prasadam's journey from the temple to your doorstep.",
      },
      {
        question: "Are there any customs restrictions on receiving prasadam internationally?",
        answer:
          "Most prasadam items such as vibhuti, kumkum, sacred threads, and dried items pass through international customs without issues. However, certain countries have restrictions on food items, plant materials, or organic substances. PariharaOnline ensures all internationally shipped prasadam complies with common import regulations and includes appropriate customs declarations. If specific items in your prasadam package face restrictions in your country, our team will adjust the contents and inform you in advance.",
      },
      {
        question: "What if my prasadam package is damaged or lost during shipping?",
        answer:
          "In the unlikely event that your prasadam package is damaged or lost during transit, PariharaOnline will arrange a replacement shipment at no additional cost. Please report any delivery issues within 7 days of the expected delivery date by contacting our support team with your order number and tracking details. We work with our courier partners to investigate the issue and ensure you receive your consecrated prasadam as quickly as possible.",
      },
      {
        question: "How soon after the puja is the prasadam shipped?",
        answer:
          "Prasadam is typically dispatched within 2 to 3 business days after the completion of your puja. This time is needed to carefully collect, bless, and package the sacred items from the temple. For pujas performed at remote temple locations, an additional day or two may be required for the prasadam to reach our dispatch center. You will receive a notification with shipping details once your prasadam package is on its way, along with photographs of the completed puja ceremony.",
      },
    ],
  },
  {
    slug: "payment-and-ordering",
    title: "Payment & Ordering",
    description:
      "Payment methods, currencies, refunds, and the ordering process",
    icon: "CreditCard",
    questions: [
      {
        question: "What payment methods does PariharaOnline accept?",
        answer:
          "PariharaOnline accepts a wide range of payment methods to accommodate devotees worldwide. These include major credit and debit cards (Visa, MasterCard, American Express), UPI payments (Google Pay, PhonePe, Paytm), net banking from Indian banks, and international payment options through Stripe and PayPal. All transactions are processed through secure, PCI-compliant payment gateways to ensure the safety of your financial information.",
      },
      {
        question: "Can I pay in my local currency?",
        answer:
          "Yes, PariharaOnline supports multiple currencies to provide convenience for our global community of devotees. Prices are displayed in Indian Rupees (INR) by default, but you can view pricing in US Dollars (USD), British Pounds (GBP), Euros (EUR), Australian Dollars (AUD), Singapore Dollars (SGD), and other major currencies. The currency conversion is handled automatically at checkout based on current exchange rates provided by our payment processor.",
      },
      {
        question: "Is it safe to make online payments on PariharaOnline?",
        answer:
          "Absolutely. PariharaOnline uses industry-standard SSL encryption and partners with PCI DSS-compliant payment gateways to ensure your financial data is fully protected. We never store your complete credit card details on our servers. All payment processing is handled by trusted third-party providers like Stripe and Razorpay, which employ advanced fraud detection and security protocols to safeguard every transaction.",
      },
      {
        question: "What is the refund policy for booked pujas?",
        answer:
          "PariharaOnline offers a clear refund policy for all puja bookings. If you cancel your booking at least 48 hours before the scheduled puja date, you are eligible for a full refund minus any payment processing fees. Cancellations within 48 hours of the puja may receive a partial refund or credit toward a future booking. Once a puja has been performed, refunds are not available as the sacred ceremony cannot be reversed. Please refer to our refund policy page for complete details.",
      },
      {
        question: "Will I receive a confirmation after placing an order?",
        answer:
          "Yes, upon successfully placing an order on PariharaOnline, you will immediately receive a confirmation email and SMS with your order number, puja details, scheduled date, and payment receipt. A second notification is sent when the puja is performed, including photographs or video links of the ceremony. A third notification follows when your prasadam is dispatched with tracking information. You can also track your order status at any time through your PariharaOnline account dashboard.",
      },
      {
        question: "Can I book multiple pujas in a single order?",
        answer:
          "Yes, PariharaOnline allows you to add multiple pujas to your cart and complete them in a single transaction. This is particularly convenient when you need a combination of remedial pujas such as Navagraha Shanti along with a specific deity puja. Each puja in your order will have its own scheduled date and can be performed at different temples if needed. Bundle discounts may be available for certain combinations of pujas and homams.",
      },
      {
        question: "Do you offer any discounts or subscription plans for regular pujas?",
        answer:
          "PariharaOnline offers special pricing for devotees who wish to perform recurring pujas such as monthly Pradosham Shiva Puja, weekly Satyanarayana Puja, or annual birthday Nakshatra Shanti ceremonies. Subscription plans provide discounted rates compared to individual bookings and ensure your pujas are automatically scheduled on the correct auspicious dates. We also offer seasonal discounts during major festivals like Navaratri, Diwali, and Maha Shivaratri for select puja packages.",
      },
    ],
  },
  {
    slug: "parihara-remedies",
    title: "Parihara (Remedies)",
    description:
      "Spiritual remedies for planetary doshas and life challenges through Vedic rituals",
    icon: "Shield",
    questions: [
      {
        question: "What does Parihara mean in Vedic astrology?",
        answer:
          "Parihara is a Sanskrit term meaning remedy, solution, or corrective measure, and in Vedic astrology it refers to spiritual practices prescribed to mitigate the negative effects of unfavorable planetary positions (graha doshas) in one's horoscope. Pariharas can include specific pujas, homams, mantra chanting (japa), charitable acts (daanam), wearing gemstones, or fasting on particular days. PariharaOnline is named after this concept because our core mission is to make authentic Vedic remedial rituals accessible to devotees worldwide.",
      },
      {
        question: "What is Navagraha Shanti and when is it recommended?",
        answer:
          "Navagraha Shanti is a comprehensive remedial puja that propitiates all nine Vedic planets (Navagrahas) to harmonize their influences in your life. It is recommended when multiple planets are afflicted in your birth chart, during planetary transitions (gochara), or when experiencing a generally challenging period without a single identifiable planetary cause. The ceremony involves specific mantras, offerings, and fire rituals for each of the nine grahas. PariharaOnline offers Navagraha Shanti Homam at dedicated Navagraha temples in Tamil Nadu for maximum efficacy.",
      },
      {
        question: "What remedies are available for Shani (Saturn) dosha?",
        answer:
          "Shani Dosha, caused by an afflicted or poorly placed Saturn in the birth chart, can manifest as delays, obstacles, health issues, and karmic lessons, particularly during Sade Sati (Saturn's 7.5-year transit over the natal Moon) or Ashtama Shani. Vedic remedies include Shani Shanti Puja, Hanuman Chalisa recitation, Til (sesame) oil abhishekam on Saturdays, donating black items, and visiting Shani temples like Shani Shingnapur or Thirunallar. PariharaOnline offers dedicated Shani parihara packages including homam and tailabhishekam at powerful Shani temples.",
      },
      {
        question: "How can I address Rahu and Ketu doshas?",
        answer:
          "Rahu and Ketu doshas arise when these shadow planets (lunar nodes) are adversely positioned in your chart, potentially causing confusion, sudden changes, spiritual crises, or obsessive tendencies. Remedies for Rahu include Rahu Shanti Homam, Durga Puja, visiting Rahu-Ketu temples like Thirunageswaram and Keezhperumpallam, and donating items associated with Rahu such as blue or black cloth. For Ketu, Ganesha Puja, Ketu Shanti Homam, and offering flag-shaped items are traditional pariharas. PariharaOnline arranges these remedial ceremonies at the celebrated Navagraha temples in Tamil Nadu.",
      },
      {
        question: "What is Kaal Sarpa Dosha and how is it remedied?",
        answer:
          "Kaal Sarpa Dosha occurs when all seven classical planets in a birth chart are hemmed between Rahu and Ketu, the two lunar nodes, creating a serpent-like enclosure. This dosha is associated with struggles, delays in success, and a sense of being trapped by circumstances across multiple life areas. The primary remedy is the Kaal Sarpa Dosha Nivaran Puja, traditionally performed at Trimbakeshwar (Nashik), Srikalahasti, or Mahakaleshwar (Ujjain). PariharaOnline offers this specialized homam along with Naga Puja and Sarpa Samskara for comprehensive dosha removal.",
      },
      {
        question: "What is Pitru Dosha and what ceremonies can help resolve it?",
        answer:
          "Pitru Dosha indicates karmic debts owed to one's ancestors (Pitru), often indicated by afflictions to the Sun, Moon, or the 9th house in the birth chart, and can manifest as family discord, fertility issues, or recurring obstacles. The primary remedies include Pitru Tarpanam (ancestor propitiation rituals) especially on Amavasya days and during Pitru Paksha (the 16-day ancestral fortnight), Pind Daan at Gaya, Varanasi, or Rameswaram, and Narayan Bali or Naga Bali ceremonies. PariharaOnline facilitates Pitru Dosha Nivarana Puja and Tarpanam ceremonies at sacred tirthas on your behalf.",
      },
      {
        question: "How long does it take for parihara remedies to show effects?",
        answer:
          "The timeline for experiencing the effects of Vedic parihara remedies varies based on the severity of the dosha, the individual's karmic load, and the sincerity of devotion. Some devotees report feeling lighter and more positive within days of a puja, while deeper planetary afflictions may take weeks or months of sustained remedial practices to show tangible improvements. Vedic tradition recommends combining ritual remedies with personal spiritual practices like mantra japa, meditation, and righteous living (dharmic conduct) for the most effective and lasting results.",
      },
    ],
  },
  {
    slug: "marriage-compatibility",
    title: "Marriage & Compatibility",
    description:
      "Hindu marriage matching, compatibility analysis, and wedding-related pujas",
    icon: "Heart",
    questions: [
      {
        question: "What is horoscope matching for Hindu marriages?",
        answer:
          "Horoscope matching (Kundali Milan or Jathaka Porutham) is a traditional Vedic practice where the birth charts of a prospective bride and groom are compared to assess their compatibility for a harmonious married life. In the North Indian tradition, the Ashtakoot (eight-factor) system evaluates 36 gunas (qualities), while the South Indian tradition uses the Dashakoot (ten-factor) Porutham system. This analysis examines emotional compatibility, physical attraction, financial harmony, family wellbeing, and longevity of the marriage bond.",
      },
      {
        question: "What is Mangal Dosha and how does it affect marriage?",
        answer:
          "Mangal Dosha (also called Manglik Dosha or Kuja Dosha) occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house of a birth chart, and is believed to create challenges in marital harmony including conflicts, delays in marriage, or health issues for the spouse. Approximately 40% of people have some form of Mangal Dosha, and its severity varies significantly based on other planetary factors. Remedies include Mangal Shanti Puja, Kuja Dosha Nivarana Homam, and marrying another Manglik. PariharaOnline offers specialized Mangal Dosha analysis and remedial pujas.",
      },
      {
        question: "What pujas are recommended before a Hindu wedding?",
        answer:
          "Several pujas are traditionally performed before a Hindu wedding to ensure an auspicious and blessed married life. These include Gauri Puja and Kalyanamastu Homam for the bride, Navagraha Shanti for both partners, Sudarshana Homam for removing obstacles, and Ganapathi Homam for an auspicious beginning. If any doshas are identified in the horoscope matching, specific parihara pujas are performed beforehand. PariharaOnline can arrange a complete pre-wedding puja package customized to the couple's astrological requirements.",
      },
      {
        question: "What is the significance of Muhurtham in a Hindu wedding?",
        answer:
          "Muhurtham refers to the auspicious date and time selected for the wedding ceremony, considered one of the most critical aspects of a Hindu marriage. An experienced Vedic astrologer calculates the Muhurtham by analyzing the birth charts of both the bride and groom, the Panchang, planetary transits, and avoiding inauspicious periods like Rahu Kalam and eclipses. The Muhurtham determines the precise moment for tying the mangalsutra or thali, as performing this sacred act at the right celestial alignment is believed to bless the marriage with longevity and prosperity.",
      },
      {
        question:
          "What is Rajju Porutham and why is it considered critical?",
        answer:
          "Rajju Porutham is a compatibility factor in the South Indian marriage matching system that assesses the longevity and safety of the marriage bond. The 27 Nakshatrams are classified into five Rajju groups (Pada, Kati, Nabhi, Kanta, and Siro), representing parts of the body. If both partners' Nakshatrams fall in the same Rajju group, it is considered a mismatch that could bring health or longevity concerns to the husband. Rajju Porutham is often regarded as the most important of all ten poruthams, and if absent, specific parihara pujas are strongly recommended.",
      },
      {
        question:
          "Can parihara pujas help if horoscope matching shows low compatibility?",
        answer:
          "Yes, Vedic tradition provides specific parihara (remedial) measures for couples whose horoscope matching reveals doshas or low compatibility scores. Remedies may include Navagraha Homam, Mangal Dosha Nivarana Puja, Maha Mrityunjaya Japa, and deity-specific pujas depending on the nature of the dosha. In some cases, marrying a peepul tree or a silver/gold idol (symbolic ceremony) is performed before the actual wedding to neutralize specific planetary afflictions. PariharaOnline provides comprehensive pre-marriage dosha analysis with personalized remedy packages.",
      },
    ],
  },
  {
    slug: "health-wellness-rituals",
    title: "Health & Wellness Rituals",
    description:
      "Pujas and homams for health, healing, longevity, and safe childbirth",
    icon: "HeartPulse",
    questions: [
      {
        question:
          "Which pujas are recommended for good health and healing from illness?",
        answer:
          "Several powerful Vedic pujas are traditionally performed for health and healing. The Maha Mrityunjaya Homam, dedicated to Lord Shiva, is the most revered ceremony for overcoming serious illness and promoting longevity. Dhanvantri Puja invokes the divine physician for healing, while Sudarshana Homam removes negative energies affecting health. Ayushya Homam specifically promotes longevity, and Navagraha Shanti addresses health issues arising from planetary afflictions. PariharaOnline offers all these health-focused pujas performed by experienced priests at powerful temples.",
      },
      {
        question: "What is Maha Mrityunjaya Homam and when should it be performed?",
        answer:
          "Maha Mrityunjaya Homam is a sacred fire ritual invoking Lord Shiva through the powerful Maha Mrityunjaya Mantra (the great death-conquering mantra) from the Rig Veda. It is performed to seek divine protection from life-threatening illnesses, accidents, and untimely death, and to promote healing, rejuvenation, and longevity. This homam is especially recommended during serious health crises, before major surgeries, during adverse planetary transits affecting health houses in the horoscope, or on birthdays as a preventive measure for long life.",
      },
      {
        question:
          "Are there specific pujas for safe pregnancy and childbirth?",
        answer:
          "Yes, Hindu tradition prescribes several sacred ceremonies during pregnancy for the wellbeing of both mother and child. Pumsavana (performed in the third month) and Seemantham or Valaikappu (performed in the seventh month) are two of the sixteen Shodasha Samskaras specifically for pregnancy. Santana Gopala Puja dedicated to Lord Krishna ensures the health and safety of the unborn child, while Garbarakshambigai Puja at the famous temple in Thirukarugavur, Tamil Nadu, is renowned for safe childbirth. PariharaOnline can arrange these pregnancy-related pujas at auspicious times.",
      },
      {
        question: "What pujas help with mental health, stress, and anxiety?",
        answer:
          "Vedic traditions offer several spiritual remedies for mental wellbeing and emotional balance. Chandra (Moon) Shanti Puja strengthens the mind and emotional stability, as the Moon governs the mind (manas) in Jyotish. Sudarshana Homam removes negative energies and psychic disturbances, while Saraswati Puja enhances mental clarity and peace. Devi Mahatmyam (Chandi) Parayanam is performed for overall protection and strength. These spiritual practices complement professional mental health care and provide holistic support for emotional wellbeing.",
      },
      {
        question:
          "Which rituals promote longevity according to Vedic tradition?",
        answer:
          "Vedic tradition prescribes several rituals specifically for promoting long and healthy life. Ayushya Homam is the primary ceremony for longevity, ideally performed on birthdays (Janma Nakshatram day). Maha Mrityunjaya Japa (chanting 1.25 lakh repetitions) creates a powerful spiritual shield against untimely death. Shatayu Puja, traditionally performed when a person enters their 60th year (Shashtiabdapurthi), and again at 80 (Sadabhishekam), are milestone ceremonies for continued health. PariharaOnline offers birthday Ayushya Homam packages that include Nakshatra Shanti and Mrityunjaya Japa.",
      },
      {
        question:
          "Can Vedic rituals help with fertility and conceiving a child?",
        answer:
          "Hindu tradition offers several powerful pujas and homams for couples seeking to conceive. Santana Gopala Homam, dedicated to the child form of Lord Krishna, is the most widely performed ceremony for fertility blessings. Putrakameshti Yajna, an ancient Vedic ritual referenced in the Ramayana, is specifically designed for progeny. Naga Dosha Nivarana Puja addresses serpent curses believed to cause fertility challenges, and Atma Lingarchana at Rameshwaram is performed for Puthra Dosham relief. PariharaOnline arranges these fertility-related ceremonies at temples renowned for granting the blessing of children.",
      },
    ],
  },
]
