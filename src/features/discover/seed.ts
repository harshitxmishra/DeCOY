import { getDb } from "@/lib/db";
import type { InternalProfile } from "./types";

export const PROFILES: Omit<InternalProfile, "interests">[] & { interests: string[] }[] = [
  // ─── 9 profiles with incoming_like = 1 (pre-seeded likers) ───
  { id: "p01", name: "Ananya Sharma", age: 22, photo: "/avatars/01.svg", bio: "Coffee connoisseur and aspiring novelist. Currently reading everything Murakami ever wrote.", location: "Delhi University", interests: ["reading", "coffee", "creative writing", "indie music"], incoming_like: 1 },
  { id: "p02", name: "Rohan Mehta", age: 23, photo: "/avatars/02.svg", bio: "CS grad who'd rather talk about film theory than algorithms.", location: "IIT Bombay", interests: ["cinema", "photography", "tech", "hiking"], incoming_like: 1 },
  { id: "p03", name: "Priya Nair", age: 21, photo: "/avatars/03.svg", bio: "Dance first, think later. Bharatanatyam meets hip-hop.", location: "Bangalore", interests: ["dance", "yoga", "music", "travel"], incoming_like: 1 },
  { id: "p04", name: "Arjun Patel", age: 24, photo: "/avatars/04.svg", bio: "Startup founder by day, standup open-micer by night.", location: "Ahmedabad", interests: ["entrepreneurship", "comedy", "cricket", "cooking"], incoming_like: 1 },
  { id: "p05", name: "Meera Krishnan", age: 22, photo: "/avatars/05.svg", bio: "Environmental science major saving the planet one thesis at a time.", location: "Chennai", interests: ["sustainability", "trekking", "photography", "volunteering"], incoming_like: 1 },
  { id: "p06", name: "Kabir Singh", age: 23, photo: "/avatars/06.svg", bio: "Amateur astronomer. Will cancel plans for a clear sky.", location: "Jaipur", interests: ["astronomy", "physics", "gaming", "sci-fi"], incoming_like: 1 },
  { id: "p07", name: "Diya Reddy", age: 21, photo: "/avatars/07.svg", bio: "Med student who unwinds with watercolors and lo-fi beats.", location: "Hyderabad", interests: ["art", "medicine", "music", "cats"], incoming_like: 1 },
  { id: "p08", name: "Vihaan Desai", age: 25, photo: "/avatars/08.svg", bio: "Product designer obsessed with tiny interaction details.", location: "Pune", interests: ["design", "UX", "cycling", "podcasts"], incoming_like: 1 },
  { id: "p09", name: "Isha Gupta", age: 22, photo: "/avatars/09.svg", bio: "Competitive debater. I'll argue about anything — including pineapple on pizza.", location: "Delhi", interests: ["debate", "politics", "baking", "dogs"], incoming_like: 1 },

  // ─── 23 profiles with incoming_like = 0 (no pre-seeded like) ───
  { id: "p10", name: "Aditya Kumar", age: 23, photo: "/avatars/10.svg", bio: "Backend engineer who secretly writes poetry in his notes app.", location: "Noida", interests: ["coding", "poetry", "football", "anime"], incoming_like: 0 },
  { id: "p11", name: "Sneha Iyer", age: 21, photo: "/avatars/11.svg", bio: "Classical singer transitioning into indie. First EP dropping soon.", location: "Mumbai", interests: ["singing", "guitar", "songwriting", "chai"], incoming_like: 0 },
  { id: "p12", name: "Rahul Verma", age: 24, photo: "/avatars/12.svg", bio: "Mountain biker and cloud infrastructure nerd.", location: "Dehradun", interests: ["biking", "cloud computing", "camping", "photography"], incoming_like: 0 },
  { id: "p13", name: "Kavya Menon", age: 22, photo: "/avatars/13.svg", bio: "Law student who runs a true-crime podcast on weekends.", location: "Kochi", interests: ["law", "podcasting", "true crime", "swimming"], incoming_like: 0 },
  { id: "p14", name: "Siddharth Joshi", age: 23, photo: "/avatars/14.svg", bio: "Jazz drummer in a college fusion band. Always tapping something.", location: "Pune", interests: ["drums", "jazz", "fusion food", "vinyl records"], incoming_like: 0 },
  { id: "p15", name: "Riya Banerjee", age: 21, photo: "/avatars/15.svg", bio: "Astronomy undergrad dreaming of working at ISRO.", location: "Kolkata", interests: ["space", "physics", "telescope building", "sci-fi novels"], incoming_like: 0 },
  { id: "p16", name: "Nikhil Saxena", age: 25, photo: "/avatars/16.svg", bio: "Chef-in-training. My pasta will make you forget your ex.", location: "Lucknow", interests: ["cooking", "food blogging", "travel", "basketball"], incoming_like: 0 },
  { id: "p17", name: "Tara Bhatt", age: 22, photo: "/avatars/17.svg", bio: "Graphic novelist working on a cyberpunk series set in future Mumbai.", location: "Mumbai", interests: ["illustration", "comics", "cyberpunk", "gaming"], incoming_like: 0 },
  { id: "p18", name: "Arnav Chopra", age: 23, photo: "/avatars/18.svg", bio: "Finance bro who's actually fun at parties. Mostly.", location: "Gurgaon", interests: ["investing", "tennis", "mixology", "standup"], incoming_like: 0 },
  { id: "p19", name: "Pooja Thakur", age: 21, photo: "/avatars/19.svg", bio: "Yoga instructor and part-time pottery enthusiast.", location: "Rishikesh", interests: ["yoga", "pottery", "meditation", "nature"], incoming_like: 0 },
  { id: "p20", name: "Dev Malhotra", age: 24, photo: "/avatars/20.svg", bio: "Documentary filmmaker chasing stories in small-town India.", location: "Chandigarh", interests: ["filmmaking", "travel", "storytelling", "photography"], incoming_like: 0 },
  { id: "p21", name: "Aisha Khan", age: 22, photo: "/avatars/21.svg", bio: "Competitive coder who's also obsessed with calligraphy.", location: "Hyderabad", interests: ["competitive programming", "calligraphy", "chess", "tea"], incoming_like: 0 },
  { id: "p22", name: "Karan Gill", age: 23, photo: "/avatars/22.svg", bio: "Sports journalist covering IPL and dreaming of the World Cup.", location: "Mohali", interests: ["cricket", "journalism", "running", "podcasts"], incoming_like: 0 },
  { id: "p23", name: "Nisha Rathore", age: 21, photo: "/avatars/23.svg", bio: "Psychology major fascinated by behavioral economics.", location: "Jaipur", interests: ["psychology", "economics", "board games", "journaling"], incoming_like: 0 },
  { id: "p24", name: "Yash Tandon", age: 25, photo: "/avatars/24.svg", bio: "Open-source contributor. My GitHub is greener than my garden.", location: "Bangalore", interests: ["open source", "rust", "gardening", "coffee"], incoming_like: 0 },
  { id: "p25", name: "Simran Kaur", age: 22, photo: "/avatars/25.svg", bio: "Fashion design student turning thrift finds into runway looks.", location: "Delhi", interests: ["fashion", "thrifting", "sewing", "street art"], incoming_like: 0 },
  { id: "p26", name: "Harsh Agarwal", age: 23, photo: "/avatars/26.svg", bio: "ML researcher by weekday, DJ by weekend.", location: "Bangalore", interests: ["machine learning", "EDM", "DJing", "badminton"], incoming_like: 0 },
  { id: "p27", name: "Aditi Pandey", age: 21, photo: "/avatars/27.svg", bio: "Theatre kid who takes improv way too seriously.", location: "Mumbai", interests: ["theatre", "improv", "sketch comedy", "karaoke"], incoming_like: 0 },
  { id: "p28", name: "Raghav Sinha", age: 24, photo: "/avatars/28.svg", bio: "Civil engineer who builds bridges and burns playlists.", location: "Patna", interests: ["engineering", "music production", "road trips", "football"], incoming_like: 0 },
  { id: "p29", name: "Zara Hussain", age: 22, photo: "/avatars/29.svg", bio: "Architecture student sketching skylines in every new city.", location: "Lucknow", interests: ["architecture", "sketching", "urban planning", "coffee"], incoming_like: 0 },
  { id: "p30", name: "Pranav Kulkarni", age: 23, photo: "/avatars/30.svg", bio: "Biotech researcher and amateur beekeeper.", location: "Pune", interests: ["biotechnology", "beekeeping", "sustainability", "hiking"], incoming_like: 0 },
  { id: "p31", name: "Rhea Kapoor", age: 21, photo: "/avatars/31.svg", bio: "Creative writing MFA student. My short stories will make you cry.", location: "Shimla", interests: ["writing", "literature", "mountains", "knitting"], incoming_like: 0 },
  { id: "p32", name: "Vivek Nambiar", age: 25, photo: "/avatars/32.svg", bio: "Full-stack dev building the next wave of IndieWeb tools.", location: "Trivandrum", interests: ["web dev", "IndieWeb", "surfing", "electronic music"], incoming_like: 0 },
];

export function seedProfiles(): void {
  const db = getDb();

  const count = db.prepare("SELECT COUNT(*) as cnt FROM profiles").get() as { cnt: number };
  if (count.cnt >= 32) return; // Already seeded — idempotent

  const insert = db.prepare(`
    INSERT OR IGNORE INTO profiles (id, name, age, photo, bio, location, interests, incoming_like)
    VALUES (@id, @name, @age, @photo, @bio, @location, @interests, @incoming_like)
  `);

  const insertMany = db.transaction((profiles: typeof PROFILES) => {
    for (const p of profiles) {
      insert.run({
        ...p,
        interests: JSON.stringify(p.interests),
      });
    }
  });

  insertMany(PROFILES);
}
