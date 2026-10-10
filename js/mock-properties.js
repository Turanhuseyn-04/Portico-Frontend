"use strict";

const MOCK_POLICIES = {
  Hotel: {
    checkIn: "From 15:00 to 23:00",
    checkOut: "Until 11:00",
    children: "Children of any age are welcome. Cots are free for children under 3, on request.",
    age: "No age restriction for check-in.",
    pets: "Pets are not allowed.",
    quiet: "Quiet hours run from 22:00 to 07:00.",
    payment: "Visa, Mastercard and American Express. You pay at the property.",
    minNights: 1
  },
  Resort: {
    checkIn: "From 15:00 to 22:00",
    checkOut: "Until 11:00",
    children: "Children of any age are welcome. Extra beds are available in suites that sleep 3.",
    age: "No age restriction for check-in.",
    pets: "Pets are not allowed.",
    quiet: "The pool closes at 20:00. Quiet hours run from 23:00 to 08:00.",
    payment: "Visa, Mastercard and American Express. You pay at the property.",
    minNights: 1
  },
  Apartment: {
    checkIn: "From 16:00, self check-in with a key code",
    checkOut: "Until 10:00",
    children: "Children are welcome. A travel cot is available on request.",
    age: "The main guest must be 21 or older.",
    pets: "Small pets are allowed on request, free of charge.",
    quiet: "No parties or events. Quiet hours run from 22:00 to 08:00.",
    payment: "Visa and Mastercard. You pay at the property.",
    minNights: 1
  },
  Villa: {
    checkIn: "From 15:00, the host meets you at the door",
    checkOut: "Until 11:00",
    children: "Children of any age are welcome. The whole house is yours.",
    age: "The main guest must be 25 or older.",
    pets: "Pets are not allowed.",
    quiet: "No parties or events. Neighbours are close.",
    payment: "Visa and Mastercard, or bank transfer before arrival.",
    minNights: 2
  }
};

const MOCK_AMENITY_GROUPS = {
  Hotel: [
    { name: "Bathroom", items: ["Private bathroom", "Rain shower", "Hairdryer", "Free toiletries", "Towels"] },
    { name: "Bedroom", items: ["Linen", "Wardrobe", "Blackout curtains", "Air conditioning"] },
    { name: "Food & drink", items: ["Breakfast room", "Bar", "Coffee and tea maker"] },
    { name: "Internet", items: ["Free WiFi in all areas"] },
    { name: "Services", items: ["24-hour front desk", "Luggage storage", "Daily housekeeping"] },
    { name: "Safety & security", items: ["Key card access", "Smoke alarms", "Safe"] }
  ],
  Resort: [
    { name: "Pool & wellness", items: ["Outdoor pool", "Sun loungers", "Spa", "Massage on request"] },
    { name: "Bathroom", items: ["Private bathroom", "Bathtub", "Bathrobes", "Free toiletries"] },
    { name: "Food & drink", items: ["Restaurant", "Pool bar", "Breakfast buffet", "Room service"] },
    { name: "Internet", items: ["Free WiFi in all areas"] },
    { name: "Services", items: ["24-hour front desk", "Airport shuttle (paid)", "Daily housekeeping", "Concierge"] },
    { name: "Parking", items: ["Private parking on site, €20 per day"] }
  ],
  Apartment: [
    { name: "Kitchen", items: ["Full kitchen", "Oven and hob", "Fridge", "Coffee machine", "Kitchenware"] },
    { name: "Living area", items: ["Sofa", "Dining table", "Work desk"] },
    { name: "Bathroom", items: ["Private bathroom", "Shower", "Hairdryer", "Towels"] },
    { name: "Laundry", items: ["Washing machine", "Drying rack", "Iron"] },
    { name: "Internet", items: ["Free WiFi"] },
    { name: "Access", items: ["Self check-in", "Key code entry"] }
  ],
  Villa: [
    { name: "Whole house", items: ["Private entrance", "Several bedrooms", "Living room", "Dining area"] },
    { name: "Kitchen", items: ["Full kitchen", "Oven and hob", "Dishwasher", "Coffee machine"] },
    { name: "Outdoors", items: ["Terrace", "Outdoor furniture"] },
    { name: "Bathroom", items: ["Two bathrooms", "Bathtub", "Towels", "Hairdryer"] },
    { name: "Laundry", items: ["Washing machine", "Iron"] },
    { name: "Internet", items: ["Free WiFi"] }
  ]
};

