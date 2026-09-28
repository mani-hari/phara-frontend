// Skeleton of the 100-post plan: clusters, cross-cluster sibling map, and per-post core fields.
// Post tuple: [slug, title, author, audience, intent, primaryKeyword, handles[], query, heading]
export const clusters = [
  { id: "diwali-in-usa", name: "Diwali in the USA", audience: "nri-us", seasonality: "Oct–Nov (Karthika new moon)", primaryKeyword: "how to celebrate diwali in the usa", cross: ["diwali-meaning", "festivals-explained-usa"], posts: [
    ["celebrate-diwali-in-the-usa", "How to Celebrate Diwali in the USA, Weekday and All", "manikandan", "nri-us", "how-to", "how to celebrate diwali in the usa", ["diwali-puja"], "", "Poojas for Diwali"],
    ["diwali-at-the-office", "Diwali at the Office: Sharing the Festival at Work", "manikandan", "nri-us", "how-to", "diwali at work", [], "Lakshmi", "Poojas for Diwali"],
    ["lakshmi-puja-at-home-abroad", "Lakshmi Puja at Home When You Live Abroad", "archana", "nri-us", "how-to", "lakshmi puja at home", ["diwali-puja"], "Lakshmi", "Poojas for Diwali"],
    ["when-is-diwali-in-the-usa", "When Is Diwali in the USA? Why the Date Moves", "hariharan", "nri-us", "informational", "when is diwali in the usa", ["diwali-puja"], "", ""],
  ]},
  { id: "online-puja-usa", name: "Online temple puja from the USA", audience: "nri-us", seasonality: "year-round; peaks before festivals and birthdays", primaryKeyword: "online puja from usa", cross: ["prasadam-usa", "homam-explained"], posts: [
    ["online-puja-from-usa-explained", "Online Puja From the USA: How It Actually Works", "manikandan", "nri-us", "how-to", "online puja from usa", ["maha-ganapathy-homam", "navagraha-homam"], "", ""],
    ["what-is-sankalpam", "What Is Sankalpam? Name, Gotra and Star Explained", "hariharan", "nri-us", "informational", "what is sankalpam", [], "homam", ""],
    ["joining-a-puja-across-time-zones", "Live Puja Online: Joining a Temple Puja From Afar", "archana", "nri-us", "how-to", "live puja online", ["maha-ganapathy-homam"], "", ""],
    ["booking-a-puja-for-parents", "Booking a Puja for Your Parents in India, From Abroad", "manikandan", "nri-us", "how-to", "book puja for parents in india", ["ayushya-homam", "mrityunjaya-homam"], "", ""],
  ]},
  { id: "prasadam-usa", name: "Prasadam delivery to the USA", audience: "nri-us", seasonality: "year-round; festival peaks", primaryKeyword: "prasadam delivery usa", cross: ["online-puja-usa", "ritual-and-mind"], posts: [
    ["prasadam-delivery-to-the-usa", "Prasadam Delivery to the USA: What Arrives and How", "manikandan", "nri-us", "informational", "prasadam delivery usa", ["palani-panchamritham", "shirdi-sai-baba-udi-prasadham"], "", "Prasadam you can order"],
    ["what-to-do-with-prasadam", "What to Do With Prasadam When It Arrives", "archana", "nri-us", "how-to", "what to do with prasadam", ["shirdi-sai-baba-udi-prasadham"], "prasadam", "Prasadam you can order"],
    ["why-prasadam-is-shared", "Why Is Prasad Shared? The Meaning of Prasadam", "hariharan", "nri-us", "story", "why is prasad shared", ["palani-panchamritham"], "", ""],
  ]},
  { id: "satyanarayan-puja", name: "Satyanarayan Puja at home", audience: "nri-us", seasonality: "year-round; full-moon days, housewarmings", primaryKeyword: "satyanarayan puja at home", cross: ["puja-at-home", "griha-pravesh"], posts: [
    ["satyanarayan-puja-at-home", "Satyanarayan Puja at Home: A Simple Guide for the US", "archana", "nri-us", "how-to", "satyanarayan puja at home", ["sudarsana-homam"], "Vishnu", "Poojas for Vishnu"],
    ["satyanarayan-katha-meaning", "Satyanarayan Katha Meaning: What the Stories Teach", "hariharan", "nri-us", "story", "satyanarayan katha meaning", [], "Vishnu", ""],
    ["hosting-satyanarayan-puja-with-friends", "Hosting Satyanarayan Puja for Friends in America", "manikandan", "nri-us", "how-to", "satyanarayan puja in america", ["sudarsana-homam"], "", ""],
  ]},
  { id: "festivals-explained-usa", name: "Explaining Hindu festivals in America", audience: "nri-us", seasonality: "Sep–Mar, peaks before Diwali", primaryKeyword: "explaining diwali to kids", cross: ["diwali-in-usa", "holi"], posts: [
    ["explaining-diwali-to-kids", "Explaining Diwali to Kids: Stories That Stick", "hariharan", "nri-us", "how-to", "explaining diwali to kids", ["annadhanam-donate-food-to-homeless-children"], "", ""],
    ["explaining-hindu-festivals-to-coworkers", "Explaining Hindu Festivals to Coworkers, Simply", "manikandan", "nri-us", "how-to", "explaining hindu festivals to coworkers", [], "Ganesha", ""],
    ["hindu-festival-calendar-usa", "Hindu Festival Calendar in the USA: How It Works", "hariharan", "nri-us", "informational", "hindu festival calendar usa", ["ask-our-astrologer"], "", ""],
    ["festival-rituals-for-kids", "Festival Rituals for Kids: Small Things They Can Do", "archana", "nri-us", "how-to", "festival rituals for kids", ["annadhanam-donate-food-to-homeless-children"], "", ""],
  ]},
  { id: "navratri-usa", name: "Navratri in America", audience: "nri-us", seasonality: "Sep–Oct (Ashwin)", primaryKeyword: "how to celebrate navratri in the usa", cross: ["navratri-meaning"], posts: [
    ["celebrate-navratri-in-the-usa", "How to Celebrate Navratri in the USA", "manikandan", "nri-us", "how-to", "how to celebrate navratri in the usa", ["navratri-poojas-online"], "", "Poojas for Navratri"],
    ["golu-in-a-small-apartment", "Navratri Golu at Home in a Small Apartment", "archana", "nri-us", "how-to", "navratri golu at home", ["navratri-poojas-online"], "Durga", "Poojas for Navratri"],
    ["garba-meaning-the-circle", "Garba Meaning: Why the Dance Moves in a Circle", "hariharan", "nri-us", "story", "garba meaning", ["mantra-chanting-of-700-verses-of-durga-saptashati"], "", ""],
  ]},
  { id: "astrology-real", name: "Is astrology real? Jyotish for sceptics", audience: "seeker", seasonality: "year-round", primaryKeyword: "is astrology real", cross: ["sade-sati", "navagraha-rahu-ketu"], posts: [
    ["is-astrology-real", "Is Astrology Real? An Honest Look at Jyotish", "manikandan", "seeker", "informational", "is astrology real", ["ask-our-astrologer"], "", ""],
    ["vedic-vs-western-astrology", "Vedic vs Western Astrology: What Is Different", "hariharan", "seeker", "comparison", "vedic vs western astrology", ["ask-our-astrologer"], "", ""],
    ["reading-your-birth-chart-calmly", "Reading Your Birth Chart Without Fear", "archana", "seeker", "how-to", "how to read a birth chart", ["career-astrology"], "", ""],
    ["astrology-and-free-will", "Astrology and Free Will: Who Holds the Pen?", "hariharan", "seeker", "informational", "astrology and free will", ["ask-our-astrologer"], "", ""],
  ]},
  { id: "karma-dharma", name: "Karma, dharma and being spiritual", audience: "seeker", seasonality: "year-round", primaryKeyword: "karma explained", cross: ["astrology-real", "pitru-ancestors"], posts: [
    ["karma-explained-simply", "Karma Explained Simply, Without the Guilt", "hariharan", "seeker", "informational", "karma explained", ["annadhanam-donate-food-to-homeless-children"], "", ""],
    ["spiritual-but-not-religious-hinduism", "Spiritual but Not Religious? Hinduism Has Room", "manikandan", "seeker", "informational", "spiritual but not religious hinduism", [], "Ganesha", ""],
    ["dharma-meaning-in-everyday-life", "Dharma Meaning: Duty, Nature and an Ordinary Day", "archana", "seeker", "informational", "dharma meaning", ["annadhanam-donate-food-to-homeless-children"], "", ""],
  ]},
  { id: "mantra-basics", name: "Mantra basics", audience: "seeker", seasonality: "year-round", primaryKeyword: "what is a mantra", cross: ["health-longevity", "maha-shivaratri"], posts: [
    ["what-is-a-mantra", "What Is a Mantra, Actually? Sound and Attention", "archana", "seeker", "informational", "what is a mantra", ["mantra-chanting-of-700-verses-of-durga-saptashati"], "", ""],
    ["om-namah-shivaya-meaning", "Om Namah Shivaya Meaning and How to Chant It", "hariharan", "seeker", "informational", "om namah shivaya meaning", ["maha-shivaratri"], "Shiva", "Poojas for Shiva"],
    ["gayatri-mantra-meaning", "Gayatri Mantra Meaning for an Ordinary Morning", "manikandan", "seeker", "informational", "gayatri mantra meaning", [], "Saraswati", ""],
    ["chanting-for-beginners", "Chanting for Beginners: A Seven-Day Mantra Practice", "archana", "seeker", "how-to", "how to chant a mantra", ["mantra-chanting-of-700-verses-of-durga-saptashati"], "", ""],
  ]},
  { id: "ritual-and-mind", name: "Ritual, meditation and the mind", audience: "seeker", seasonality: "year-round", primaryKeyword: "meditation vs puja", cross: ["mantra-basics", "why-light-lamps"], posts: [
    ["meditation-vs-puja", "Meditation vs Puja: Do You Have to Choose?", "archana", "seeker", "comparison", "meditation vs puja", [], "pooja", ""],
    ["rituals-for-anxious-days", "Rituals for Anxiety: A Small Anchor for Hard Days", "manikandan", "seeker", "how-to", "rituals for anxiety", ["maha-ganapathy-homam"], "", ""],
    ["prasad-and-gratitude", "Prasad and Gratitude: Eating as an Offering", "archana", "seeker", "informational", "prasad and gratitude", ["palani-panchamritham"], "", ""],
    ["why-do-hindus-do-rituals", "Why Do Hindus Do Rituals? The Idea Behind the Act", "hariharan", "seeker", "informational", "why do hindus do rituals", [], "pooja", ""],
  ]},
  { id: "why-light-lamps", name: "Why and how Hindus light lamps", audience: "seeker", seasonality: "year-round; peaks Oct–Nov", primaryKeyword: "why do hindus light lamps", cross: ["karthigai-deepam", "diwali-meaning"], posts: [
    ["why-do-hindus-light-lamps", "Why Do Hindus Light Lamps? The Meaning of the Flame", "hariharan", "seeker", "informational", "why do hindus light lamps", [], "Deepam", ""],
    ["how-to-light-a-diya", "How to Light a Diya at Home: Oil, Wick, Direction", "archana", "seeker", "how-to", "how to light a diya", [], "Lakshmi", ""],
    ["the-dusk-lamp-ritual", "The Dusk Lamp: A Two-Minute Evening Ritual", "manikandan", "seeker", "how-to", "evening lamp ritual", [], "Deepam", ""],
    ["ghee-lamp-or-oil-lamp", "Ghee Lamp or Oil Lamp? What Tradition Says", "archana", "seeker", "comparison", "ghee lamp vs oil lamp", [], "Lakshmi", ""],
  ]},
  { id: "navratri-meaning", name: "Navratri, Ayudha Pooja and Dussehra", audience: "general", seasonality: "Sep–Oct (Ashwin)", primaryKeyword: "navratri meaning", cross: ["navratri-usa", "exams-education"], posts: [
    ["why-navratri-lasts-nine-nights", "Why Navratri Lasts Nine Nights: The Story Behind It", "hariharan", "general", "seasonal", "why navratri is nine nights", ["navratri-poojas-online", "mantra-chanting-of-700-verses-of-durga-saptashati"], "", "Poojas for Navratri"],
    ["ayudha-pooja-meaning", "Ayudha Pooja Meaning: Why We Bless Our Tools", "manikandan", "general", "seasonal", "ayudha pooja meaning", ["saraswati-homam"], "", ""],
    ["navratri-fasting-rules", "Navratri Fasting Rules, Reasons and Kindness", "archana", "general", "how-to", "navratri fasting rules", ["navratri-poojas-online"], "", "Poojas for Navratri"],
    ["dussehra-ravana-story-meaning", "Dussehra Significance: Ravana and What the Burning Means", "hariharan", "general", "story", "dussehra significance", ["mantra-chanting-of-700-verses-of-durga-saptashati"], "Durga", ""],
  ]},
  { id: "diwali-meaning", name: "Diwali meaning and the five days", audience: "general", seasonality: "Oct–Nov (Karthika new moon)", primaryKeyword: "why is diwali celebrated", cross: ["diwali-in-usa", "why-light-lamps"], posts: [
    ["why-is-diwali-celebrated", "Why Is Diwali Celebrated? Four Stories, One Light", "hariharan", "general", "seasonal", "why is diwali celebrated", ["diwali-puja"], "", "Poojas for Diwali"],
    ["five-days-of-diwali", "The Five Days of Diwali, From Dhanteras to Bhai Dooj", "archana", "general", "how-to", "five days of diwali", ["diwali-puja", "dhanwantari-homam"], "", "Poojas for Diwali"],
    ["naraka-chaturdashi-oil-bath", "Naraka Chaturdashi and the Deepavali Oil Bath", "manikandan", "general", "story", "naraka chaturdashi", ["diwali-puja"], "", ""],
  ]},
  { id: "karthigai-deepam", name: "Karthigai Deepam", audience: "general", seasonality: "Nov–Dec (Karthigai full moon)", primaryKeyword: "karthigai deepam significance", cross: ["why-light-lamps", "murugan-skanda"], posts: [
    ["karthigai-deepam-significance", "Karthigai Deepam Significance: The Column of Fire", "hariharan", "general", "seasonal", "karthigai deepam significance", ["maha-shivaratri"], "Shiva", ""],
    ["karthigai-deepam-at-home", "Karthigai Deepam at Home: Lamps in Rows", "archana", "general", "how-to", "karthigai deepam at home", [], "Shiva", ""],
    ["tiruvannamalai-deepam-from-afar", "Tiruvannamalai Deepam, Watched From Far Away", "manikandan", "nri-us", "story", "tiruvannamalai deepam", [], "Shiva", ""],
  ]},
  { id: "murugan-skanda", name: "Skanda Sashti and Thaipusam", audience: "general", seasonality: "Oct–Nov (Skanda Sashti), Jan–Feb (Thaipusam)", primaryKeyword: "skanda sashti", cross: ["karthigai-deepam", "ekadashi-fasting"], posts: [
    ["skanda-sashti-fasting-guide", "Skanda Sashti Fasting: A Gentle Six-Day Guide", "archana", "general", "how-to", "skanda sashti fasting", ["palani"], "Murugan", "Poojas for Murugan"],
    ["soorasamharam-story-meaning", "Soorasamharam Story: What Murugan's Victory Means", "hariharan", "general", "story", "soorasamharam story", ["palani"], "", ""],
    ["thaipusam-kavadi-meaning", "Thaipusam Kavadi Meaning: Carrying What You Carry", "manikandan", "general", "seasonal", "thaipusam kavadi meaning", ["palani-panchamritham", "palani"], "", ""],
  ]},
  { id: "ekadashi-fasting", name: "Vaikunta Ekadashi and fasting", audience: "general", seasonality: "Dec–Jan (Margazhi) and twice monthly", primaryKeyword: "vaikunta ekadashi significance", cross: ["ritual-and-mind", "satyanarayan-puja"], posts: [
    ["vaikunta-ekadashi-significance", "Vaikunta Ekadashi Significance: The Gate That Opens", "hariharan", "general", "seasonal", "vaikunta ekadashi significance", ["sudarsana-homam"], "Vishnu", ""],
    ["ekadashi-fasting-rules", "Ekadashi Fasting Rules for Beginners", "archana", "general", "how-to", "ekadashi fasting rules", [], "Vishnu", ""],
    ["fasting-and-focus", "Fasting and Focus: What an Empty Stomach Teaches", "archana", "seeker", "informational", "fasting and focus", [], "Vishnu", ""],
    ["fasting-with-a-desk-job", "Ekadashi Fasting at Work: A Desk-Job Guide", "manikandan", "nri-us", "how-to", "ekadashi fasting at work", [], "Vishnu", ""],
  ]},
  { id: "pongal-sankranti", name: "Pongal and Makar Sankranti", audience: "general", seasonality: "mid-January (Thai / Makara)", primaryKeyword: "why is pongal celebrated", cross: ["festivals-explained-usa"], posts: [
    ["why-is-pongal-celebrated", "Why Is Pongal Celebrated? Sun, Harvest and Cattle", "hariharan", "general", "seasonal", "why is pongal celebrated", ["temple-coconut-breaking-online"], "", ""],
    ["making-pongal-in-a-us-kitchen", "How to Celebrate Pongal in the USA, Boil-Over and All", "manikandan", "nri-us", "how-to", "how to celebrate pongal in usa", ["annadhanam-donate-food-to-homeless-children"], "", ""],
    ["makar-sankranti-meaning", "Makar Sankranti Meaning: Sun, Sesame and Winter", "archana", "general", "informational", "makar sankranti meaning", ["temple-coconut-breaking-online"], "", ""],
  ]},
  { id: "maha-shivaratri", name: "Maha Shivaratri", audience: "general", seasonality: "Feb–Mar (Magha/Phalguna)", primaryKeyword: "maha shivaratri meaning", cross: ["mantra-basics", "karthigai-deepam"], posts: [
    ["maha-shivaratri-meaning", "Maha Shivaratri Meaning: Why Stay Awake All Night", "hariharan", "general", "seasonal", "maha shivaratri meaning", ["maha-shivaratri"], "", "Poojas for Maha Shivaratri"],
    ["shivaratri-vigil-at-home", "Shivaratri Puja at Home: A Night Vigil, Hour by Hour", "archana", "general", "how-to", "shivaratri puja at home", ["maha-shivaratri", "mrityunjaya-homam"], "", "Poojas for Maha Shivaratri"],
    ["shivaratri-after-a-long-week", "Shivaratri Fasting for Working People, After a Long Week", "manikandan", "general", "story", "shivaratri fasting for working people", ["maha-shivaratri"], "", ""],
  ]},
  { id: "holi", name: "Holi and Holika Dahan", audience: "general", seasonality: "Feb–Mar (Phalguna full moon)", primaryKeyword: "holi meaning", cross: ["festivals-explained-usa"], posts: [
    ["holi-meaning-prahlad-holika", "Holi Meaning: Prahlad, Holika and the Bonfire", "hariharan", "general", "story", "holi meaning", ["sudarsana-homam"], "Vishnu", ""],
    ["holika-dahan-at-home", "Holika Dahan at Home: A Small, Safe Fire Ritual", "archana", "general", "how-to", "holika dahan at home", [], "Vishnu", ""],
    ["holi-in-america", "Holi in America: Colours, Campus and Belonging", "manikandan", "nri-us", "story", "holi in america", [], "Krishna", ""],
  ]},
  { id: "sade-sati", name: "Shani and Sade Sati", audience: "general", seasonality: "year-round; peaks at Saturn transits", primaryKeyword: "shani sade sati remedies", cross: ["navagraha-rahu-ketu", "astrology-real"], posts: [
    ["shani-sade-sati-explained", "Shani Sade Sati Explained, Without the Fear", "hariharan", "general", "informational", "shani sade sati", ["saturn-transit-shani-peyarchi", "navagraha-homam"], "", "Poojas for Shani"],
    ["sade-sati-remedies", "Shani Sade Sati Remedies: Simple, Steady, Practical", "archana", "general", "how-to", "shani sade sati remedies", ["saturn-transit-shani-peyarchi"], "", "Poojas for Shani"],
    ["hanuman-chalisa-on-saturdays", "Hanuman Chalisa on Saturdays: Shani and Strength", "manikandan", "general", "informational", "hanuman chalisa for shani", ["ganesha-hanuman-shakti-kavach-the-shield-of-protection-and-victory"], "", ""],
  ]},
  { id: "navagraha-rahu-ketu", name: "Navagraha, Rahu-Ketu and Guru transits", audience: "general", seasonality: "year-round; peaks at Rahu-Ketu and Jupiter transits", primaryKeyword: "rahu ketu dosha remedies", cross: ["sade-sati", "marriage-delay"], posts: [
    ["rahu-ketu-dosha-explained", "Rahu Ketu Dosha: The Shadow Planets Explained", "hariharan", "general", "informational", "rahu ketu dosha", ["rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple"], "", ""],
    ["kala-sarpa-dosha-meaning", "Kala Sarpa Dosha: What It Means and What Helps", "manikandan", "general", "informational", "kala sarpa dosha", ["rahu-ketu-dosha-parihara-pooja-sarpa-dosha-parihara-pooja-at-sri-kalahasti-temple"], "", ""],
    ["navagraha-temple-worship-guide", "How to Worship the Navagrahas at a Temple", "archana", "general", "how-to", "how to worship navagrahas", ["navagraha-homam"], "", ""],
    ["guru-peyarchi-jupiter-transit", "Guru Peyarchi: What Jupiter's Transit Asks of You", "manikandan", "general", "informational", "guru peyarchi", ["guru-jupiter-transit"], "", "Poojas for Guru"],
  ]},
  { id: "marriage-delay", name: "Delay in marriage and Mangal dosha", audience: "general", seasonality: "year-round", primaryKeyword: "delay in marriage remedies", cross: ["navagraha-rahu-ketu", "astrology-real"], posts: [
    ["delay-in-marriage-remedies", "Delay in Marriage Remedies: A Calm, Honest Guide", "manikandan", "general", "informational", "delay in marriage remedies", ["swayamvara-parvathi-homam", "kanchi-kamakshi"], "", "Poojas for marriage"],
    ["mangal-dosha-explained", "Mangal Dosha Explained: Myths, Maths and Meaning", "hariharan", "general", "informational", "mangal dosha", ["ask-our-astrologer"], "", ""],
    ["swayamvara-parvathi-story", "Swayamvara Parvathi: The Goddess Who Chose", "hariharan", "general", "story", "swayamvara parvathi", ["swayamvara-parvathi-homam"], "", ""],
    ["waiting-for-the-right-match", "Prayer for Marriage While You Wait for the Right Match", "archana", "general", "how-to", "prayer for marriage", ["kanchi-kamakshi"], "", ""],
  ]},
  { id: "conceiving-pregnancy", name: "Prayer for conceiving and safe pregnancy", audience: "general", seasonality: "year-round", primaryKeyword: "pooja for conceiving a baby", cross: ["navagraha-rahu-ketu", "health-longevity"], posts: [
    ["garbarakshambigai-temple-story", "Garbarakshambigai Temple: The Goddess Who Guards the Womb", "hariharan", "general", "story", "garbarakshambigai temple", ["garbharakshambika-ghee", "pregnancy-safe-childbirth-puja"], "", ""],
    ["praying-while-trying-to-conceive", "Pooja for Conceiving: Hope and Patience While Trying", "manikandan", "general", "story", "pooja for conceiving", ["garbharakshambika-ghee"], "", ""],
    ["seemantham-and-valaikappu", "Seemantham and Valaikappu: Rituals of Rest and Care", "archana", "general", "informational", "seemantham and valaikappu", ["garbharakshambika-oil", "pregnancy-safe-childbirth-puja"], "", ""],
  ]},
  { id: "health-longevity", name: "Prayers for health and longevity", audience: "general", seasonality: "year-round; birthdays (Ayushya)", primaryKeyword: "mahamrityunjaya mantra benefits", cross: ["mantra-basics", "conceiving-pregnancy"], posts: [
    ["mahamrityunjaya-mantra-meaning", "Mahamrityunjaya Mantra Meaning, Word by Word", "hariharan", "general", "informational", "mahamrityunjaya mantra meaning", ["mrityunjaya-homam"], "", ""],
    ["praying-for-a-sick-parent", "Prayer for a Sick Parent When You Live Far Away", "manikandan", "nri-us", "story", "prayer for sick parent", ["mrityunjaya-homam", "astrology-health"], "", ""],
    ["dhanvantari-and-healing", "Dhanvantari Homam, Healing and the Body as a Temple", "archana", "general", "informational", "dhanvantari homam", ["dhanwantari-homam", "ayushya-homam"], "", ""],
  ]},
  { id: "griha-pravesh", name: "Griha pravesh and new beginnings", audience: "general", seasonality: "year-round; auspicious months", primaryKeyword: "griha pravesh puja", cross: ["puja-at-home", "satyanarayan-puja"], posts: [
    ["griha-pravesh-puja-steps", "Griha Pravesh Puja Steps for a New Home", "archana", "general", "how-to", "griha pravesh puja", ["maha-ganapathy-homam"], "", ""],
    ["blessing-a-new-home-abroad", "Housewarming Puja in the USA, Rented or Owned", "manikandan", "nri-us", "how-to", "housewarming puja usa", ["maha-ganapathy-homam", "temple-coconut-breaking-online"], "", ""],
    ["why-ganesha-comes-first", "Why Ganesha Is Worshipped First at Every Beginning", "hariharan", "general", "story", "why ganesha is worshipped first", ["maha-ganapathy-homam", "brahmavidyaganapati"], "", ""],
  ]},
  { id: "exams-education", name: "Exams, studies and learning", audience: "general", seasonality: "Feb–May exam season; Saraswati Puja in Navratri", primaryKeyword: "pooja for exam success", cross: ["navratri-meaning", "mantra-basics"], posts: [
    ["prayer-before-exams", "Prayer Before Exams: A Calm Ritual for Students", "archana", "general", "how-to", "prayer before exams", ["saraswati-homam", "hayagreeva-homam"], "", ""],
    ["saraswati-and-hayagriva", "God of Education in Hinduism: Saraswati and Hayagriva", "hariharan", "general", "story", "god of education hinduism", ["hayagreeva-homam", "saraswati-homam"], "", ""],
    ["exam-season-for-parents", "Prayer for Your Child's Exam: Worry, Faith and Tea", "manikandan", "general", "story", "prayer for child's exam", ["saraswati-homam"], "", ""],
  ]},
  { id: "pitru-ancestors", name: "Ancestors, pitru dosha and tarpanam", audience: "general", seasonality: "Sep–Oct (Pitru Paksha) and every new moon", primaryKeyword: "pitru dosha remedies", cross: ["karma-dharma", "homam-explained"], posts: [
    ["pitru-dosha-explained", "Pitru Dosha Explained: Ancestors, Debt and Love", "hariharan", "general", "informational", "pitru dosha", ["tila-homam-at-rameswaram"], "", ""],
    ["pitru-paksha-for-nri-families", "Pitru Paksha for NRI Families: Honouring Ancestors Abroad", "manikandan", "nri-us", "how-to", "pitru paksha for nri", ["tila-homam-at-rameswaram", "annadhanam-donate-food-to-homeless-children"], "", ""],
    ["tarpanam-at-home", "Tarpanam at Home: A Simple Offering to Ancestors", "archana", "general", "how-to", "tarpanam at home", ["tila-homam-at-rameswaram"], "", ""],
    ["tila-homam-at-rameswaram-meaning", "Tila Homam at Rameswaram: Why Sesame and the Sea", "hariharan", "general", "informational", "tila homam", ["tila-homam-at-rameswaram"], "", ""],
  ]},
  { id: "puja-at-home", name: "Puja at home basics", audience: "general", seasonality: "year-round", primaryKeyword: "puja at home step by step", cross: ["why-light-lamps", "homam-explained"], posts: [
    ["puja-at-home-step-by-step", "Puja at Home, Step by Step for Beginners", "archana", "general", "how-to", "puja at home step by step", ["maha-ganapathy-homam"], "", ""],
    ["small-puja-corner-apartment", "A Small Puja Corner for an Apartment", "manikandan", "seeker", "how-to", "small puja corner apartment", [], "Ganesha", ""],
    ["sixteen-steps-of-puja", "Shodashopachara Puja: The 16 Steps of Hosting God", "hariharan", "general", "informational", "shodashopachara puja", [], "pooja", ""],
    ["five-minute-daily-puja", "Daily Puja at Home: A Five-Minute Routine for Mornings", "manikandan", "general", "how-to", "daily puja at home", [], "Ganesha", ""],
  ]},
  { id: "homam-explained", name: "Homams explained", audience: "general", seasonality: "year-round", primaryKeyword: "what is a homam", cross: ["online-puja-usa", "puja-at-home"], posts: [
    ["what-is-a-homam", "What Is a Homam? The Fire Ritual Explained", "hariharan", "general", "informational", "what is a homam", ["maha-ganapathy-homam", "sudarsana-homam"], "", ""],
    ["homam-vs-puja", "Homam vs Puja: What Is the Difference?", "archana", "general", "comparison", "homam vs puja", ["navagraha-homam"], "homam", ""],
    ["homam-and-letting-go", "Homam Benefits: What the Fire Teaches About Letting Go", "manikandan", "general", "story", "homam benefits", ["sudarsana-homam", "mrityunjaya-homam"], "", ""],
  ]},
];

