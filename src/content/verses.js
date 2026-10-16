// ---------------------------------------------------------------------------
// VERSE OF THE DAY — KJV (public domain), rotates once every 24 hours based
// on the calendar day, so everyone sees the same verse and it changes at
// midnight local time. Add more verses any time — the rotation just gets
// longer before repeating.
// ---------------------------------------------------------------------------

const VERSES_OF_DAY = [
  { text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", reference: "John 3:16" },
  { text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.", reference: "Ephesians 2:8-9" },
  { text: "I can do all things through him who strengthens me.", reference: "Philippians 4:13" },
  { text: "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.", reference: "Proverbs 3:5-6" },
  { text: "The LORD is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "But he was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed.", reference: "Isaiah 53:5" },
  { text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", reference: "Romans 8:28" },
  { text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.", reference: "Joshua 1:9" },
  { text: "Come to me, all who labor and are heavy laden, and I will give you rest.", reference: "Matthew 11:28" },
  { text: "The LORD is near to the brokenhearted and saves the crushed in spirit.", reference: "Psalm 34:18" },
  { text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.", reference: "2 Corinthians 5:17" },
  { text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.", reference: "Philippians 4:6" },
  { text: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.", reference: "Jeremiah 29:11" },
  { text: "This is the day that the LORD has made; let us rejoice and be glad in it.", reference: "Psalm 118:24" },
  { text: "Jesus said to him, \"I am the way, and the truth, and the life. No one comes to the Father except through me.\"", reference: "John 14:6" },
  { text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.", reference: "Isaiah 41:10" },
  { text: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.", reference: "Isaiah 40:31" },
  { text: "Let not your hearts be troubled. Believe in God; believe also in me.", reference: "John 14:1" },
  { text: "Create in me a clean heart, O God, and renew a right spirit within me.", reference: "Psalm 51:10" },
  { text: "For God gave us a spirit not of fear but of power and love and self-control.", reference: "2 Timothy 1:7" },
  { text: "Delight yourself in the LORD, and he will give you the desires of your heart.", reference: "Psalm 37:4" },
  { text: "And my God will supply every need of yours according to his riches in glory in Christ Jesus.", reference: "Philippians 4:19" },
  { text: "Draw near to God, and he will draw near to you.", reference: "James 4:8" },
  { text: "Cast your burden on the LORD, and he will sustain you; he will never permit the righteous to be moved.", reference: "Psalm 55:22" },
  { text: "Rejoice in the Lord always; again I will say, rejoice.", reference: "Philippians 4:4" },
  { text: "The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.", reference: "Lamentations 3:22-23" },
  { text: "And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.", reference: "Philippians 4:7" },
  { text: "Behold, I stand at the door and knock. If anyone hears my voice and opens the door, I will come in to him and eat with him, and he with me.", reference: "Revelation 3:20" },
  { text: "Though you have not seen him, you love him. Though you do not now see him, you believe in him and rejoice with joy that is inexpressible and filled with glory.", reference: "1 Peter 1:8" },
  { text: "He has told you, O man, what is good; and what does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?", reference: "Micah 6:8" },
  { text: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me.", reference: "Galatians 2:20" },
  { text: "Now faith is the assurance of things hoped for, the conviction of things not seen.", reference: "Hebrews 11:1" },
  { text: "Because, if you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved.", reference: "Romans 10:9" },
  { text: "We love because he first loved us.", reference: "1 John 4:19" },
  { text: "God is our refuge and strength, a very present help in trouble.", reference: "Psalm 46:1" },
  { text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.", reference: "Matthew 6:33" },
  { text: "Whatever you do, work heartily, as for the Lord and not for men.", reference: "Colossians 3:23" },
  { text: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.", reference: "Romans 12:2" },
  { text: "But he said to me, \"My grace is sufficient for you, for my power is made perfect in weakness.\" Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me.", reference: "2 Corinthians 12:9" },
];
export function getVerseOfDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return VERSES_OF_DAY[dayOfYear % VERSES_OF_DAY.length];
}