const MOCK_PROPERTIES = [
  {
    id: "marble",
    name: "The Marble Court",
    type: "Hotel",
    stars: 4,
    address: { street: "Rua Garrett 42", area: "Chiado", city: "Lisbon", postcode: "1200-204", country: "Portugal" },
    location: { lat: 38.7107, lng: -9.1421 },
    score: 9.4,
    reviewCount: 186,
    scores: { Staff: 9.6, Facilities: 9.1, Cleanliness: 9.5, Comfort: 9.4, "Value for money": 8.9, Location: 9.7, "Free WiFi": 9 },
    summary: "A stone hotel behind a working portico, one street up from the river.",
    description: [
      "The Marble Court sits behind a nineteenth-century portico in Chiado, a short walk uphill from the Tagus. Twenty-two rooms open onto a quiet internal courtyard, where breakfast is served under the orange trees from 07:30.",
      "Rooms keep to stone, oak and linen: blackout curtains, a proper desk, rain showers and windows that open. The rooftop terrace looks across the Baixa roofs to the castle, and the bar downstairs pours Portuguese wine by the glass until midnight.",
      "Tram 28 stops at the corner, Baixa-Chiado metro is a four-minute walk, and the river walk starts two streets away."
    ],
    highlights: [
      { icon: "pin", title: "Top location", text: "Guests rate the location 9.7. Chiado, the river and the metro are all on foot." },
      { icon: "breakfast", title: "Breakfast in the courtyard", text: "Included on selected rooms, served 07:30–10:30 under the orange trees." },
      { icon: "terrace", title: "Rooftop terrace", text: "Open to guests until 22:00, with a view to São Jorge Castle." }
    ],
    popular: ["wifi", "breakfast", "ac", "terrace", "bar", "desk", "elevator", "nonsmoking"],
    amenityGroups: [
      { name: "Bathroom", items: ["Private bathroom", "Rain shower", "Bathtub in suites", "Hairdryer", "Organic toiletries", "Bathrobes"] },
      { name: "Bedroom", items: ["Linen", "Wardrobe", "Blackout curtains", "Air conditioning", "Soundproofed windows"] },
      { name: "Food & drink", items: ["Breakfast in the courtyard", "Wine bar until 00:00", "Nespresso machine", "Minibar"] },
      { name: "Outdoors", items: ["Rooftop terrace", "Courtyard with orange trees", "Courtyard pool"] },
      { name: "Internet", items: ["Free WiFi in all areas, 300 Mbps"] },
      { name: "Services", items: ["24-hour front desk", "Concierge", "Luggage storage", "Daily housekeeping", "Laundry (paid)"] },
      { name: "Accessibility", items: ["Lift to all floors", "Step-free entrance"] },
      { name: "Safety & security", items: ["Key card access", "Smoke alarms", "Safe in every room", "CCTV at the entrance"] }
    ],
    gallery: [
      { src: "assets/lisbon.jpg", alt: "The courtyard pool at dusk, lined with palm trees" },
      { src: "assets/property/room-superior.jpg", alt: "Superior King Room with a dark oak headboard" },
      { src: "assets/property/room-classic.jpg", alt: "Classic Double Room with a reading lamp" },
      { src: "assets/marrakech.jpg", alt: "Deluxe Courtyard Suite with a sitting area" },
      { src: "assets/property/bathroom.jpg", alt: "Stone bathroom with a freestanding bath" },
      { src: "assets/property/breakfast.jpg", alt: "Breakfast served in the courtyard" },
      { src: "assets/property/restaurant.jpg", alt: "The wine bar and dining room" },
      { src: "assets/property/dining.jpg", alt: "Dinner at the bar" },
      { src: "assets/porto.jpg", alt: "Loungers on the rooftop terrace" },
      { src: "assets/property/pool-deck.jpg", alt: "The pool deck in the morning" },
      { src: "assets/property/room-twin.jpg", alt: "Superior Twin Room" },
      { src: "assets/property/room-loft.jpg", alt: "Rooftop Loft Suite under the eaves" }
    ],
    rooms: [
      { id: "classic", name: "Classic Double Room", image: "assets/property/room-classic.jpg", size: 18, beds: "1 double bed", sleeps: 2, price: 242, refundable: true, breakfast: false, inventory: 6, demand: 0.04, features: ["City view", "Air conditioning", "Rain shower", "Work desk", "Free WiFi"] },
      { id: "twin", name: "Superior Twin Room", image: "assets/property/room-twin.jpg", size: 22, beds: "2 single beds", sleeps: 2, price: 268, refundable: true, breakfast: true, inventory: 4, demand: 0.05, features: ["Courtyard view", "Air conditioning", "Rain shower", "Nespresso machine", "Free WiFi"] },
      { id: "superior", name: "Superior King Room", image: "assets/property/room-superior.jpg", size: 24, beds: "1 king bed", sleeps: 2, price: 289, refundable: false, breakfast: false, inventory: 3, demand: 0.05, features: ["Street view", "Blackout curtains", "Minibar", "Rain shower", "Free WiFi"] },
      { id: "suite", name: "Deluxe Courtyard Suite", image: "assets/marrakech.jpg", size: 38, beds: "1 king bed and 1 sofa bed", sleeps: 3, price: 342, refundable: true, breakfast: true, inventory: 2, demand: 0.08, features: ["Courtyard view", "Separate sitting area", "Bathtub", "Nespresso machine", "Free WiFi"] },
      { id: "loft", name: "Rooftop Loft Suite", image: "assets/property/room-loft.jpg", size: 46, beds: "1 king bed and 1 sofa bed", sleeps: 3, price: 398, refundable: true, breakfast: true, inventory: 1, demand: 0.12, features: ["Castle view", "Private terrace", "Bathtub", "Minibar", "Free WiFi"] }
    ],
    nearby: [
      { group: "What's nearby", items: [["Praça Luís de Camões", "150 m"], ["Livraria Bertrand", "200 m"], ["Elevador de Santa Justa", "450 m"], ["Praça do Comércio", "800 m"], ["São Jorge Castle", "1.4 km"]] },
      { group: "Restaurants & cafés", items: [["Café A Brasileira", "120 m"], ["Manteigaria (pastéis de nata)", "180 m"], ["Time Out Market", "1.1 km"]] },
      { group: "Getting around", items: [["Tram 28 stop", "100 m"], ["Baixa-Chiado metro", "300 m"], ["Cais do Sodré station", "900 m"], ["Lisbon Airport", "8 km"]] }
    ],
    reviews: [
      { author: "Ivo P.", country: "Croatia", traveller: "Couple", roomId: "suite", nights: 3, date: "2026-09-14", score: 9.6, title: "The photo was the room", liked: "The photo was the room. That is rarer than the big sites admit. The courtyard is silent at night, and breakfast under the orange trees was the best part of the trip.", disliked: "The lift is small: fine for two, a squeeze with luggage." },
      { author: "Marta K.", country: "Poland", traveller: "Solo traveller", roomId: "classic", nights: 4, date: "2026-09-02", score: 9.2, title: "Quiet, central and honest", liked: "Five minutes from everything and still quiet. The price I saw was the price I paid.", disliked: "The Classic room is compact. I would book the twin next time for the extra space." },
      { author: "James W.", country: "United Kingdom", traveller: "Business", roomId: "superior", nights: 2, date: "2026-08-21", score: 8.8, title: "A real desk and fast WiFi", liked: "A proper desk, a good chair and WiFi that held up on video calls. Staff printed my boarding pass without being asked twice.", disliked: "The non-refundable rate stung when my meeting moved." },
      { author: "Ana & Rui", country: "Brazil", traveller: "Couple", roomId: "loft", nights: 5, date: "2026-08-09", score: 10, title: "Book the loft", liked: "The loft terrace at sunset, with the castle lit up, is worth the stairs. Spotless, calm and generous with the little things.", disliked: "Nothing at all." },
      { author: "Claire D.", country: "France", traveller: "Family", roomId: "suite", nights: 4, date: "2026-07-27", score: 9.4, title: "Easy with two children", liked: "The sofa bed was already made when we arrived and the staff found a step stool for the bathroom. Breakfast had something for everyone.", disliked: "The pool is small, so go early in summer." },
      { author: "Kenji T.", country: "Japan", traveller: "Couple", roomId: "twin", nights: 3, date: "2026-07-12", score: 9, title: "Calm courtyard, good coffee", liked: "The courtyard room was the quietest we had in Portugal. Good coffee machine in the room.", disliked: "Twin beds cannot be pushed together." },
      { author: "Sofia L.", country: "Italy", traveller: "Group", roomId: "twin", nights: 2, date: "2026-06-30", score: 8.6, title: "Great base for a weekend", liked: "The location is perfect for a weekend: bars, the river and the tram all on foot.", disliked: "Some street noise on Friday night with the windows open." },
      { author: "Daniel M.", country: "Germany", traveller: "Solo traveller", roomId: "classic", nights: 2, date: "2026-06-18", score: 9.4, title: "Would stay again", liked: "Kind staff, very clean, and the rooftop is a lovely place to read in the evening.", disliked: "Breakfast is not included in the Classic room." }
    ]
  },
  {
    id: "screens",
    name: "House of Paper Screens",
    type: "Hotel",
    stars: 3,
    address: { street: "Hanamikoji-dori 118", area: "Gion", city: "Kyoto", postcode: "605-0074", country: "Japan" },
    location: { lat: 35.003, lng: 135.775 },
    score: 9.1,
    reviewCount: 143,
    scores: { Staff: 9.4, Facilities: 8.7, Cleanliness: 9.5, Comfort: 9, "Value for money": 8.8, Location: 9.6, "Free WiFi": 8.6 },
    summary: "A small hotel with paper screens and a cedar bath down the hall.",
    description: [
      "Eleven rooms in a restored townhouse on Hanamikoji, the lane that runs through the heart of Gion. Paper screens slide back onto a moss garden, and a cedar bathhouse is open to guests every evening.",
      "Breakfast is a tray of rice, grilled fish and pickles, or eggs and toast if you prefer. The tea room stays open until 22:00."
    ],
    highlights: [
      { icon: "pin", title: "In the middle of Gion", text: "Yasaka Shrine and the Kamo river are both within a ten-minute walk." },
      { icon: "bath", title: "Cedar bathhouse", text: "Book a private 40-minute slot at the front desk, free for guests." },
      { icon: "garden", title: "Moss garden", text: "Every room opens onto the garden or the lane." }
    ],
    popular: ["wifi", "breakfast", "ac", "garden", "bath", "nonsmoking", "desk"],
    gallery: [
      { src: "assets/kyoto.jpg", alt: "Garden Room with screens open to the trees" },
      { src: "assets/property/room-double.jpg", alt: "Cedar Room with dark wood panelling" },
      { src: "assets/property/bathroom.jpg", alt: "The deep bath in the bathhouse" },
      { src: "assets/property/breakfast.jpg", alt: "Breakfast tray" },
      { src: "assets/property/restaurant.jpg", alt: "The tea room in the evening" }
    ],
    rooms: [
      { id: "garden", name: "Garden Room", image: "assets/kyoto.jpg", size: 16, beds: "1 double futon bed", sleeps: 2, price: 198, refundable: true, breakfast: false, inventory: 4, demand: 0.06, features: ["Garden view", "Air conditioning", "Shared bathhouse", "Free WiFi"] },
      { id: "cedar", name: "Cedar Room", image: "assets/property/room-double.jpg", size: 20, beds: "1 double bed", sleeps: 2, price: 236, refundable: true, breakfast: true, inventory: 3, demand: 0.08, features: ["Lane view", "Private bathroom", "Air conditioning", "Free WiFi"] }
    ],
    nearby: [
      { group: "What's nearby", items: [["Hanamikoji lane", "0 m"], ["Yasaka Shrine", "550 m"], ["Kennin-ji Temple", "400 m"], ["Kamo river", "750 m"]] },
      { group: "Restaurants & cafés", items: [["Gion Kinana", "200 m"], ["Nishiki Market", "1.3 km"]] },
      { group: "Getting around", items: [["Gion-Shijo station", "650 m"], ["Kyoto Station", "3.4 km"], ["Kansai Airport", "97 km"]] }
    ],
    reviews: [
      { author: "Hana R.", country: "South Korea", traveller: "Couple", roomId: "garden", nights: 3, date: "2026-09-20", score: 9.4, title: "The garden in the morning", liked: "Waking up with the screens open onto the moss garden. The bathhouse slot at night was magic.", disliked: "Futons are firm, as expected." },
      { author: "Tom B.", country: "Australia", traveller: "Solo traveller", roomId: "cedar", nights: 4, date: "2026-08-15", score: 9, title: "Perfect location", liked: "Gion on the doorstep and still quiet at night.", disliked: "The room is small for big suitcases." },
      { author: "Lucía G.", country: "Spain", traveller: "Couple", roomId: "cedar", nights: 2, date: "2026-07-04", score: 8.8, title: "Lovely staff", liked: "The staff drew us a map of the best early-morning walks.", disliked: "Breakfast ends at 09:30." }
    ]
  },
  {
    id: "atelier",
    name: "The North Atelier",
    type: "Apartment",
    address: { street: "Jægersborggade 21", area: "Nørrebro", city: "Copenhagen", postcode: "2200", country: "Denmark" },
    location: { lat: 55.6929, lng: 12.5491 },
    score: 8.8,
    reviewCount: 97,
    scores: { Staff: 9, Facilities: 8.6, Cleanliness: 9.1, Comfort: 8.8, "Value for money": 8.4, Location: 9.2, "Free WiFi": 9.3 },
    summary: "A studio with a work table, a good lamp, and a quiet courtyard.",
    description: [
      "Two studio apartments above a ceramics workshop on Jægersborggade, one of Nørrebro's most loved streets. Each has a full kitchen, a long oak work table and windows over a planted courtyard.",
      "Check-in is by key code, and the host lives two streets away. Bikes are included, so the lakes and the city centre are ten minutes away."
    ],
    highlights: [
      { icon: "workspace", title: "Made for working", text: "A two-metre oak table, a proper chair and fibre WiFi." },
      { icon: "bike", title: "Bikes included", text: "Two city bikes with locks, free for the whole stay." },
      { icon: "kitchen", title: "Full kitchen", text: "Oven, hob, dishwasher and the good coffee from downstairs." }
    ],
    popular: ["wifi", "kitchen", "workspace", "washer", "bike", "nonsmoking"],
    gallery: [
      { src: "assets/copenhagen.jpg", alt: "Studio Apartment bedroom with warm lamps" },
      { src: "assets/apartment.jpg", alt: "Courtyard Studio living area with plants" },
      { src: "assets/property/kitchen.jpg", alt: "The kitchen" },
      { src: "assets/property/bathroom.jpg", alt: "The bathroom" }
    ],
    rooms: [
      { id: "studio", name: "Studio Apartment", image: "assets/copenhagen.jpg", size: 32, beds: "1 double bed", sleeps: 2, price: 176, refundable: true, breakfast: false, inventory: 1, demand: 0.07, features: ["Full kitchen", "Work table", "Washing machine", "Free WiFi"] },
      { id: "courtyard", name: "Courtyard Studio", image: "assets/apartment.jpg", size: 36, beds: "1 double bed", sleeps: 2, price: 194, refundable: true, breakfast: false, inventory: 1, demand: 0.09, features: ["Courtyard view", "Full kitchen", "Two bikes", "Free WiFi"] }
    ],
    nearby: [
      { group: "What's nearby", items: [["Assistens Cemetery", "300 m"], ["The Lakes", "1.2 km"], ["Superkilen park", "900 m"]] },
      { group: "Restaurants & cafés", items: [["Coffee Collective", "50 m"], ["Meyers Bageri", "120 m"]] },
      { group: "Getting around", items: [["Nørrebros Runddel metro", "450 m"], ["Copenhagen Central", "3 km"], ["Copenhagen Airport", "11 km"]] }
    ],
    reviews: [
      { author: "Erik S.", country: "Sweden", traveller: "Business", roomId: "studio", nights: 5, date: "2026-09-10", score: 9, title: "Best work trip flat", liked: "The table and the light are perfect for a work week.", disliked: "The stairs are steep." },
      { author: "Priya N.", country: "India", traveller: "Couple", roomId: "courtyard", nights: 3, date: "2026-08-02", score: 8.6, title: "Lovely street", liked: "The bikes made the trip. Great bakery underneath.", disliked: "Morning noise from the workshop downstairs." },
      { author: "Max H.", country: "Germany", traveller: "Solo traveller", roomId: "studio", nights: 2, date: "2026-06-22", score: 8.8, title: "Simple and clean", liked: "Clean, quiet and the check-in code just worked.", disliked: "The shower is small." }
    ]
  },
  {
    id: "riad",
    name: "Riad of Small Doors",
    type: "Villa",
    address: { street: "Derb Sidi Bouloukat 9", area: "Medina", city: "Marrakech", postcode: "40000", country: "Morocco" },
    location: { lat: 31.6295, lng: -7.989 },
    score: 9.6,
    reviewCount: 221,
    scores: { Staff: 9.8, Facilities: 9.3, Cleanliness: 9.6, Comfort: 9.5, "Value for money": 9.5, Location: 9.4, "Free WiFi": 8.7 },
    summary: "A whole riad: four small doors, one orange tree, a roof for breakfast.",
    description: [
      "The whole riad is yours: three bedrooms around a tiled courtyard with an orange tree, a salon with a fireplace and a roof terrace looking over the Medina to the Atlas mountains.",
      "Fatima, who looks after the house, meets you at the square and walks you in. Breakfast on the roof can be added to your stay, and she will cook dinner on request."
    ],
    highlights: [
      { icon: "home", title: "The whole house", text: "Three bedrooms, two bathrooms and the courtyard, never shared." },
      { icon: "terrace", title: "Roof terrace", text: "Breakfast with a view over the Medina to the Atlas mountains." },
      { icon: "pin", title: "Five minutes to the square", text: "Jemaa el-Fnaa is a short walk through the souks." }
    ],
    popular: ["wifi", "breakfast", "terrace", "ac", "family", "kitchen"],
    gallery: [
      { src: "assets/marrakech.jpg", alt: "The salon with a sofa and the main bedroom beyond" },
      { src: "assets/porto.jpg", alt: "Loungers on the roof terrace" },
      { src: "assets/property/bedroom.jpg", alt: "The second bedroom" },
      { src: "assets/property/breakfast.jpg", alt: "Breakfast on the roof" },
      { src: "assets/property/bathroom.jpg", alt: "A bathroom with a tadelakt bath" }
    ],
    rooms: [
      { id: "riad", name: "Whole riad, room only", image: "assets/marrakech.jpg", size: 160, beds: "2 double beds and 2 single beds", sleeps: 5, price: 164, refundable: true, breakfast: false, inventory: 1, demand: 0.06, features: ["3 bedrooms", "2 bathrooms", "Roof terrace", "Full kitchen"] },
      { id: "riad-breakfast", name: "Whole riad with breakfast", image: "assets/property/breakfast.jpg", size: 160, beds: "2 double beds and 2 single beds", sleeps: 5, price: 188, refundable: true, breakfast: true, inventory: 1, demand: 0.06, features: ["3 bedrooms", "Breakfast on the roof", "Airport pick-up", "Full kitchen"] }
    ],
    nearby: [
      { group: "What's nearby", items: [["Jemaa el-Fnaa", "500 m"], ["Le Jardin Secret", "650 m"], ["Bahia Palace", "1.6 km"], ["Jardin Majorelle", "2.8 km"]] },
      { group: "Restaurants & cafés", items: [["Café des Épices", "350 m"], ["Nomad", "380 m"]] },
      { group: "Getting around", items: [["Taxi rank at Bab Doukkala", "700 m"], ["Marrakech station", "3.5 km"], ["Marrakech Menara Airport", "6 km"]] }
    ],
    reviews: [
      { author: "Samir A.", country: "Egypt", traveller: "Family", roomId: "riad", nights: 4, date: "2026-09-05", score: 9.4, title: "The rule was written down", liked: "Cancelled on the Tuesday. The rule was written down, and they kept it. When we came back in September, the house was even better than the photos.", disliked: "Hard to find at night without Fatima." },
      { author: "Olivia J.", country: "Canada", traveller: "Group", roomId: "riad-breakfast", nights: 3, date: "2026-07-18", score: 9.8, title: "Breakfast on the roof", liked: "Breakfast on the roof every morning was unforgettable.", disliked: "Nothing." },
      { author: "Leo F.", country: "Netherlands", traveller: "Couple", roomId: "riad", nights: 2, date: "2026-06-11", score: 9.6, title: "A house of our own", liked: "Having the whole riad to ourselves felt incredible for the price.", disliked: "The WiFi is slow on the roof." }
    ]
  },
  {
    id: "orchard",
    name: "Cliff Orchard",
    type: "Resort",
    stars: 5,
    address: { street: "Via Pietro Capuano 28", area: "Above the port", city: "Amalfi", postcode: "84011", country: "Italy" },
    location: { lat: 40.634, lng: 14.6027 },
    score: 9.3,
    reviewCount: 118,
    scores: { Staff: 9.5, Facilities: 9.4, Cleanliness: 9.4, Comfort: 9.3, "Value for money": 8.5, Location: 9.2, "Free WiFi": 8.9 },
    summary: "A lemon-scented resort on the cliff path, with the port below.",
    description: [
      "Cliff Orchard spreads down a terraced lemon grove above Amalfi's port. Every suite has a terrace, and the pool sits on the lowest terrace with the sea beneath it.",
      "The restaurant cooks from the garden, the spa uses the grove's lemons, and a shuttle runs to the beach and the port every half hour."
    ],
    highlights: [
      { icon: "pool", title: "Pool over the sea", text: "Heated from April to October, with loungers on two terraces." },
      { icon: "view", title: "A terrace for every suite", text: "All suites face the sea or the lemon grove." },
      { icon: "shuttle", title: "Beach shuttle", text: "Free every 30 minutes to the port and the private beach." }
    ],
    popular: ["pool", "spa", "restaurant", "breakfast", "view", "parking", "wifi", "shuttle"],
    gallery: [
      { src: "assets/amalfi.jpg", alt: "The pool surrounded by palms and mountains" },
      { src: "assets/resort.jpg", alt: "The resort and pool at dusk" },
      { src: "assets/oaxaca.jpg", alt: "The lower pool terrace with loungers" },
      { src: "assets/property/pool-deck.jpg", alt: "The pool deck in the morning" },
      { src: "assets/property/room-loft.jpg", alt: "Sea View Suite" },
      { src: "assets/property/dining.jpg", alt: "Dinner at the garden restaurant" }
    ],
    rooms: [
      { id: "garden", name: "Garden Suite", image: "assets/property/bedroom.jpg", size: 34, beds: "1 king bed", sleeps: 2, price: 310, refundable: true, breakfast: true, inventory: 4, demand: 0.07, features: ["Lemon grove view", "Private terrace", "Bathtub", "Free WiFi"] },
      { id: "sea", name: "Sea View Suite", image: "assets/property/room-loft.jpg", size: 42, beds: "1 king bed and 1 sofa bed", sleeps: 3, price: 368, refundable: true, breakfast: true, inventory: 3, demand: 0.09, features: ["Sea view", "Private terrace", "Bathtub", "Minibar"] },
      { id: "pool", name: "Cliff Pool Suite", image: "assets/resort.jpg", size: 55, beds: "1 king bed and 1 sofa bed", sleeps: 3, price: 455, refundable: false, breakfast: true, inventory: 1, demand: 0.1, features: ["Plunge pool", "Sea view", "Outdoor shower", "Butler service"] }
    ],
    nearby: [
      { group: "What's nearby", items: [["Amalfi Cathedral", "600 m"], ["Port of Amalfi", "400 m"], ["Valle delle Ferriere trail", "1.5 km"]] },
      { group: "Restaurants & cafés", items: [["Pasticceria Pansa", "550 m"], ["Da Gemma", "650 m"]] },
      { group: "Getting around", items: [["Ferry pier", "450 m"], ["SITA bus stop", "500 m"], ["Naples Airport", "68 km"]] }
    ],
    reviews: [
      { author: "Isabella R.", country: "United States", traveller: "Couple", roomId: "sea", nights: 4, date: "2026-09-25", score: 9.6, title: "That view", liked: "Sunrise from the terrace over the sea. The staff remembered our names on day one.", disliked: "A lot of steps between the terraces." },
      { author: "Marco V.", country: "Italy", traveller: "Family", roomId: "garden", nights: 5, date: "2026-08-12", score: 9, title: "The pool and the shuttle", liked: "The kids lived in the pool and the shuttle made the beach easy.", disliked: "Dinner is pricey." },
      { author: "Hannah C.", country: "Ireland", traveller: "Couple", roomId: "pool", nights: 3, date: "2026-07-01", score: 9.4, title: "Worth the splurge", liked: "The plunge pool suite is the best room we have ever stayed in.", disliked: "Non-refundable, so be sure of your dates." }
    ]
  },
  {
    id: "patio",
    name: "Casa del Patio",
    type: "Hotel",
    stars: 3,
    address: { street: "Calle de Macedonio Alcalá 407", area: "Centro", city: "Oaxaca", postcode: "68000", country: "Mexico" },
    location: { lat: 17.0654, lng: -96.7236 },
    score: 8.9,
    reviewCount: 76,
    scores: { Staff: 9.3, Facilities: 8.4, Cleanliness: 9, Comfort: 8.7, "Value for money": 9.1, Location: 9.5, "Free WiFi": 8.2 },
    summary: "A tiled hotel on a patio that stays cool after lunch.",
    description: [
      "Nine tiled rooms open onto a patio of pots and a fountain, on the pedestrian street that runs up to Santo Domingo.",
      "Breakfast is café de olla, fresh fruit and tamales. Every rate is non-refundable, which is how the patio keeps its prices low."
    ],
    highlights: [
      { icon: "pin", title: "On the Alcalá", text: "The walking street between the Zócalo and Santo Domingo." },
      { icon: "breakfast", title: "Oaxacan breakfast", text: "Served on the patio, included in every rate." },
      { icon: "garden", title: "Cool patio", text: "Shaded by bougainvillea all afternoon." }
    ],
    popular: ["wifi", "breakfast", "garden", "nonsmoking", "desk"],
    gallery: [
      { src: "assets/oaxaca.jpg", alt: "The patio and pool under a palm-thatched roof" },
      { src: "assets/property/room-twin.jpg", alt: "Patio Double room" },
      { src: "assets/property/room-classic.jpg", alt: "Patio Triple room" },
      { src: "assets/property/breakfast.jpg", alt: "Breakfast on the patio" },
      { src: "assets/property/restaurant.jpg", alt: "The bar in the evening" }
    ],
    rooms: [
      { id: "double", name: "Patio Double", image: "assets/property/room-twin.jpg", size: 19, beds: "1 double bed", sleeps: 2, price: 132, refundable: false, breakfast: true, inventory: 5, demand: 0.05, features: ["Patio view", "Ceiling fan", "Private bathroom", "Free WiFi"] },
      { id: "triple", name: "Patio Triple", image: "assets/property/room-classic.jpg", size: 24, beds: "1 double bed and 1 single bed", sleeps: 3, price: 158, refundable: false, breakfast: true, inventory: 2, demand: 0.08, features: ["Patio view", "Ceiling fan", "Private bathroom", "Free WiFi"] }
    ],
    nearby: [
      { group: "What's nearby", items: [["Templo de Santo Domingo", "350 m"], ["Zócalo", "500 m"], ["Mercado 20 de Noviembre", "800 m"]] },
      { group: "Restaurants & cafés", items: [["Café Brújula", "100 m"], ["Casa Oaxaca", "300 m"]] },
      { group: "Getting around", items: [["ADO bus station", "1.6 km"], ["Oaxaca Airport", "10 km"]] }
    ],
    reviews: [
      { author: "Rosa M.", country: "Mexico", traveller: "Couple", roomId: "double", nights: 3, date: "2026-09-08", score: 9, title: "The best breakfast", liked: "The tamales at breakfast and the cool patio after lunch.", disliked: "Thin walls." },
      { author: "Ben K.", country: "United States", traveller: "Family", roomId: "triple", nights: 4, date: "2026-07-21", score: 8.6, title: "Great value", liked: "Excellent location and great value for a family.", disliked: "The fan is loud at night." },
      { author: "Yuki S.", country: "Japan", traveller: "Solo traveller", roomId: "double", nights: 2, date: "2026-06-14", score: 8.8, title: "Friendly and central", liked: "Friendly staff and everything is walkable.", disliked: "Non-refundable only." }
    ]
  },
  {
    id: "greenhouse",
    name: "Greenhouse No. 4",
    type: "Apartment",
    address: { street: "Rua de Cedofeita 312", area: "Cedofeita", city: "Porto", postcode: "4050-174", country: "Portugal" },
    location: { lat: 41.1525, lng: -8.6195 },
    score: 9,
    reviewCount: 64,
    scores: { Staff: 9.2, Facilities: 8.8, Cleanliness: 9.3, Comfort: 9, "Value for money": 8.9, Location: 9.1, "Free WiFi": 9 },
    summary: "A glass-roofed studio two blocks from the bakery you will use.",
    description: [
      "A studio apartment under a glass roof at the back of a nineteenth-century house, with a kitchenette, a reading chair and a roof terrace with a view over Porto.",
      "Check-in is by key code. The host leaves a map of the neighbourhood and the bakery's opening hours."
    ],
    highlights: [
      { icon: "terrace", title: "Roof terrace", text: "Loungers and a view to the hills beyond the city." },
      { icon: "kitchen", title: "Kitchenette", text: "Two hobs, a fridge and a coffee machine." },
      { icon: "pin", title: "Cedofeita", text: "Galleries, cafés and the bakery all within two blocks." }
    ],
    popular: ["wifi", "kitchen", "terrace", "workspace", "washer"],
    gallery: [
      { src: "assets/porto.jpg", alt: "The roof terrace with two loungers" },
      { src: "assets/apartment.jpg", alt: "The living area under the glass roof" },
      { src: "assets/property/kitchen.jpg", alt: "The kitchenette" },
      { src: "assets/property/bathroom.jpg", alt: "The bathroom" }
    ],
    rooms: [
      { id: "studio", name: "Glass-roof Studio", image: "assets/apartment.jpg", size: 30, beds: "1 double bed", sleeps: 2, price: 154, refundable: true, breakfast: false, inventory: 1, demand: 0.08, features: ["Roof terrace", "Kitchenette", "Washing machine", "Free WiFi"] }
    ],
    nearby: [
      { group: "What's nearby", items: [["Jardins do Palácio de Cristal", "1 km"], ["Livraria Lello", "800 m"], ["Clérigos Tower", "900 m"]] },
      { group: "Restaurants & cafés", items: [["Padaria Ribeiro", "200 m"], ["Café Majestic", "1.4 km"]] },
      { group: "Getting around", items: [["Lapa metro", "600 m"], ["São Bento station", "1.3 km"], ["Porto Airport", "13 km"]] }
    ],
    reviews: [
      { author: "Lena S.", country: "Austria", traveller: "Couple", roomId: "studio", nights: 4, date: "2026-09-16", score: 9.2, title: "The price changed in front of us", liked: "We changed the dates and the price changed in front of us. The terrace at sunset was wonderful.", disliked: "The glass roof gets warm at midday." },
      { author: "Pedro A.", country: "Spain", traveller: "Solo traveller", roomId: "studio", nights: 3, date: "2026-07-29", score: 8.8, title: "Calm and bright", liked: "Bright, calm and very well equipped.", disliked: "The terrace stairs are narrow." },
      { author: "Grace L.", country: "United Kingdom", traveller: "Couple", roomId: "studio", nights: 2, date: "2026-06-05", score: 9, title: "Lovely neighbourhood", liked: "Cedofeita is the best part of Porto.", disliked: "No oven." }
    ]
  },
  {
    id: "gallery",
    name: "The Long Gallery",
    type: "Villa",
    address: { street: "Victoria Street 14", area: "Old Town", city: "Edinburgh", postcode: "EH1 2HE", country: "Scotland" },
    location: { lat: 55.9488, lng: -3.1928 },
    score: 9.2,
    reviewCount: 159,
    scores: { Staff: 9.3, Facilities: 9, Cleanliness: 9.2, Comfort: 9.1, "Value for money": 8.7, Location: 9.7, "Free WiFi": 8.8 },
    summary: "A long stone gallery of a house, with a fire and a steep stair.",
    description: [
      "A whole stone house on Victoria Street, with a long gallery room, a working fireplace, two bedrooms and a kitchen. The castle is a five-minute walk uphill.",
      "Your host leaves logs by the fire and a breakfast hamper if you book the breakfast rate."
    ],
    highlights: [
      { icon: "fireplace", title: "Working fireplace", text: "Logs are laid ready when you arrive." },
      { icon: "home", title: "The whole house", text: "Two bedrooms, a long gallery and a kitchen." },
      { icon: "pin", title: "Old Town", text: "The castle and the Royal Mile are five minutes away." }
    ],
    popular: ["wifi", "fireplace", "kitchen", "washer", "family", "workspace"],
    gallery: [
      { src: "assets/edinburgh.jpg", alt: "The house and garden pool" },
      { src: "assets/property/house-exterior.jpg", alt: "The house at night" },
      { src: "assets/property/bedroom.jpg", alt: "The main bedroom" },
      { src: "assets/apartment.jpg", alt: "The long gallery living room" },
      { src: "assets/property/kitchen.jpg", alt: "The kitchen" }
    ],
    rooms: [
      { id: "house", name: "Whole house", image: "assets/edinburgh.jpg", size: 120, beds: "2 double beds", sleeps: 4, price: 208, refundable: true, breakfast: false, inventory: 1, demand: 0.07, features: ["2 bedrooms", "Fireplace", "Full kitchen", "Free WiFi"] },
      { id: "house-breakfast", name: "Whole house with breakfast hamper", image: "assets/property/breakfast.jpg", size: 120, beds: "2 double beds", sleeps: 4, price: 232, refundable: true, breakfast: true, inventory: 1, demand: 0.07, features: ["2 bedrooms", "Breakfast hamper", "Fireplace", "Free WiFi"] }
    ],
    nearby: [
      { group: "What's nearby", items: [["Grassmarket", "100 m"], ["Edinburgh Castle", "450 m"], ["Royal Mile", "300 m"], ["National Museum of Scotland", "400 m"]] },
      { group: "Restaurants & cafés", items: [["Mary's Milk Bar", "150 m"], ["The Bow Bar", "50 m"]] },
      { group: "Getting around", items: [["Waverley station", "900 m"], ["Airport tram", "1.1 km"], ["Edinburgh Airport", "13 km"]] }
    ],
    reviews: [
      { author: "Fiona M.", country: "Scotland", traveller: "Group", roomId: "house", nights: 3, date: "2026-09-12", score: 9.4, title: "A fire and a view", liked: "The fire was laid when we arrived, and the gallery room is beautiful.", disliked: "The stair is steep, as promised." },
      { author: "Noah P.", country: "United States", traveller: "Family", roomId: "house-breakfast", nights: 4, date: "2026-08-03", score: 9, title: "Great for a family", liked: "The breakfast hamper was generous and the kids loved the house.", disliked: "Street noise during the festival." },
      { author: "Elif K.", country: "Türkiye", traveller: "Couple", roomId: "house", nights: 2, date: "2026-06-26", score: 9.2, title: "Perfect location", liked: "Perfect location and a really cosy house.", disliked: "Parking is far." }
    ]
  }
];