// Extras (owner update): 20–30 additional posts. Tuple adds cluster id first.
// [cluster, slug, title, author, audience, intent, primaryKeyword, handles[], query, heading]
export const extras = [
  ["diwali-meaning", "kolam-and-rangoli-meaning", "Kolam and Rangoli Meaning: Drawing at the Doorstep", "hariharan", "general", "informational", "rangoli meaning", [], "Lakshmi", ""],
  ["diwali-meaning", "bhai-dooj-meaning", "Bhai Dooj Meaning: Yama, Yamuna and Siblings", "hariharan", "general", "story", "bhai dooj meaning", ["ayushya-homam"], "", ""],
  ["navratri-meaning", "kanya-puja-meaning", "Kanya Puja Meaning: Honouring Girls in Navratri", "manikandan", "general", "informational", "kanya puja meaning", ["navratri-poojas-online"], "", ""],
  ["navratri-meaning", "durga-saptashati-for-beginners", "Durga Saptashati for Beginners: How to Begin", "archana", "general", "how-to", "durga saptashati for beginners", ["mantra-chanting-of-700-verses-of-durga-saptashati"], "", ""],
  ["exams-education", "vidyarambham-first-letters", "Vidyarambham: A Child's First Letters in Rice", "manikandan", "general", "story", "vidyarambham", ["saraswati-homam"], "", ""],
  ["puja-at-home", "tulsi-plant-indoors", "Keeping a Tulsi Plant Indoors in a Cold Climate", "archana", "nri-us", "how-to", "tulsi plant indoors", [], "Vishnu", ""],
  ["puja-at-home", "puja-items-list-for-home", "Puja Items List for a Home Altar Abroad", "archana", "nri-us", "how-to", "puja items list", [], "pooja", ""],
  ["griha-pravesh", "namakaranam-in-america", "Hindu Naming Ceremony in America: Namakaranam", "manikandan", "nri-us", "how-to", "hindu naming ceremony", ["ayushya-homam"], "", ""],
  ["health-longevity", "ayushya-homam-star-birthday", "Ayushya Homam: Celebrating a Birthday by the Star", "hariharan", "general", "informational", "ayushya homam", ["ayushya-homam"], "", ""],
  ["navagraha-rahu-ketu", "rahu-kalam-explained", "Rahu Kalam Explained: Should You Avoid It?", "manikandan", "seeker", "informational", "rahu kalam", ["navagraha-homam"], "", ""],
  ["astrology-real", "what-is-a-muhurtham", "What Is a Muhurtham? Choosing an Auspicious Time", "hariharan", "seeker", "informational", "what is muhurtham", ["ask-our-astrologer"], "", ""],
  ["griha-pravesh", "sankatahara-chaturthi-fast", "Sankatahara Chaturthi: The Monthly Ganesha Fast", "archana", "general", "how-to", "sankatahara chaturthi", ["brahmavidyaganapati"], "", ""],
  ["maha-shivaratri", "pradosham-meaning", "Pradosham Meaning: The Twilight Hour for Shiva", "hariharan", "general", "informational", "pradosham meaning", ["maha-shivaratri"], "Shiva", ""],
  ["pitru-ancestors", "amavasya-and-ancestors", "Amavasya Significance: Why the New Moon Is for Ancestors", "manikandan", "general", "informational", "amavasya significance", ["tila-homam-at-rameswaram"], "", ""],
  ["pitru-ancestors", "when-a-parent-dies-abroad", "When a Parent Dies in India and You Live Abroad", "manikandan", "nri-us", "how-to", "when a parent dies in india", ["tila-homam-at-rameswaram", "annadhanam-donate-food-to-homeless-children"], "", ""],
  ["karma-dharma", "drishti-evil-eye-meaning", "Evil Eye in Hinduism: What Tradition Says About Drishti", "hariharan", "seeker", "informational", "evil eye in hinduism", ["ganesha-hanuman-shakti-kavach-the-shield-of-protection-and-victory"], "", ""],
  ["puja-at-home", "vastu-for-apartments", "Vastu for Apartments: What Matters, What Doesn't", "archana", "seeker", "how-to", "vastu for apartments", [], "Ganesha", ""],
  ["homam-explained", "sudarshana-homam-meaning", "Sudarshana Homam Meaning: The Wheel That Protects", "hariharan", "general", "informational", "sudarshana homam meaning", ["sudarsana-homam"], "", ""],
  ["karma-dharma", "annadhanam-feeding-as-worship", "Annadhanam Meaning: Why Feeding People Is Worship", "manikandan", "general", "informational", "annadhanam meaning", ["annadhanam-donate-food-to-homeless-children"], "", ""],
  ["murugan-skanda", "six-abodes-of-murugan", "The Six Abodes of Murugan: Arupadai Veedu", "hariharan", "general", "informational", "arupadai veedu", ["palani"], "Murugan", ""],
  ["ekadashi-fasting", "margazhi-month-meaning", "Margazhi Month Meaning: Dawn, Kolam and Song", "manikandan", "general", "seasonal", "margazhi month meaning", [], "Vishnu", ""],
  ["mantra-basics", "simple-mantras-for-kids", "Simple Mantras for Kids at Bedtime", "archana", "nri-us", "how-to", "mantras for kids", ["saraswati-homam"], "", ""],
  ["festivals-explained-usa", "explaining-a-hindu-wedding", "Hindu Wedding Rituals Explained for Your Guests", "manikandan", "nri-us", "how-to", "hindu wedding rituals explained", ["maha-ganapathy-homam"], "", ""],
  ["ritual-and-mind", "manifesting-vs-sankalpa", "Manifesting vs Sankalpa: Intention in Hinduism", "archana", "seeker", "comparison", "manifesting vs sankalpa", [], "Ganesha", ""],
  ["ritual-and-mind", "brahma-muhurta-waking-early", "Brahma Muhurta Benefits: Is Waking Before Dawn Worth It?", "archana", "seeker", "informational", "brahma muhurta benefits", [], "pooja", ""],
];
