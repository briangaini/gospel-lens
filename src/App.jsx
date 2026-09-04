import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Search,
  Quote,
  Sparkles,
  Share2,
  Link2,
  Check,
  Sunrise,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  Printer,
  Bookmark,
  Archive,
  Heart,
} from "lucide-react";

// ---------------------------------------------------------------------------
// CONTENT MODEL
// Each post has a `blocks` array so sermon-style posts (with wisdom quotes,
// scripture callouts, and reflection questions) render as designed
// components instead of plain paragraphs. Add new posts below — no other
// code needs to change.
//
// Block types:
//  { type: "p", text }
//  { type: "heading", text }
//  { type: "list", items: [] }                  -> plain bullet list, no label
//  { type: "quote", text, attribution }        -> "Wisdom of the Day" box
//  { type: "scripture", reference, verses: [] } -> "Scripture Focus" box
//  { type: "reflection", items: [] }            -> reflection questions
//  { type: "heart", text }                       -> "Write this on your heart"
//  { type: "closing", text }                     -> italic sign-off
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// NEWSLETTER CONFIG
// Leave BUTTONDOWN_USERNAME blank to keep the current demo-only signup box
// (it just shows "Subscribed ✓" without saving anything). Once you create a
// free account at buttondown.com, put your username here (the part after
// buttondown.com/ in your dashboard URL) and the form becomes fully working
// — no other code changes needed.
// ---------------------------------------------------------------------------
const BUTTONDOWN_USERNAME = "gaini";

// ---------------------------------------------------------------------------
// CONTACT CONFIG
// Fill in your email address below and two things go live: a "Contact"
// link in the footer for readers, and a separate "Submit a Blog Post" link
// for other writers who want to pitch content (pre-filled subject line so
// their emails are easy to spot). Leave blank to hide both links.
// ---------------------------------------------------------------------------
const CONTACT_EMAIL = "brian13gaini@gmail.com";

const p = (text) => ({ type: "p", text });

const POSTS = [
  // -------------------------------------------------------------------
  {
    id: 1,
    title: "What Is the Gospel, Really?",
    author: null,
    date: "June 2, 2026",
    category: "Foundations",
    readTime: "6 min read",
    excerpt:
      "Not a moral code to follow or a club to join — the gospel is news. Good news, about something that happened, on our behalf. Here's what that means and why it matters.",
    blocks: [
      p('The word "gospel" simply means good news. Not good advice, not a good example to imitate — news. Something has happened, and because it happened, everything is different.'),
      p("Here is the news: God, who is holy and whom we have wronged, did not leave us to fix ourselves. He sent his Son, Jesus Christ, who lived the perfect life we could not live, died the death we deserved, and rose again to defeat sin and death for good. Through faith in him, we are forgiven, adopted as children of God, and given a hope that does not disappoint."),
      p('This is not a self-help program. It is not "try harder and God will accept you." It is the opposite: God accepts you first, in Christ, and that acceptance is what makes a new life possible. Grace precedes obedience. It does not follow it.'),
      p("Why does this matter for how we live on a Tuesday afternoon? Because the gospel reframes everything. Our failures no longer define us — Christ's finished work does. Our obedience is no longer a transaction to earn love — it is a grateful response to love already given. Even our suffering is not wasted, because the God who raised Jesus from the dead is at work in it."),
      p("This blog exists to look at ordinary life — work, relationships, doubt, grief, joy — through that lens. Not as an escape from the world, but as the clearest way of seeing it."),
    ],
  },
  {
    id: 2,
    title: "Prayer When You Don't Feel Like Praying",
    author: null,
    date: "May 18, 2026",
    category: "Devotional",
    readTime: "5 min read",
    excerpt:
      "Some seasons, prayer feels like talking to the ceiling. Here's why that feeling isn't the whole story, and what to do with it.",
    blocks: [
      p("There are seasons when prayer feels alive — words come easily, and you sense you are heard. And there are seasons when it feels like nothing at all. You kneel, you speak, and the room stays quiet. If you have felt this, you are not alone, and you are not doing it wrong."),
      p('The Psalms are full of this exact struggle. "How long, O Lord? Will you forget me forever?" is Scripture, not a failure of faith. The writers of the Psalms did not wait to feel close to God before they spoke to him — they spoke to him about the distance itself. That is still prayer.'),
      p("Feeling and faith are not the same thing. Faith is trusting what is true even when it doesn't feel true in the moment. And what is true is this: God's posture toward his children does not change with our emotional weather. He is not more present when we feel him and absent when we don't."),
      p('Practically, this means showing up anyway. Short prayers count. Honest prayers count more than eloquent ones. "I don\'t feel anything right now, but I\'m still here" is a real prayer. Over time, the discipline of showing up tends to outlast the dry season — not because we manufactured a feeling, but because we kept the relationship open long enough for it to shift.'),
      p("If you're in a dry season, don't measure your faith by your feelings this week. Measure it by whether you kept showing up."),
    ],
  },
  {
    id: 3,
    title: "Grace Is Not a Loophole",
    author: null,
    date: "April 29, 2026",
    category: "Teaching",
    readTime: "7 min read",
    excerpt:
      "If grace means we're forgiven no matter what, why bother trying to live differently? It's one of the oldest objections to the gospel — and one of the most misunderstood.",
    blocks: [
      p('"Are we to continue in sin that grace may abound?" Paul asked that question nearly two thousand years ago, and people still ask it today — usually as an objection, sometimes as a genuine loophole they\'re hoping exists. If God forgives freely, why not just live however we want?'),
      p('Paul\'s answer is blunt: "By no means!" Not because grace has fine print, but because grace was never meant to leave you unchanged. Real grace does not just forgive the guilty — it makes the guilty new. Something actually happens in a person who has been forgiven much. Gratitude reorders desire. A rescued person tends to love the one who rescued them, and love changes what we want.'),
      p("Think of it this way: a marriage certificate doesn't cause love, but a marriage without any love behind it is a hollow legal arrangement. Grace is the certificate and the love together — a real, transforming relationship, not a permission slip. Obedience that flows from grace looks different from obedience that flows from fear. One is relief; the other is dread."),
      p('This is also why guilt is such a poor long-term motivator for change, and grace is such a strong one. Guilt says, "Do better or else." Grace says, "You are already fully loved — now live like it." The second one, oddly, tends to produce more lasting change than the first.'),
      p("So no, grace is not a loophole. It's a transplant."),
    ],
  },

  // -------------------------------------------------------------------
  // Real content supplied by Brian
  // -------------------------------------------------------------------
  {
    id: 4,
    title: "We Will Worship and We Will Reign",
    author: "Jonny Ardavanis",
    date: "July 1, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "What are we going to do in heaven? Two things: worship, and reign. Both should radically reorder how we live today.",
    blocks: [
      p("What are we going to do in heaven? It's interesting: We know what we're doing on a hyptoethical Thursday of an upcoming vacation, but we don't know what we're going to be doing for the next billion years."),
      {
        type: "quote",
        text: "God doesn't just let you into heaven. He puts a ring on your finger, gives you a royal robe, and says, 'Share in the spoils of victory. Rule alongside Me.'",
        attribution: "Jonny Ardavanis",
      },
      {
        type: "scripture",
        reference: "Revelation 4:10-11; 5:9-10; 3:21",
        verses: [
          "Worthy are You, our Lord and our God, to receive glory and honor and power; for You created all things, and because of Your will they existed and were created.",
          "You have made them to be a kingdom and priests to our God; and they will reign upon the earth.",
          "He who overcomes, I will grant to him to sit down with Me on My throne, as I also overcame and sat down with My Father on His throne.",
        ],
      },
      p("First, we're going to worship."),
      p("If you have no desire to worship Jesus, you are not saved. No buts. No ifs. No whats. When God saves someone, He gives them a new heart. And when He gives them a new heart, He gives them new affections, new desires, new delights. If there is not at least the seedling of wanting to worship Him—examine yourself to see if you're in the faith."),
      p('In Revelation 4:10-11, the 24 elders fall before Him who sits on the throne and worship Him, casting their crowns before the throne saying, "Worthy are You, our Lord and our God, to receive glory and honor and power."'),
      p('In Revelation 7:9, a great multitude which no one could count, from every nation and all tribes and peoples and tongues, standing before the throne with a loud voice crying, "Salvation to our God who sits on the throne and to the Lamb."'),
      p("There is going to be every language represented in glory. But there will be a singular anthem—a unified, loud voice—and it will be the worship of Jesus Christ."),
      p("But we're not just going to be singing."),
      p("We're also going to reign. This is dripping with regality and nobility, dominion and authority."),
      p('Think back to Genesis. God says, "Let us make man in Our own image." And then He gives them a job description: Rule. Subdue. Have dominion. You were made to reign. And it says in Revelation 5:10, if you\'re a Christian, you will reign.'),
      p('God doesn\'t just let you into heaven. He puts a ring on your finger, gives you a royal robe, and says, "Here is the inheritance given to Me by the Father for conquering death. Share in the spoils of victory. Rule alongside Me and sit with Me on My throne."'),
      p('Revelation 3:21: "He who overcomes, I will grant to him to sit down with Me on My throne."'),
      p('Revelation 22:5: "They shall reign forever and ever."'),
      p('Who is the person that overcomes? It\'s not the extra-strong man. It\'s the person who places their faith in Jesus Christ. John says, "He who believes that Jesus is the Christ (1 John 5:5)"—that\'s who overcomes.'),
      p('Paul says in 1 Corinthians 6, "Do you not know that the saints will judge the world? Do you not know that we are to judge angels?"'),
      p("Do you see how absolutely foolish it is to live for this present world?"),
      {
        type: "reflection",
        items: [
          "Are you genuinely excited to worship Jesus—not just to sing songs, but to see His face and declare His worth?",
          "Does knowing that you will one day reign with Christ change how seriously you take your faithfulness right now?",
          "How does the reality of co-reigning with Jesus Christ affect the way you view your life today—its purposes, its stakes, its meaning?",
        ],
      },
      {
        type: "heart",
        text: "I was made to worship. I was made to reign. Both happen in glory. Why would I live for this present world when I am going to reign with Christ in the next?",
      },
      { type: "closing", text: "Stay dialed in." },
    ],
  },
  {
    id: 5,
    title: "Part of the Plan",
    author: null,
    date: "June 24, 2026",
    category: "Devotional",
    readTime: "4 min read",
    excerpt:
      "Long before you were born, God already knew all about you — and still chose to make you. His plan includes you. Yes, you.",
    blocks: [
      p("In the beginning, God created everything."),
      p("Galaxies and volcanoes, fireflies and diamonds, oak trees and great white sharks. Finally, saving the best for last, He created humans in His image—to fill the earth, reign over its creatures, and cultivate a world that magnifies Him."),
      p("But even before the beginning, God was already there. He spoke time and space into existence, while existing outside of time and space. And long before you were born, He already knew all about you—your strengths and weaknesses, your successes and failures."),
      p("He knew all about you and still chose to make you… because He loves you!"),
      {
        type: "scripture",
        reference: "Ephesians 2:10 NIV",
        verses: [
          "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
        ],
      },
      p("You are God's handiwork—sometimes translated as masterpiece, workmanship, or work of art."),
      p("You are also God's masterpiece because of the unique spirit, personality, and gifts that have been uniquely wired in you."),
      p("Because we know that God is more brilliant than we could ever imagine, and because He loves us more than we could dare to hope, and because we know He writes great stories, we can trust what He has planned from beginning to end."),
      p("And His plan includes you. Yes, you! He has prepared good things for you to step into—meaningful relationships and impactful work. He is continually putting people and opportunities in your path, as well as working inside of you, giving you the desire and power to do what pleases Him (Philippians 2:13)."),
      p("He has empowered you to partner with Him as we experience the greatest story on earth."),
      p("So as you consider how God has intentionally designed you and placed you at this specific point in history, what passions and callings has He placed on your heart? This could be one big thing, or several small things. As you think about that, what step do you need to take to pursue your calling with God-given confidence?"),
    ],
  },
  {
    id: 6,
    title: "Closer Than You Think",
    author: null,
    date: "June 17, 2026",
    category: "Devotional",
    readTime: "4 min read",
    excerpt:
      "Is your heart broken? Is your spirit crushed? God hasn't left you to fight for yourself — He meets you exactly where you are.",
    blocks: [
      p("In one unsuspecting moment, everything can change."),
      p("A relationship can shatter, a dream can suddenly end. Your heart can break for a million different reasons: grief, rejection, loneliness, uncertainty, tragedy, betrayal."),
      p("When something terrible happens and the world makes zero sense…"),
      {
        type: "scripture",
        reference: "Psalm 34:18 NLT",
        verses: [
          "The Lord is close to the brokenhearted; he rescues those whose spirits are crushed.",
        ],
      },
      p("David, the writer of Psalm 34, preached what he lived. He experienced some intense highs and fierce lows, but he recognized God's presence in the midst of his circumstances. He knew that God was near, and God could change any situation in an instant."),
      p("Is your heart broken? Is your spirit crushed?"),
      p("God is near."),
      p("He hasn't left you to fight for yourself."),
      p("He sees you in your heartbreak."),
      p("He meets you where you are."),
      p("He has not forgotten you."),
      p("He has not abandoned you."),
      p("This doesn't mean you won't face hard things. But even when your mind races and your heart doubts, God offers a peace and an intimacy that cannot be fully explained."),
      p("Because of Jesus' death and resurrection, we now have constant access to God's presence through His Holy Spirit. There are many places in the Bible where the Holy Spirit is described as the Comforter—ready to soothe, guide, counsel, and encourage."),
      p("The comfort we receive from God is a gift from His Spirit who is always with us. So if your heart is breaking and your spirit is crushed, know that you are in good hands. God is near, and He will not abandon you."),
      p("Trials and hardships are a part of life, but God has the final say."),
      p("Right now, take a few moments to name anything that has crushed your spirit. Then, give yourself permission to just sit in God's presence for a few moments. When you're ready, consider memorizing today's verse and meditating on it throughout your day."),
    ],
  },
  {
    id: 7,
    title: "When Your Conscience Goes Silent",
    author: "Jonny Ardavanis",
    date: "June 10, 2026",
    category: "Teaching",
    readTime: "7 min read",
    excerpt:
      "Judas heard Jesus say plainly, 'one of you will betray me' — and felt nothing. What happens when a conscience stops working, and how do you know if yours still does?",
    blocks: [
      p('Jesus is on His knees before Judas. Friend. He\'s washing this guy\'s feet with love in His eyes. He takes bread, dips it in the bowl: "Judas, here you go, friend." And then He says, "One of you will betray Me."'),
      {
        type: "quote",
        text: "Your conscience is to your soul what pain sensors are to your body. It inflicts distress in the form of guilt. But woe to the one whose conscience has been seared.",
        attribution: "Jonny Ardavanis",
      },
      {
        type: "scripture",
        reference: "John 13:21-26; 1 Timothy 1:15",
        verses: [
          "When Jesus had said this, He became troubled in spirit, and testified and said, 'Truly, truly, I say to you, that one of you will betray Me.'",
          "To the pure, all things are pure; but to those who are defiled and unbelieving, nothing is pure, but both their mind and their conscience are defiled.",
        ],
      },
      p('You would think if there was any remnant of a conscience, when Jesus says "One of you will betray Me," Judas would say, "I\'ve been found out by the Hound of Heaven. It\'s me. Forgive me." Like a lance just slicing and dicing up his conscience.'),
      p('But you know what Judas says along with the other eleven? "Is it I?"'),
      p("Remarkable."),
      p("How to be a Judas? You sear your conscience."),
      p("What is the conscience? Your conscience is your God-given warning system that you are violating the natural law of God written on your heart. The conscience is to your soul what pain sensors are to your body. It inflicts distress in the form of guilt whenever we violate what our hearts tell us is right."),
      p("Your conscience can be pricked. It can sting. It can be sore. But praise the Lord—as long as your conscience is still sore, there's hope."),
      p("But woe, woe to the one whose conscience is no longer sore because it has been seared."),
      p("The sin that maybe used to keep you up at night becomes ho-hum and you can sleep like a baby."),
      p('I wonder how Judas felt the first time he stole. "Shouldn\'t have done that. I should tell Him. I should tell Him."'),
      p('And then what do you do? You silence your conscience. You live in a world that wants to silence the conscience. Turn it off. Turn up the noise. "It\'s herd instincts. It\'s just the way you\'ve grown up. You shouldn\'t feel guilty."'),
      p('I remember the first time I played guitar as an 11, 12-year-old. Trying to hold down the strings—it hurts. "Mom, my fingers are bleeding."'),
      p('My instructor said, "Hold those chord formations every day. Play for an hour every day and watch what happens."'),
      p("What happened? I developed calluses on my fingers. Those calluses persist to this day. And when I play guitar today, I feel absolutely nothing."),
      p("I want you to know that this is what can happen to your conscience. It gets calloused over time. What used to sting, you've become numb to."),
      p('And the Scripture says, "Woe, woe to you if you sear your conscience, cauterize your conscience, callous your conscience—your soul is in danger."'),
      p("There is a point where your conscience is past feeling. It's like a body when rigor mortis has set in. You become, as Ryle says, blind to every warning, deaf to every appeal."),
      {
        type: "reflection",
        items: [
          "What sin used to bother you that no longer does? Has your conscience been calloused?",
          "Are you actively silencing your conscience—turning up the noise, making excuses, justifying?",
          "Can you still feel the sting of conviction, or have you become numb?",
        ],
      },
      {
        type: "heart",
        text: "My conscience is my God-given warning system. If I can't feel it anymore, my soul is in danger. Lord, keep my conscience tender.",
      },
      { type: "closing", text: "Stay dialed in." },
    ],
  },
  {
    id: 8,
    title: "Remorse Without Repentance",
    author: "Jonny Ardavanis",
    date: "June 3, 2026",
    category: "Teaching",
    readTime: "7 min read",
    excerpt:
      "Judas felt remorse — enough to end his life over it. But remorse and repentance are not the same thing, and confusing them is eternally dangerous.",
    blocks: [
      p('Judas goes out and hangs himself. Acts 1 says he doesn\'t do a very good job of it because the branch breaks. He falls down from the cliff and his body splatters on the rocks. And Matthew 27:3 says he "felt remorse."'),
      {
        type: "quote",
        text: "You can feel horrible. You can feel absolutely riddled with guilt, extreme shame, remorse, and never come to repentance.",
        attribution: "Jonny Ardavanis",
      },
      {
        type: "scripture",
        reference: "Matthew 27:3-5; 2 Corinthians 7:10",
        verses: [
          "Then when Judas, who had betrayed Him, saw that He had been condemned, he felt remorse and returned the thirty pieces of silver to the chief priests and elders, saying, 'I have sinned by betraying innocent blood.' But they said, 'What is that to us? See to that yourself!' And he threw the pieces of silver into the temple sanctuary and departed; and he went away and hanged himself.",
          "For the sorrow that is according to the will of God produces a repentance without regret, leading to salvation, but the sorrow of the world produces death.",
        ],
      },
      p("In verse three, it says he felt remorse. What's the point?"),
      p("You can feel horrible. You can feel absolutely riddled with guilt, extreme shame, remorse, and never come to repentance."),
      p('What is repentance? Repentance is turning—turning from your sin to the Lord Jesus Christ. It\'s acknowledging, confessing that sin and saying, "I\'m wrong. I need You."'),
      p("Second Corinthians 7:9-10 says there are two different types of sorrow over sin."),
      p('An unbeliever can feel guilty. Sometimes people say, "Your guilt over sin? That\'s a sign the Spirit of God is working in you." Not necessarily. Unbelievers feel guilty.'),
      p("Judas felt remorse to the point where he went and killed himself and he will be in hell for all of eternity."),
      p('Paul says, "The sorrow that is according to the will of God produces a repentance without regret leading to salvation, but the sorrow of the world produces death."'),
      p("What is he saying? Remorse over sin, sorrow over sin, immense guilt, immense shame—so big, so crushing—doesn't mean anything if it doesn't lead you to repentance, to change."),
      p('There are people right now potentially that feel horrible when they sin. They feel sorrow. Their conscience is pricked. "No, what am I doing? What am I doing?" Three days later—comfortable. No longer feel the sting of their conscience. Get back and do the same thing over and over again.'),
      p("Promises to God. Shame over their sin. Regret, regret, regret. And Paul is saying here it doesn't produce true repentance."),
      p("That's a dangerous position to be in. Very, very eternally dangerous."),
      p('The sorrow of God over sin produces repentance. It\'s not just "I feel bad." It\'s "This grieves God. And then I turn to God, acknowledge my sin. I need Your grace. I want to change and I need the power to change."'),
      p("If you don't bring your guilt to the foot of the cross, you'll end up paying for it for all of eternity."),
      p("Hell is full of regret, full of wasted opportunity, full of people who felt remorse over their sin but never turned from it to the Lord Jesus Christ."),
      {
        type: "reflection",
        items: [
          "Do you feel remorse over your sin, or do you truly repent—turn from it to Jesus?",
          "Are you stuck in a cycle of guilt, promises, repeat—without real change?",
          "Have you brought your guilt to the foot of the cross, or are you still carrying it?",
        ],
      },
      {
        type: "heart",
        text: "Remorse is not repentance. Guilt is not enough. I must turn from my sin to Jesus. Bring my burden to the cross. Today.",
      },
      { type: "closing", text: "Stay dialed in." },
    ],
  },
  {
    id: 9,
    title: "Connect the Dots and Tell the Story",
    author: null,
    date: "May 27, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "Most of us can name the Bible's heroes. Far fewer of us can explain how their stories connect into one story — the story that points to Jesus.",
    blocks: [
      p('One of the questions you ought to ask of every lesson you prepare is this: "How does this topic or passage fit into the big story of Scripture?" Why is this question important? Because it reminds you to show your group how the Bible fits together.'),
      p("Not long ago, I was talking to a young man who was reading through the Bible for the first time. I gave him the broad outline of the Bible's story line and told him how the individual stories were pointing forward to the big story of Jesus Christ. He admitted he had little knowledge of the Scriptures, but he wanted to know where Noah's Ark fits into it all. Apparently, he remembered the story of Noah, perhaps from having heard it as a child. But that was all he knew. As he read through his Bible, he saw the stories in much the same way people read Aesop's Fables—short, memorable tales with a moral at the end."),
      p("I can't fault an unchurched, lost man for not reading the Bible as one overarching story. After all, he's not a Christian. No one has told him how these stories point to Jesus."),
      p("Unfortunately, I have found that plenty of people in church are not much better at interpreting the Scriptures. Granted, we usually know a higher number of Bible stories. Churchgoers know more than just the story of Noah. Names like Daniel, David, Moses, and Solomon are familiar. But for many of us, we see the purpose of these stories to inculcate moral values. From David, we learn about courage. From Daniel, we learn about determination. From Abraham, we learn about faith. From Solomon, we learn about wisdom. And on and on."),
      p("To be fair, we need to recognize that the Old Testament heroes are indeed presented as an example for us. The apostle Paul said so (1 Cor. 10). We can and should learn about persistence from Noah, courage from David, determination from Daniel, and endurance from Moses. To minimize the moral teaching in the Old Testament and never explore how these characters should be emulated is to misread the Bible at a profound level. So, on the one hand, we are exactly right to understand that one of the reasons we are given the Old Testament stories is so that we might be formed into more virtuous believers."),
      p("But the Bible doesn't just present heroes to be followed. After all, these heroes are flawed. We admire Noah for his tenacity in building an ark while his neighbors mocked his plans. What a portrait of faith, right? But after the flood, we see Noah in a drunken stupor, naked in his tent. Not the way we usually end the story when we're telling it to our kids, is it?"),
      p("We love watching David slay the giant and cut off his head. The shepherd boy, described as \"a man after God's own heart.\" But then he lusts after a woman, commits adultery, schemes to cover it up, and has her husband killed. Think about it. Many of the psalms we sing in church were written by a philandering murderer!"),
      p("So what to do? The heroes of the Old Testament are there for us to learn from—both good traits to be cultivated and bad traits to be avoided. But these heroes serve another purpose. Their stories point us toward the flawless One. They are heroes, but only in a secondary sense. God is the true Hero of the Bible, and we see the most heroic action of all in the rescue mission accomplished by His Son. If you teach the Bible as if it is a collection of stand-alone tales, your people will never see how these stories connect to tell the big story of salvation through Jesus Christ."),
      { type: "heading", text: "The Story of the Bible" },
      p("What is the story of the Bible? Most scholars divide the story line into four movements: Creation, Fall, Redemption, and Restoration. These four headings serve as a helpful reminder of how the Bible fits together."),
    ],
  },
  {
    id: 10,
    title: "How Weakness Becomes Strength",
    author: null,
    date: "May 20, 2026",
    category: "Devotional",
    readTime: "5 min read",
    excerpt:
      "Paul begged God to remove his pain. God didn't change the situation — He offered something else instead: 'My grace is enough.'",
    blocks: [
      p("Think of a situation you wish you could change, and then imagine what the apostle Paul must have been going through in 2 Corinthians 12."),
      p("Paul was suffering, so he repeatedly begged God to remove his pain. But God doesn't change Paul's situation. Instead, God tells Paul that His \"grace is enough\" for him."),
      p('Charis, the ancient Greek word for "grace," conveyed the favor that God showed humanity when He sent Jesus to earth for us.'),
      p("Before Jesus, people couldn't draw near to God on their own. But Jesus made a way for anyone to experience intimacy with God. A relationship with God isn't something we earn—it's a free gift we receive when we accept that Jesus died for us and rose from the dead."),
      p('So when God tells Paul that His "grace is sufficient," what He\'s essentially saying is: "I am enough for you."'),
      p("God could meet Paul's needs because God was all Paul needed—and God was with Paul. The influence Paul had was only because God chose to show off His power through him."),
      {
        type: "scripture",
        reference: "2 Corinthians 4:6-7 NIV",
        verses: [
          "For God, who said, 'Let light shine out of darkness,' made his light shine in our hearts to give us the light of the knowledge of God's glory displayed in the face of Christ. But we have this treasure in jars of clay to show that this all-surpassing power is from God and not from us.",
        ],
      },
      p('We are all like "jars of clay"—simple and not that impressive. But when we submit our lives to God, we become containers that showcase His power.'),
      p("Like Paul, we can then boast about how weak we are so that God gets the credit for every great thing that happens to us."),
      p('Our situations might not change, but our cry often changes from, "God, please remove this suffering," to, "God, when I suffer—show me how You are using this for Your glory and my good."'),
      p("So whatever you're facing, know that God is near. He sees you and He loves you. Take some time today and ask God to show you how He is empowering you. Draw near to Him, and let Him strengthen you."),
    ],
  },
  {
    id: 11,
    title: "What It Takes to Thrive",
    author: null,
    date: "May 13, 2026",
    category: "Devotional",
    readTime: "5 min read",
    excerpt:
      "Planting is exciting. Harvesting is rewarding. Pruning is neither — and it's exactly what keeps you producing fruit.",
    blocks: [
      p("In both gardening and spiritual terms, planting and harvesting are exciting seasons. Planting is the start of an adventure; harvesting is the product of hard work. It's easy to celebrate new beginnings and hard-earned completions—but one thing that's not as much fun?"),
      p("The pruning process."),
      p("Who wants to acknowledge what's dead and unproductive in their lives? Who wants to trim back what's already blooming—leaving you smaller, awkward, and feeling extra weak?"),
      p("But pruning is exactly what we need to keep producing fruit."),
      {
        type: "scripture",
        reference: "John 15:2 NIV",
        verses: [
          "He cuts off every branch in me that bears no fruit, while every branch that does bear fruit he prunes so that it will be even more fruitful.",
        ],
      },
      p("Jesus mentions two separate actions in this process—cutting off what's dead and pruning fruit."),
      p("Cutting out what's dead makes sense. It's extra weight, it's unproductive, it's blocking sunlight, and it's stealing good energy from branches that could thrive. But without proper context, pruning fruit feels backwards."),
      p("However, the purpose of pruning isn't to disable something, but to revitalize it."),
      p("If a branch is weak or diseased, it could not only damage itself, but the surrounding trees as well. Without pruning, both the tree and the life surrounding it can never reach full potential."),
      p("Pruning creates room for more growth."),
      p("Pruning stimulates production."),
      p("Pruning keeps the plant or person strong."),
      p("God is a good Gardener. He wouldn't be a good Gardener if He left you to yourself—overgrown, ineffective, and full of dysfunction. But He cares for those He loves. He cuts off what's dead for your benefit. He lovingly trims back ineffective things in your life to make way for more fruit."),
      p("You can trust God with your life because He cares about who you are and who you can become."),
      p('So what "dead branches" are you dragging around? Is it possible that God is pruning you for future growth? Take a few moments and talk to God about any areas in your life that you recognize need to change.'),
    ],
  },
  {
    id: 12,
    title: "The Whole Story: From Creation to Christ's Return",
    author: null,
    date: "May 6, 2026",
    category: "Foundations",
    readTime: "4 min read",
    excerpt:
      "Creation, rebellion, rescue, restoration — the entire Bible in a single arc, and where you fit inside it.",
    blocks: [
      p("In the beginning, the all-powerful, personal God created the universe. This God created human beings in His image to live joyfully in His presence, in humble submission to His gracious authority. But all of us have rebelled against God and, in consequence, must suffer the punishment of our rebellion: physical death and the wrath of God."),
      p("Thankfully, God initiated a rescue plan, which began with His choosing the nation of Israel to display His glory in a fallen world. The Bible describes how God acted mightily on Israel's behalf, rescuing His people from slavery and then giving them His holy law. But God's people—like all of us—failed to rightly reflect the glory of God."),
      p("Then, in the fullness of time, in the Person of Jesus Christ, God Himself came to renew the world and restore His people. Jesus perfectly obeyed the law given to Israel. Though innocent, He suffered the consequences of human rebellion by His death on a cross. But three days later, God raised Him from the dead."),
      p("Now the church of Jesus Christ has been commissioned by God to take the news of Christ's work to the world. Empowered by God's Spirit, the church calls all people everywhere to repent of sin and to trust in Christ alone for our forgiveness. Repentance and faith restores our relationship with God and results in a life of ongoing transformation."),
      p("The Bible promises that Jesus Christ will return to this earth as the conquering King. Only those who live in repentant faith in Christ will escape God's judgment and live joyfully in God's presence for all eternity. God's message is the same to all of us: repent and believe, before it is too late. Confess with your mouth that Jesus is Lord and believe in your heart that God raised Him from the dead, and you will be saved."),
    ],
  },
  {
    id: 13,
    title: "Reconciled for a Purpose",
    author: null,
    date: "June 20, 2026",
    category: "Devotional",
    readTime: "5 min read",
    excerpt:
      "Reconciliation isn't just the answer to disunity — it's a process every believer is equipped to join. Here's what that process actually looks like.",
    blocks: [
      p("Have you ever attempted to balance a difficult equation? There's a lot more to it than simply getting the right answer. You need to understand the step-by-step process if you want to be able to apply it and find new solutions in the future. In fact, most solutions in life involve a process, and the idea of reconciliation is no different."),
      p("It's not enough to know that reconciliation is the answer to disunity and injustice. We have to seek to understand and actively engage in the process. Reconciliation is the hard-but-good, messy-yet-beautiful, worth-it kind of work."),
      { type: "scripture", reference: "Psalm 34:14", verses: ["Turn from evil and do good, seek peace and pursue it."] },
      p("As a follower of Jesus Christ, you are not only called to understand and engage in the process of reconciliation; you are thoroughly equipped to be a minister of reconciliation. Scripture affirms that every believer is a minister of reconciliation, empowered by God Himself (2 Corinthians 5:11-21)."),
      p("So how do we do that? Psalm 34:14 lays out a few steps for us:"),
      { type: "heading", text: "Turn From Evil and Do Good" },
      p("Turning from evil means both rejecting evil outwardly and addressing it inwardly within our own hearts. We confess the sin that caused the fracture by acknowledging our role in conflicts with God and others, and we turn from our old ways and actively seek peace."),
      { type: "heading", text: "Seek Peace and Pursue It" },
      p("Peace isn't the absence of conflict; it's the presence of restored harmony. Seeking peace means we aren't just peace-keepers; we are peacemakers who actively pursue being a part of restoration. We listen empathetically and strive for understanding. We see and are attentive to the brokenness around us and ask where God might be calling us to be a part of reconciliation. And we put in the work because this kingdom work is worth it."),
      p("Because of the reconciliation work of Jesus Christ, accomplished on the cross, reconciliation is not a problem to be solved—it's a process that you've been invited to. Jesus Christ is reconciling the world to Himself. How will you join Him?"),
      { type: "encourage", text: "Seeking peace means we aren't just peacekeepers; we are peacemakers who actively pursue being a part of restoration." },
      { type: "share", items: ["What's one action step that God is asking you to take today?"] },
      { type: "prayer", text: "God, our world desperately needs Your peace—and so do I. Let my conversations overflow with grace and love, and point others back to You. Show me the action steps I should take to seek goodness and prioritize peace. I want to be a reflection of You. In Jesus' name, Amen." },
    ],
  },
  {
    id: 14,
    title: "Justified by Faith Alone",
    author: "Jonny Ardavanis",
    date: "July 13, 2026",
    category: "Teaching",
    readTime: "7 min read",
    excerpt:
      '"No one comes to the Father but through Me." Faith alone, not faith plus works — and why that distinction is the difference between wondering and knowing.',
    blocks: [
      p('"No one comes to the Father but through Me."'),
      p("With those words, Jesus has shut the door on every other religion and every other point of entry to God. Wildly unpopular. Highly offensive. And absolutely, completely true."),
      { type: "quote", text: "Whenever you come to a crossroads in theology, always pick the side that magnifies God's glory and diminishes any claim that man might have on what he's done.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "John 14:6; Galatians 2:16; Romans 3:20, 24, 27-28; Hebrews 10:10, 22",
        verses: [
          "No one comes to the Father but through Me.",
          "Nevertheless, knowing that a man is not justified by the works of the law but through faith in Christ Jesus... by the works of the law no flesh will be justified.",
          "By this will we have been sanctified through the offering of the body of Jesus Christ once for all... Let us draw near with a sincere heart in full assurance of faith.",
        ],
      },
      p("What does it mean to come to and through Jesus? It means to come to Him in faith. Faith is the road to heaven—and faith alone."),
      p("Can I ask you something? Do you have assurance? Do you know—not hope, not wonder, not think maybe—do you know that when you die, you're going to be with Jesus?"),
      p("You should."),
      p('Consider Hebrews 10:22: "let us draw near with a sincere heart in full assurance of faith."'),
      p("Full assurance. Not half assurance. Not wavering assurance. Full assurance."),
      p("Galatians 2:16 says a man is not justified by works of the law but through faith in Christ Jesus. Not faith plus works. Not grace plus cooperation. Faith in Christ Jesus."),
      p("Galatians 3:11: the righteous man shall live by faith."),
      p("Romans 3:24: we are justified as a gift by His grace."),
      p("And Romans 3:27-28: where then is boasting? It is excluded—by a law of faith. A man is justified by faith apart from works of the law."),
      p("Listen—whenever you come to a crossroads in theology, always pick the side that magnifies God's glory and diminishes any claim that man might have on what he's done."),
      p("Here's the question: if justification is something you earn, cooperate with, maintain, and sustain—then how do you know when you've done enough? You don't. You can't."),
      p("But if justification is a completed past action—a gift by grace through faith in the finished work of Jesus Christ—then you can know. You can have full assurance."),
      p('RC Sproul said, "We are secure not because we hold tightly onto Jesus, but because He holds tightly onto us."'),
      p("You're not saved because of what you've done or have not done. You're saved by faith and faith alone. And when you place your faith in the finished work of Jesus Christ, you have assurance. Blessed assurance."),
      p("You don't need to stumble. You don't need to wonder. You don't need to doubt. He made a way through His blood. You can go straight to the Father."),
      {
        type: "reflection",
        items: [
          "Can you say with confidence right now—not because of what you've done but because of what He's done—that heaven is your home?",
          "Is your assurance resting on Jesus's finished work or on your own continued performance?",
          "Whenever you come to a theological crossroads, are you choosing the side that magnifies God's glory?",
        ],
      },
      { type: "heart", text: "Justified. Past tense. Completed. A gift by grace through faith. He holds me—I don't hold myself. Full assurance." },
      { type: "closing", text: "Stay dialed in." },
    ],
  },
  {
    id: 15,
    title: "Peace in the Midst of Hardship",
    author: null,
    date: "June 13, 2026",
    category: "Devotional",
    readTime: "5 min read",
    excerpt:
      "Jesus' disciples were hiding in fear when He appeared and spoke peace over them — then sent them right back out into the world that scared them.",
    blocks: [
      p("Not long after Jesus' resurrection, His disciples hid in a locked room, fearing that the same people who crucified Jesus would come and arrest them. It's in the midst of their fearful circumstances that Jesus appears to them collectively, speaking words of peace over them."),
      p("But He doesn't stop there."),
      p("He then tells His disciples that He is sending them out into the world. This means they are going to have to leave the safety of their locked room. But although their future is unknown, they are known by the One who holds the future. So wherever they go, and whatever they face, Jesus' words will remain true: peace will be with them."),
      p("And Jesus continues to offer us this same peace."),
      p("We will all face hardship and difficulties. We all will go through seasons where we endure intense pain caused by struggling relationships, struggling economies, and struggling health crises."),
      p("But God's peace isn't based on our feelings or circumstances, which is why it's something we can consistently experience."),
      p("God's peace sometimes feels like a calmness in the midst of an anxious situation, or hope despite a discouraging diagnosis. It might look like unexplainable joy, or an unshakeable feeling that, regardless of what happens, God is still in control."),
      p("When our world rages, or the doctor shares something alarming, or the news reports are terrifying, God's peace enables us to walk forward with confident assurance that the One who gives us peace goes with us. Jesus might not remove us from difficult situations, but He will always help us walk through them."),
      p("Outside pressures don't have the power to take away God's perfect peace that's given to us through Jesus our Savior."),
      p("So take a few minutes today and thank Jesus for His peace that passes all understanding. Talk to Him about any concerns or worries you're currently experiencing, and as you give them over to Him, envision Him saying to you, 'peace be with you.'"),
      { type: "encourage", text: "Jesus might not remove you from difficult situations, but He will always help you walk through them." },
      {
        type: "share",
        items: [
          "God sent Jesus and Jesus has sent us—to tell the world about His love and grace!",
          "You don't have to be pushy or know all the answers.",
          "Simply ask God to lead you as you share the hope you have in Christ.",
        ],
      },
      { type: "prayer", text: "Jesus, thank You for calling me by name and sending me in Your name. I want to confidently follow You, but sometimes I struggle to see myself the way You see me. When I get overwhelmed by my insecurities, remind me that I belong to You. Fill me with Your peace so that I joyfully, and boldly, go wherever You send me. Amen." },
    ],
  },
  {
    id: 16,
    title: "You Are Known",
    author: null,
    date: "June 6, 2026",
    category: "Foundations",
    readTime: "3 min read",
    excerpt:
      "When you say yes to Jesus, your old identity is erased — every mistake, every hurt, every label. Your new identity is rooted in the God who calls you His child.",
    blocks: [
      p("When we decide to follow Jesus, we're given a new life in Christ. But what exactly does that mean?"),
      p("Jesus came and died for everyone who ever lived — that's us — and when we give our lives to Him and make the choice to follow Him, we get a new life in Him. We get adopted into His eternal family, with all the rights that go along with that."),
      p('When we say "yes" to Jesus, we are choosing to believe everything about Him is true. We\'re agreeing that He lived a perfect life, died for us, and rose from the dead. When we believe this, we are adopted into God\'s family as His children.'),
      p("Being God's children means we get unlimited, constant access to God's presence, love, and authority. And the great news? No one can separate us from God."),
      p("We don't receive new life as God's children from our parents or earn it from our good deeds—it's something God freely offers us. He alone has the authority to adopt us into His eternal family, and He promises to never leave or forsake us (Deuteronomy 31:6)."),
      p("At the moment of our adoption, our old identities no longer matter. Every unkind name we were given, every mistake we've made, every hurt we've experienced (or caused)—it's all erased. Our identity, security, and future are now rooted in the God who loves us and died for us."),
      p("Take a few moments right now and reflect on that. If you belong to Jesus, you are not alone. You are known by the Creator of the universe who calls you His child, knows you by name, and loves you unconditionally."),
    ],
  },
  {
    id: 17,
    title: "Have You Ever Given Your Life to Christ?",
    author: "Jonny Ardavanis",
    date: "June 27, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "Everyone who follows Jesus carries a cross of their own. Jesus says the only way we truly live is by dying to ourselves — daily.",
    blocks: [
      p("It's not only that Jesus would carry a cross. Everyone who comes to Him must carry a cross of their own. Jesus says the only way we live is when we die."),
      { type: "quote", text: "Your mother-in-law is not your cross to bear. That neighbor's not your cross to bear. Your cross to bear is living wholly and solely for the glory of God.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "John 12:25; Matthew 16:24-25",
        verses: [
          "He who loves his life loses it, and he who hates his life in this world will keep it to life eternal.",
          "If anyone would come after Me, let him deny himself and take up his cross and follow Me. For whoever would save his life will lose it, but whoever loses his life for My sake will find it.",
        ],
      },
      p("Can I just tell you—it was true then and it's true now: Man by nature replaces a right view of God with their own ideas of what God will do for them."),
      p('The crowds were shouting "Hosanna! Save us now!" They weren\'t expecting a Savior from sin. They were just looking for a savior from Roman oppression. They wanted liberation. They wanted prosperity.'),
      p("But Jesus came to die. And He says if you're going to follow Him, you have to die too. Die to what? Die to yourself."),
      p("When Jesus, who is the author of communication, repeats something over and over and over again, it's a statement of great importance. And I want you to dial in here because if you've grown up in the church, you could be in church your entire life without ever hearing these words of Jesus Christ. The broader evangelical world very rarely talks about this."),
      p('Matthew 16:24: "If anyone would come after Me, let him deny himself and take up his cross and follow Me."'),
      p('Luke 9: "If anyone would come after Me, let him deny himself and take up his cross daily and follow Me."'),
      p('Luke 14: "Whoever does not bear his own cross and come after Me cannot be My disciple."'),
      p('We live in a world where people say, "I\'m a Christian, but I\'m not like that type of Christian." I want you to understand, according to the Lord Jesus Christ, whoever does not bear his own cross and come after Me cannot be My disciple. And a disciple is not a super saint. It\'s a follower.'),
      p('In common vernacular when someone gets baptized or shares their testimony, we say things like "I became a Christian when" or "I became a believer then." Sometimes people even say "I gave my life to Christ."'),
      p("Can I just ask you: Have you ever given your life to Christ?"),
      p("That's what it means to be a Christian. It's to yield. To surrender."),
      p("This isn't in the fine print, my friends. It's so replete. It's just a tragedy that maybe this is the first time you've heard it or maybe you've gone so long without reminding yourself of this."),
      p("Jesus died once and for all for sin. How often does a Christian pick up the cross? Daily."),
      p('Paul says in 1 Corinthians 15, "I die daily."'),
      p("Which means every single day you have to take inventory—even of your ambition, of everything you're doing—and ask the question: Who am I living for?"),
      {
        type: "reflection",
        items: [
          "Have you actually given your life to Christ, or are you just using Christian language while still living for yourself?",
          'What would it look like practically for you to "die daily"—to pick up your cross every single day?',
          "Who are you building a kingdom for this morning? Whose glory are you living for?",
        ],
      },
      { type: "heart", text: "I've been crucified with Christ. It is no longer I who live, but Christ who lives in me. I die daily. His kingdom, not mine." },
    ],
  },
  {
    id: 18,
    title: "Morning Mercies",
    author: null,
    date: "April 8, 2026",
    category: "Devotional",
    readTime: "4 min read",
    excerpt:
      "Each sunrise is an invitation — to hear of God's unfailing love again, to trust Him again, and to surrender all over again.",
    blocks: [
      p("Each morning, when the sun pours over the horizon, you have an opportunity."),
      p("David—who held many titles throughout his lifetime: shepherd, warrior, giant-slayer, King of Israel, and a man after God's own heart—said it like this when he was talking to God:"),
      { type: "scripture", reference: "Psalm 143:8 NLT", verses: ["Let me hear of your unfailing love each morning, for I am trusting you. Show me where to walk, for I give myself to you."] },
      p("David recognized that each day was an opportunity…"),
      { type: "heading", text: "To Hear of God's Unfailing Love" },
      p("His mercies are new every morning (Lamentations 3:23) and His love endures forever (Psalm 118:2). But sometimes, we forget. Most times, we need to be reminded. Just as winter can't be stopped from blooming into spring, we can't stop the mercies of a brand new day."),
      { type: "heading", text: "To Trust Him Again" },
      p("God is good, constant, faithful, merciful, honest, loving, unlimited, all-powerful, and the source of everything that exists. In fact, He can't not be those things! No matter what we're facing, we can know that He's trustworthy. We can trust His character and we can trust His heart."),
      { type: "heading", text: "To Watch, Listen, and Discern His Leading" },
      p('We can fix our eyes on the God who fixes His loving gaze onto us. Let us echo David\'s words: "Show us where to walk…" Let us recognize His promptings, pay attention to His guidance, and listen for His "voice."'),
      { type: "heading", text: "To Surrender Our Lives to Him" },
      p("We can cling to our plans, dismiss His warnings, and fight for self-sufficiency, or, we can give ourselves to Him—fully. When we rely on ourselves, we will never be enough. But when we die to ourselves, we are choosing to live for Him."),
      p("No matter how dark the night, the sun rises again. And when that morning light pours over the horizon, you have a fresh opportunity to draw near to the One who loves you."),
    ],
  },
  {
    id: 19,
    title: "God's Heart For All People",
    author: null,
    date: "April 22, 2026",
    category: "Foundations",
    readTime: "4 min read",
    excerpt:
      "John 3:16 doesn't say God loved some of the world. It says the world — meaning everyone. Three things to remember about the Gospel.",
    blocks: [
      { type: "scripture", reference: "John 3:16 NASB", verses: ["For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life."] },
      p("The verse above is the essence of the Gospel. The Gospel means good news, and it's God's plan to save us from eternal separation from Him."),
      p("Our sin separated us from God's perfection. And because of that, we could not have a personal relationship with Him. Knowing that we could not get to Him on our own, God sent Jesus to us to make things right. Jesus did what no one else could do—He lived a perfect life, He died for us, and then He conquered death by coming back to life. It's His resurrection that led to our reconciliation with God—and that's good news!"),
      p("Here are three key things to remember about the Gospel:"),
      { type: "heading", text: "God Loves Everyone" },
      p("John 3:16 doesn't say that God loved some of the people in the world. It says He loves the world … that means everyone who inhabits it. God's heart is for all people. The Gospel is for everyone."),
      { type: "heading", text: "God Wants Everyone" },
      { type: "scripture", reference: "2 Peter 3:9 NASB", verses: ["The Lord is not slow about His promise, as some count slowness, but is patient toward you, not wishing for any to perish but for all to come to repentance."] },
      p("Jesus has promised to come back for His people, and God always keeps His promises. We might grow impatient waiting for Him to return, but we can take comfort in knowing that His waiting is for our benefit. He wants to give everyone an opportunity to know Him personally."),
      { type: "heading", text: "God Sends Everyone" },
      p("The last thing Jesus told His followers before He returned to heaven was to go and make disciples everywhere. We aren't all called to other countries, but we are all called to share His good news with everyone we know."),
      p("There are people who need the love and hope we have in Jesus. So if Jesus is our Savior, then let's live like it. Let's offer our praise to God for who He is, and worship Him through the way we live our lives. Let's ask Him to help us see how much He loves everyone."),
      p("As we patiently wait for God to return, let us purposefully live each day for His glory."),
      p("That's why we're here."),
    ],
  },
  {
    id: 20,
    title: "True Friendship",
    author: null,
    date: "April 15, 2026",
    category: "Devotional",
    readTime: "4 min read",
    excerpt:
      "Hundreds of surface-level friends, or one who sticks closer than a brother? Here's what actually separates real friendship from proximity.",
    blocks: [
      p('Would you rather have hundreds of "friends" who know you, but don\'t really know you—who call you a friend, but only when it\'s convenient? Or, would you rather have one true friend who always sticks by your side?'),
      p("The writer of Proverbs, typically attributed to King Solomon, said this:"),
      { type: "scripture", reference: "Proverbs 18:24 NLT", verses: ['There are "friends" who destroy each other, but a real friend sticks closer than a brother.'] },
      p("Some friends come into our lives because of proximity: you work at the same business, your kids go to the same school, or you frequent the same places. But just because you know someone's name and follow each other on social media, doesn't mean you're true friends."),
      p("When it comes to genuine friendship, quality over quantity is key."),
      p("Even the truest of friends will occasionally let you down, because no one is perfect—except Jesus. He is the truest friend of all."),
      p("Learning from Jesus' example, there are certain characteristics that describe a true and godly friend …"),
      { type: "heading", text: "Do They Love God?" },
      p("A true friend is one who will ultimately point you back to your Creator and Savior. Who will wrestle through your questions and doubts with you, without judgment or condemnation. Who will speak the truth in love, even when it's hard. Who will seek to glorify God and honor you as their friend."),
      { type: "heading", text: "Are They Willing to Work Through the Hard Stuff?" },
      p("Most people are happy to be friends when things are easy, positive, and thriving, but not as many stick around when life gets tough. When you're sick, when you're discouraged, when you've been misunderstood, or when one of you needs to be lovingly corrected, you need more than just a fair-weather friend."),
      { type: "heading", text: "Are They Willing to Look Beyond Themselves?" },
      p('In John 15:13 Jesus said, "There is no greater love than to lay down one\'s life for one\'s friends." Jesus modeled this by giving His life for ours. They might not have to sacrifice their physical life, but are they willing to serve the people they love? Are they willing to put God first, others second, and themselves third?'),
      p("All these questions are great guidelines when looking for solid friendships. But before you look for a friend with these characteristics, first make sure you look in the mirror. If you want to have these friendships, then you need to be the kind of friend who lives out these characteristics with integrity and grace. Be the true friend you desire."),
    ],
  },
  {
    id: 21,
    title: "A Sympathetic High Priest",
    author: "Jonny Ardavanis",
    date: "July 9, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "God doesn't just witness our sorrow from a distance. In the person of Jesus Christ, He entered into it.",
    blocks: [
      p("God is not only aware of our sorrow. He not only documents our tears. He entered into our sorrow in the person of Jesus Christ."),
      { type: "quote", text: "Never separate the sovereignty of God from the sympathy of God.", attribution: "Jonny Ardavanis" },
      { type: "scripture", reference: "John 11:33-35; Hebrews 4:15; Psalm 56:8", verses: ["When Jesus therefore saw her weeping, and the Jews who came with her also weeping, He was deeply moved in spirit and was troubled... Jesus wept."] },
      p('Consider Isaiah 53:3-4 with me: "He was despised and forsaken of men, a man of sorrows and acquainted with grief... Surely our griefs He Himself bore, and our sorrows He carried."'),
      p("He was a man of sorrows, acquainted with grief. He knew much grief. The Savior of the world is not a stranger to suffering."),
      p('Hebrews 4:15: "We do not have a high priest who cannot sympathize with our weaknesses, but One who has been tempted in all things as we are, yet without sin."'),
      p("It's not just that He's been tempted in every way we are without sin. He's been wounded in every way you are without bitterness. He's been grieved in every way you are. He's faced rejection in every way you've faced rejection. He's faced sadness in every way you face sadness. He's a sympathetic high priest."),
      p("The Christ revealed to you in Scripture this morning is not unmoving, unflinching, insensitive, and unaffected (Boice). He's one that enters into the sorrow of His own."),
      p("Have you ever experienced true sorrow? Have you ever grieved? Are you grieving even now? Have you ever sobbed in the presence of unimaginable loss and pain?"),
      p("So has Jesus."),
      p('The Old Testament is wonderful. We read that God does not ignore the cry of the humble. He hears our cry. Psalm 34:15 says, "The eyes of the LORD are on the righteous and His ears are attentive to their cry."'),
      p('But look at Psalm 56:8: "You have taken account of my wanderings. You put my tears in Your bottle. Are they not in Your book?"'),
      p("God takes note of the tears of His people and He writes them down in His book. He holds them. He collects them and He places them in His bottle. There is not a tear that you have ever cried that is unnoticed and undocumented by God."),
      p("But the wonder of Scripture and the wonder of John 11 is that God is not only aware of our sorrow, He not only documents our tears—He entered into our sorrow in the person of Jesus Christ."),
      p("I preach on the sovereignty of God often—that He rules and reigns, that He's in total control. But I want you to write this down on your heart: Never separate the sovereignty of God from the sympathy of God. He's not capriciously pulling strings unmoved, unaffected by the sorrow of His people."),
      p("Have you ever felt as if God were distant or passive in your pain? He's not. Maybe you think God does not care about your suffering and your sorrow. That couldn't be further from the truth."),
      {
        type: "reflection",
        items: [
          "Do you see God as distant and unmoved by your pain, or as a sympathetic high priest who enters into your sorrow?",
          "When was the last time you brought your tears—your real, unfiltered grief—to Jesus, believing that He sympathizes with you?",
          "How does knowing that God collects your tears in a bottle and writes them in His book change the way you process your pain?",
        ],
      },
      { type: "heart", text: "God is not distant in my pain. He is sympathetic. He entered into my sorrow. He collects my tears. He is near." },
    ],
  },
  {
    id: 22,
    title: "Jesus—The Man Who Wept",
    author: "Jonny Ardavanis",
    date: "July 5, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "Two words: 'Jesus wept.' The shortest verse in Scripture may be one of the most important — proof that strength and tears were never opposites.",
    blocks: [
      p('The shortest verse in Scripture may be one of the deepest, most profound truths in the Bible. Two words, but worth two volumes of thought and meditation: "Jesus wept."'),
      { type: "quote", text: "There's no weakness in the strongest man who ever lived. There's no immaturity in the perfect, spotless Son of God.", attribution: "Jonny Ardavanis" },
      { type: "scripture", reference: "John 11:35; Hebrews 4:15", verses: ["Jesus wept."] },
      p("Why weep? Why weep if in a few minutes everyone will be rejoicing at the resurrection of Lazarus?"),
      p("Think with me. Jesus was God in the flesh and therefore He was the godliest man who ever lived. And yet He wept. He is the logos in John 1—the mind and the power and the intellect behind the universe. He is the most cerebral person in the universe. You think you're logical? This is the God that invented logic. And yet He wept."),
      p("There was not a moment in the Lord Jesus Christ's life where He did not trust in the Lord with all His heart. And yet He wept."),
      p('He doesn\'t tell the mourning mass, "Dry your tears. Pull yourselves together. Didn\'t I tell you that this was going to turn out for the glory of God?" He doesn\'t say, "Watch this." He wept.'),
      p("The word in verse 35 is dakruo, which means to burst into tears. Silent sobbing, tears running down the cheek of the Creator of the universe."),
      p("What do these tears show us?"),
      p("First, that He was a real man. It's not just that Jesus took on the shell of humanity. He entered into our humanity because He was truly human. There is nothing human in us that was not human in Him. It's not necessary or essential to have sin to be human. There was no sin in the garden."),
      p("He was born. He was swaddled. He was nursed. He grew in wisdom and favor with God. He was hungry. He was thirsty. He was fatigued. He fell asleep at the head of the boat. He had real emotions. He was lonely in the wilderness. He had glands and tear ducts."),
      p('He could have attempted to suppress and repress His tears and say, "Stop it. Stop it. Stop it." But He did not. He could have bitten His lip and swallowed His sorrow, but He did not. He did not prevent one tear from running down His cheek.'),
      p("This is interesting because in a culture of hyper-femininity, some have attempted to define masculinity as machismo, stoic, unemotional, unattached. But here we have the truest man who ever lived crying."),
      p("He really was one of us. He wasn't a robot. He was a man."),
      p('If you\'ve ever felt like you had to suppress your emotions to be "strong," look at Jesus. The strongest man who ever lived wept openly. There\'s no shame in tears. There\'s no weakness in grief. Jesus modeled for us what true humanity looks like—full of emotion, fully engaged, fully present in the pain of the moment.'),
      {
        type: "reflection",
        items: [
          "Have you bought into the lie that emotions—especially tears—are weakness? How does seeing Jesus weep change that perspective?",
          'Do you allow yourself to fully feel your emotions, or do you suppress them in the name of "being strong"?',
          "In what ways have you diminished the humanity of Jesus in your mind? How does recognizing His full humanity draw you closer to Him?",
        ],
      },
      { type: "heart", text: "Jesus was fully God and fully man. He wept. There is no weakness in tears—only humanity. And He entered fully into mine." },
    ],
  },
  {
    id: 23,
    title: "What's the Point?",
    author: null,
    date: "April 1, 2026",
    category: "Foundations",
    readTime: "5 min read",
    excerpt:
      "A king with more power, wealth, and pleasure than anyone in history looked at it all and called it meaningless. Here's what he found instead.",
    blocks: [
      p("There once lived a king whose experience exploring and grappling with life's perplexities was recorded in the book of Ecclesiastes."),
      p("What's interesting is that this king—likely King Solomon—reigned in Israel during some of the best years in its history. From the world's standards, he had more power, prestige, and wealth than any other person before him. Yet, still, he summarized his luxuries with one depressing word: Meaningless!"),
      {
        type: "scripture",
        reference: "Ecclesiastes 1:2, 8-9, 14",
        verses: [
          "Everything is meaningless!",
          "Everything is wearisome beyond description.",
          "Nothing under the sun is truly new.",
          "I observed everything going on under the sun, and really, it is all meaningless—like chasing the wind.",
        ],
      },
      p("Though written thousands of years ago, this bleak analysis still resonates with our own restless yearning for more. We want more than meaningless stuff. We want more than surface-level connections and ambitions. We want more than a seemingly thriving, yet secretly unsatisfied life. We want more—but what we want doesn't typically satisfy us."),
      p('Like the author of Ecclesiastes, we might find ourselves asking: "What is the point of life?"'),
      p('By the end of the book, "the Teacher" has tried to find meaning in everything under the sun, and he concludes his reflections with these powerful words…'),
      { type: "scripture", reference: "Ecclesiastes 12:13 NIV", verses: ["Now all has been heard; here is the conclusion of the matter: Fear God and keep his commandments, for this is the duty of all mankind."] },
      p("We can chase after everything this world has to offer and it might bring temporary pleasure. But in the end, pursuing those things apart from God will always leave us empty."),
      p("The great news is, there's a God in heaven who created and loves us, and He understands what we really need. He knows that life is best when we follow His design for life. He is worthy of our awe, our honor, and our worship."),
      p("So, fear God and keep His commandments. Love Him with everything in you and love your neighbor as yourself. That is the point. Only then will life no longer be meaningless."),
    ],
  },
  {
    id: 24,
    title: "Perseverance Brings a Harvest",
    author: null,
    date: "March 25, 2026",
    category: "Devotional",
    readTime: "4 min read",
    excerpt:
      "Discipline is uncomfortable in the moment — but Scripture promises a harvest of righteousness and peace on the other side of it.",
    blocks: [
      p("Have you ever started something new, but gave up after a few tries? Maybe you tried to create a new morning routine or a Bible reading habit, only to give up after a few weeks. It can be hard to build enough discipline to start something new—or to change."),
      p("It can also be challenging to receive discipline from someone. Maybe you remember being disciplined as a kid by your parent. Or maybe you've faced discipline at work for a mistake you made."),
      p("In either case, discipline is hard and takes a lot of work."),
      p("Scripture says that for those who endure discipline, and persevere, there is a harvest of righteousness and peace waiting for them. However, it doesn't happen easily and often makes us uncomfortable. We have to be trained through discipline to create godly habits that will then produce righteousness and peace in our lives."),
      p("Take some time today to consider: Where can you allow the Holy Spirit to build discipline in your life? What daily habits should you begin working on today?"),
      p("Building discipline into your life is worth it—with the results being peace and a desire for righteousness."),
      {
        type: "share",
        items: [
          "Spiritual training is better with friends. Commit to read the Bible every day, and invite someone to join you!",
          "Whether you start a Bible Plan, engage with Guided Scripture, or read one chapter at a time, studying God's Word will transform your life.",
        ],
      },
      { type: "prayer", text: "God, being self-disciplined can be challenging, but I know I'm training with purpose. You're doing a great work inside of me—a work that is shaping me to be more like You. Please help me to identify the aspects of my life that need attention, and empower me to change for the better. Give me the strength to endure the challenge, and help me to remember Your promises. In Jesus' name, Amen." },
      { type: "scripture", reference: "Hebrews 12:11 ESV", verses: ["For the moment all discipline seems painful rather than pleasant, but later it yields the peaceful fruit of righteousness to those who have been trained by it."] },
    ],
  },
  {
    id: 25,
    title: "Keep the Faith",
    author: null,
    date: "March 18, 2026",
    category: "Devotional",
    readTime: "4 min read",
    excerpt:
      "Paul wrote his last letter from a Roman prison, believing his death was near. His final reflection: 'I have kept the faith.'",
    blocks: [
      p("In the book of 2 Timothy, we find Paul writing a letter to Timothy, a fellow missionary. Many Bible scholars believe that this was the last letter Paul wrote before his death and that he wrote it from a Roman prison cell. Reflecting on his own life and believing that his death is coming soon, Paul writes that powerful passage:"),
      { type: "scripture", reference: "2 Timothy 4:7 NIV", verses: ["I have fought the good fight, I have finished the race, I have kept the faith."] },
      p("Faithful."),
      p("Paul was faithful to God and, without end, God was faithful to Paul. Shipwrecked. Stoned. Abandoned by friends. Imprisoned. The list of what Paul suffered goes on and on. But he persevered. He remained steadfast in his devotion to Christ."),
      p("When you think about your life, what do you want to be able to say at the end? What will you see when you look back?"),
      p("In Paul, we see an example of what it is to cling to faith in Christ. He knew what it was to be dependent on God for everything. He drew strength from God because he could not do it without him."),
      p("In our own lives, we will face moments of doubt or discouragement. Let us hold fast to the truth of God's Word, knowing that He is faithful and will never leave us. May it be said of us, at the end of our lives, that we, too, fought the good fight, finished the race, and kept the faith."),
    ],
  },
  {
    id: 26,
    title: "Planning Ahead",
    author: null,
    date: "July 16, 2026",
    category: "Devotional",
    readTime: "4 min read",
    excerpt:
      "You make plans for the day, the year, the decade — but Scripture is clear about whose purpose actually prevails. Here's how to hold your dreams with an open hand.",
    blocks: [
      p("Think about your upcoming plans for the day, week, year, and beyond."),
      {
        type: "list",
        items: [
          "Maybe you want to start a business.",
          "Maybe you want to raise a family.",
          "Maybe you want to write a book.",
          "Maybe you want to travel the world.",
          "Maybe you want to move to a place.",
          "Maybe you want to stay where you are.",
          "Maybe you want to start a ministry.",
          "Maybe you want to volunteer in your city.",
          "Maybe you want to plant a garden.",
          "Maybe you want to pay off debt.",
        ],
      },
      p("Scripture tells us …"),
      { type: "scripture", reference: "Proverbs 19:21 NIV", verses: ["Many are the plans in a person's heart, but it is the Lord's purpose that prevails."] },
      p("Making plans isn't a bad thing. In fact, the Bible tells us that we will harvest what we plant (Galatians 6:7), so we should be diligent—not lazy—to wisely prepare for the future. But we must simultaneously hold those plans loosely, because God knows the full picture of our lives."),
      p("God is always working in and through His people, giving them the desire and power to do what pleases Him (Philippians 2:13). But sometimes, we require rerouting. Sometimes what we want isn't in His plan."),
      p("But even when we don't get what we've hoped for, He always has our good and His glory in mind."),
      p("Jesus modeled how to surrender His own plans by literally giving His life up for us—for our freedom. And, even though it wasn't easy, our lives and our futures look different because God's purpose prevailed."),
      p("So today, make a list of some of your plans and dreams. Then hold your hands out in front of you, and visualize giving all of your dreams and plans over to God. Picture all of those plans evaporating from your hands. Then, ask God to show you which plans He wants to give back to you and if there are any new dreams He's longing for you to receive."),
      { type: "prayer", text: "God, sometimes it's hard to surrender my life to You. I make the mistake of thinking my plans are better than Yours. I know Your purpose for me is far greater than I can imagine, so I want to release all control to You. I invite You into my decision-making. Please inspire every move and thought I make. In Jesus' name, Amen." },
    ],
  },
  {
    id: 27,
    title: "Set Your Mind on Things Above",
    author: "Jonny Ardavanis",
    date: "June 29, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "We know more about iPhone upgrades and Black Friday deals than we do about the place Jesus went to prepare for us. Here's what happens when heaven stops feeling foggy.",
    blocks: [
      p("It is astonishing how little attention we give to the place we're going to spend a gazillion years. We know more about iPhone upgrades, framed TVs, Toyota Sequoias, and Black Friday deals than we do about the place Jesus says He's gone to prepare for us."),
      { type: "quote", text: "It's going to be hard not to live for this present world if you have little anticipation of the glory of heaven.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "Colossians 3:1-2; Proverbs 23:7; Romans 12:2",
        verses: [
          "Therefore if you have been raised up with Christ, keep seeking the things above, where Christ is seated at the right hand of God. Set your mind on the things above, not on the things that are on earth.",
          "As a man thinks within himself, so he is.",
          "Do not be conformed to this world, but be transformed by the renewing of your mind.",
        ],
      },
      p('CS Lewis said, "It is because Christians have largely ceased to think of the other world that they have become so ineffective in this one."'),
      p('Think with me for a moment. Paul follows this pattern throughout his epistles. He talks about what God has done for us in Christ, and then he proceeds to talk about how we live in light of that. In the first three chapters of Ephesians, there are 66 verses and only one command: remember what God has done. He\'s seated us in the heavenly places. He saved us because He\'s rich in mercy. He made us alive. And then Paul turns a corner and says, "Because of all these things, walk in a manner worthy of the gospel."'),
      p("In Colossians 3, you see the same idea. Therefore—that word is the hinge point—set your mind on things above."),
      p("That word for \"seek\" in the Greek is zateo. It's the same word used in Luke 19:10 where it says that Jesus came to seek and save the lost. It's a present active verb—continually, progressively, constantly seeking. It's the same word used in Luke 15 to describe the shepherd persistently searching for his lost sheep."),
      p('Listen to this. The sum and substance of the Christian life is what you think upon with your mind. Show me what a man thinks about and I\'ll show you who that man really is. Proverbs 23:7 says, "As a man thinks within himself, so he is."'),
      p('When\'s the last time you sat down at dinner and said, "What are you most excited for about glory?" What thrills your heart? Because out of the heart, the mouth speaks. The tongue is the MRI of our heart. It tells us what we treasure.'),
      p('Every head ought to perk up when I talk about heaven. Every person ought to go, "Oh—home."'),
      p("A foggy view of the world to come results in a foggy resolve to live wholly and solely for Jesus Christ in this one."),
      p("Florence Chadwick was in 1952 the first woman to swim the English Channel both ways. She tried to swim from Catalina Island to the mainland of California. After fifteen hours, exhausted, begging to be pulled out. Her mother in the boat nearby kept saying, \"You're almost there, honey. Keep swimming.\" She stopped. They pulled her out. And as soon as she was in the boat, she realized through the fog she was just yards from the shore."),
      p("The next day they asked her why she gave up. She said, \"It was so foggy I couldn't see. If I could have only seen the shore, I think I could have made it.\""),
      p("Listen. This life is foggy. It's saturated with difficulty and sometimes drenched with sorrow. If you don't see the shore, you're going to get wrapped up in the fog."),
      {
        type: "reflection",
        items: [
          "If someone listened to your conversations for a week, would they think you treasure heaven or this world?",
          "What are you currently setting your mind on more—the things above or the things on earth?",
          "When did you last sit down and deliberately think about heaven?",
        ],
      },
      { type: "heart", text: "A man is what he thinks. I will set my mind on things above—persistently, constantly, progressively—because that is where my home is." },
      { type: "closing", text: "Stay dialed in." },
    ],
  },
  {
    id: 28,
    title: "If You've Seen Me, You've Seen the Father",
    author: "Jonny Ardavanis",
    date: "June 17, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "Philip wanted to see the Father. Jesus's answer is one of the most staggering claims in Scripture — and it still holds true for us today.",
    blocks: [
      p('"If you had known Me, you would have known My Father also; from now on you know Him, and have seen Him."'),
      p('Philip is anxious. Jesus has told them He\'s leaving. And Philip says what the rest of them are probably thinking: "Lord, show us the Father, and it is enough for us."'),
      { type: "quote", text: "When you look at Jesus, you are looking at God. He is the radiance of the glory of God and the exact representation of His nature.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "John 14:7-9; Colossians 2:9; Hebrews 1:3",
        verses: [
          "He who has seen Me has seen the Father; how can you say, 'Show us the Father'?",
          "For in Him all the fullness of Deity dwells in bodily form.",
          "He is the radiance of His glory and the exact representation of His nature.",
        ],
      },
      p('Philip is asking for a theophany. He wants to see a visible representation of the invisible God. He\'s saying, "Pull back the veil a little bit. Do something crazy, God. I want to see what Moses saw. I want to encounter something like the burning bush. I want to see what Ezekiel saw when he saw the crystal pavement before the throne."'),
      p("Have you ever felt that way? God, do something. I need You to strengthen my faith."),
      p('And Jesus responds with a gentle rebuke: "Have I been with you for so long, and yet you have not come to know Me, Philip?"'),
      p('That word for "seen" in John 14:9 isn\'t the common Greek word blepō—the word you\'d use for "I see that guitar" or "I see Bob." It\'s the word horaō—to see with understanding. To behold. To comprehend. Jesus is saying, "When you\'ve observed everything I\'m doing, when you\'ve truly looked, you see the Father."'),
      { type: "encourage", text: "When you look at Jesus, you are looking at God." },
      p('Colossians 2:9 says, "In Him all the fullness of Deity dwells in bodily form." Hebrews 1:3 says, "He is the radiance of His glory and the exact representation of His nature."'),
      p('The God who created the world really came 2,000 years ago. He took on flesh. He walked. He talked. He ate. He slept. And Jesus says, "When you look at Me, you are looking at God."'),
      p("I want you to know something. I have never seen a vision. I have never performed a miracle. I have never heard God speak audibly. I have never had an angel show up in my bedroom."),
      p("And yet what Jesus says here is immensely comforting. You want to see God? You want to see something powerful? We look to God's Word as He reveals His Son."),
      p('Peter—who witnessed the Transfiguration, who stood on that hill and saw Moses and Elijah in blazing light and heard the voice of God say, "This is My beloved Son"—that same Peter writes in his epistle, "But I have something more sure: the prophetic word to which you will do well to pay attention."'),
      p("According to Peter, who saw the supernatural on a regular basis, he trusts what's in your lap and in your hand more than what he saw with his own eyes. Experiences can be doubted. But God's Word cannot."),
      p("You want to see God? Open the Book. Look at Jesus."),
      {
        type: "reflection",
        items: [
          "When you read about Jesus in the Gospels, are you beholding Him with understanding—or just reading words on a page?",
          "Have you ever longed for a dramatic sign from God when the greater revelation is already in your hands?",
          "What does it mean to you personally that Jesus is the exact representation of the Father's nature?",
        ],
      },
      { type: "heart", text: "I don't need a vision. I have the Word. When I look at Jesus—I see God. That is enough." },
      { type: "closing", text: "Stay dialed in." },
    ],
  },
  {
    id: 29,
    title: "Greater Works Than These",
    author: "Jonny Ardavanis",
    date: "July 30, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "Jesus said we would do greater works than He did. That sounds outrageous — until you understand what kind of \"greater\" He meant.",
    blocks: [
      p('"Truly, truly, I say to you, he who believes in Me, the works that I do, he will do also; and greater works than these he will do; because I go to the Father."'),
      p("Greater works than Jesus? That sounds outrageous. But He said it. So let's think with me."),
      { type: "quote", text: "The power needed to change a heart is vastly superior to that which happens on the outside. There is nothing ordinary about this life. And there are no ordinary people.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "John 14:12; Luke 10:20; Mark 2:3-12",
        verses: [
          "He who believes in Me, the works that I do, he will do also; and greater works than these he will do.",
          "Nevertheless do not rejoice in this, that the spirits are subject to you, but rejoice that your names are recorded in heaven.",
        ],
      },
      p("Think carefully about what Jesus is saying here. It can't simply mean greater in quantity because John would have used the Greek word polla meaning more in number. It can't mean greater external signs because nothing in church history has ever provided evidence that believers did something greater than walking on water, feeding thousands, and raising Lazarus from a four-days-dead grave. That's unique."),
      p("So what does He mean?"),
      p("Not greater in quantity—greater in quality. Not greater in external signs—greater in the miracle God brings about in the heart of man."),
      p("And I know that sounds anticlimactic. But listen. God sees not as man sees. The barometer of greatness is vastly different in the eyes of God."),
      p('In Luke 10, the disciples come back to Jesus thrilled because they can cast out demons. And Jesus responds, "Nevertheless, do not rejoice in this. Rejoice that your names are recorded in heaven."'),
      p('When comparing physical miracles to spiritual miracles, Jesus says, "The power needed to change a heart is vastly superior to that which happens on the outside." A lame man can be healed. Then what? Thirty years later, he dies. But when someone is regenerated—when God takes a heart of stone and replaces it with a heart of flesh—that\'s eternal.'),
      p('Think about Mark 2. The paralytic is lowered through the roof. And Jesus says, "Son, your sins are forgiven." They grumble. And Jesus says, "So that you would know that I have power over the invisible, I\'m going to demonstrate My power over the visible." He heals him. But the greatest miracle that day was not the healing of a lame man. It\'s the transformation of a heart.'),
      p("Listen—when the Holy Spirit fell at Pentecost, Peter preached a 30-minute sermon (my guess). Three thousand people were added to their number. More people came to saving faith in Peter's sermon than in Jesus's entire three-year ministry. How? Because greater works than these you will do, because I go to the Father."),
      p("God invites you—not just pastors and missionaries—into His supernatural work."),
      p("When you tell your neighbor about Jesus, when you disciple your children, when you're faithful at the workplace—you're a participant in the power of God. You're in the miracle-working business."),
      {
        type: "reflection",
        items: [
          "Do you see the salvation of a soul as the greatest miracle—or have you been more impressed by external signs?",
          "Are you living as a participant in God's supernatural work, or as a spectator on the sidelines?",
          "Who in your life needs to hear the proclaimed Word of God from you this week?",
        ],
      },
      { type: "heart", text: "The greatest miracle is a changed heart. And God has invited me—ordinary me—into that supernatural work." },
      { type: "closing", text: "Stay dialed in." },
    ],
  },
  {
    id: 30,
    title: "Down but Not Out",
    author: null,
    date: "August 3, 2026",
    category: "Devotional",
    readTime: "6 min read",
    excerpt:
      "There's a kind of tired that sleep doesn't fix. If hope feels more like a memory than a promise right now, this one's for you — because being down is never the same as being finished.",
    blocks: [
      p("There's a particular kind of tired that sleep doesn't fix."),
      p("It's the tired that comes from being knocked down again — by the diagnosis, the rejection email, the relationship that didn't survive, the dream that seems to be dying a slow death. It's the exhaustion of getting back up one more time, only to feel like the ground is still moving beneath you. Maybe you're there right now. Maybe you're reading this on a day when hope feels less like a promise and more like a memory."),
      p("If that's you, I want you to know something before we go any further: you are not weak for feeling this way, and you are not alone in it. Scripture never asks us to pretend we're fine. It asks us to bring our not-fine selves honestly before a God who is not surprised, not distant, and not finished with us."),
      p("This is what it means to be down but not out."),
      { type: "heading", text: "A Biblical Picture of Afflicted but Not Crushed" },
      p("The Apostle Paul knew what it was to be knocked down. He'd been beaten, shipwrecked, imprisoned, betrayed, and exhausted for the sake of the gospel. He wasn't writing theory — he was writing from the floor. And from that floor, he wrote one of the most honest and hope-filled passages in all of Scripture:"),
      {
        type: "scripture",
        reference: "2 Corinthians 4:8-9, ESV",
        verses: [
          "We are afflicted in every way, but not crushed; perplexed, but not driven to despair; persecuted, but not forsaken; struck down, but not destroyed;",
        ],
      },
      p("Read that again slowly. Paul doesn't deny the affliction. He doesn't skip past the perplexity or pretend the persecution didn't hurt. He names every blow honestly — and then names the truth that outlasts every blow. Afflicted, but not crushed. Struck down, but not destroyed. The pain is real. But it is never the final word."),
      p("The prophet Micah gives us the same defiant hope from a different angle, speaking to an enemy who assumed Israel's fall was permanent:"),
      {
        type: "scripture",
        reference: "Micah 7:8, ESV",
        verses: [
          "Rejoice not over me, O my enemy; when I fall, I shall rise; when I sit in darkness, the LORD will be a light to me.",
        ],
      },
      p("When I fall, I shall rise. Not because Micah found a burst of willpower, but because his confidence was never in his own strength to begin with. It was in the character of a God who does not abandon His people in the dark. That's the difference between worldly resilience and gospel-rooted hope — one says I'll pull myself up; the other says He will not let me stay down."),
      p("This is the whole shape of the gospel story, really. Christ Himself was struck down — genuinely, brutally, all the way to a Roman cross and a sealed tomb. If the story had ended there, it would be a tragedy. But Sunday came. The stone rolled away. Death, which seemed to have won, was swallowed up in victory. Every believer's story is now folded into that story."),
      { type: "encourage", text: "Our lowest moment is never the last chapter, because it wasn't His either." },
      { type: "heading", text: "Shifting Our Eyes from the Trial to the Promise" },
      p("Knowing this truth and feeling it in the middle of a hard season are two different things. So here are a few gospel-centered ways to move your focus from what's crushing you to what's carrying you."),
      { type: "heading", text: "1. Name the trial honestly before God — don't perform strength for Him." },
      p('Half the Psalms are laments. David didn\'t edit his pain before bringing it to God; he brought it raw. "Why are you cast down, O my soul, and why are you in turmoil within me? Hope in God" (Psalm 42:11, ESV) is both a question and an answer in the same breath. Honesty with God is not a lack of faith — it\'s the beginning of it.'),
      { type: "heading", text: "2. Remember what remains true even when everything else feels uncertain." },
      p("Your circumstances may be unstable, but His character is not."),
      {
        type: "scripture",
        reference: "Lamentations 3:22-23, ESV",
        verses: [
          "The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.",
        ],
      },
      p("This verse was written in the middle of a book about the destruction of Jerusalem — genuine devastation. And yet, right in the wreckage, the writer chooses to remember mercy that renews daily. You don't need strength for the whole road today. You only need enough for this morning, and He supplies it fresh."),
      { type: "heading", text: "3. Trade the temporary measuring stick for the eternal one." },
      p("Paul, just a few verses after 2 Corinthians 4:8-9, gives us the secret to how he kept perspective:"),
      {
        type: "scripture",
        reference: "2 Corinthians 4:17-18, ESV",
        verses: [
          "For this light momentary affliction is preparing for us an eternal weight of glory beyond all comparison, as we look not to the things that are seen but to the things that are unseen. For the things that are seen are transient, but the things that are unseen are eternal.",
        ],
      },
      p('He\'s not minimizing suffering by calling it "light momentary affliction" — he\'s recalibrating what it\'s being weighed against. Against eternity, even our heaviest seasons are producing something that will outlast them.'),
      { type: "heading", text: "4. Let your weakness be the place He shows up." },
      p('When Paul begged God to remove a painful "thorn in the flesh," God\'s answer wasn\'t removal — it was presence:'),
      {
        type: "scripture",
        reference: "2 Corinthians 12:9, ESV",
        verses: [
          "My grace is sufficient for you, for my power is made perfect in weakness.",
        ],
      },
      p("Your exhaustion isn't disqualifying. It's often exactly where God's strength becomes most visible."),
      { type: "heading", text: "5. Don't carry it alone." },
      p('The church exists, in part, so that no believer has to be "down but not out" in isolation. Let someone pray for you this week. Say the hard sentence out loud to a trusted friend. Community is not a nice extra in the Christian life — it\'s one of the ordinary ways God holds His people up.'),
      { type: "heading", text: "You Are Still in the Story" },
      p("Here's the truth I want you to carry with you when you close this page: being down is not the same as being finished."),
      p("The Christian life was never promised to be free of pressure, sorrow, or failure. What it was promised is a Savior who has already walked through death and come out the other side — and who has pledged that our story, joined to His, ends the same way. Not in ruin. In resurrection."),
      {
        type: "scripture",
        reference: "Philippians 1:6, ESV",
        verses: [
          "He who began a good work in you will bring it to completion at the day of Jesus Christ.",
        ],
      },
      p("So take a breath. You are not required to have it all figured out today. You are only asked to keep your eyes fixed on the One who has already secured how this ends. Afflicted, but not crushed. Struck down, but not destroyed. Fallen, but rising — because He is your light in the dark."),
      {
        type: "reflection",
        items: [
          'Where in your life right now do you feel "afflicted" but need to remember you are not "crushed"?',
          "What would it look like this week to bring your honest pain to God instead of performing strength for Him?",
          "Who is one person you could ask to walk through this season with you?",
        ],
      },
      { type: "prayer", text: "Lord, You see what I'm carrying, and You haven't looked away. When I feel struck down, remind me that I am not destroyed. Renew my strength this morning, fix my eyes on what is above, and let Your power be made perfect in my weakness. I trust that You who began this good work in me will carry it through. In Jesus' name, Amen." },
      { type: "closing", text: "Down, yes. But never, ever out." },
    ],
  },
  {
    id: 31,
    title: "Always Dependable",
    author: null,
    date: "August 2, 2026",
    category: "Teaching",
    readTime: "3 min read",
    excerpt:
      "David called himself righteous while surrounded by trouble — but Romans 3:10 says no one is righteous. Here's how both are true, and why it means God never runs out of reasons to show up for you.",
    blocks: [
      p("Do you ever feel like life has knocked the breath out of you? If so, you're not alone. In fact, it's no secret that this world is full of both beauty and trouble—of good things and hard things."),
      p("King David, whose life was recorded in various parts of the Old Testament, was highly accustomed to trouble—constantly threatened by legitimate enemies and faced with the reality of impending death."),
      p("Yet, inspired by the Holy Spirit, he wrote:"),
      {
        type: "scripture",
        reference: "Psalm 34:19, ESV",
        verses: [
          "Many are the afflictions of the righteous, but the LORD delivers him out of them all.",
        ],
      },
      p("If there's one thing you can depend on, it's that God is alive, active, and ever-present in your life … even the hardest parts of your life."),
      p('But who is the "righteous person" David speaks of in this particular Psalm, when other parts of the Bible say things like, "no one is righteous—not even one"? (Romans 3:10, Psalm 14:3). There\'s a trick to understanding this at-first-glance contradiction:'),
      { type: "encourage", text: "Righteousness can't be achieved, but it can be given." },
      p("When we trust in God, as well as His Son, Jesus Christ (who sacrificed His life so that we could truly live), we're trusting that His righteousness will extend to us as well."),
      p("To put it simply, a righteous person is one who relies on God's righteousness."),
      p("Seems unfair and unmerited, doesn't it? But that's grace. It's by grace, through faith, that we—that you—can be counted as righteous. You can't work for it and you can't buy it."),
      p("Because of that, when we're facing hard things, we can expect God to show up in a million unique ways. Not because we're righteous on our own, but because He is righteous on His own. And His righteousness has no limits."),
      p("So how does God show up?"),
      {
        type: "list",
        items: [
          "He guides.",
          "He comforts.",
          "He corrects.",
          "He reroutes.",
          "He reminds us of true things.",
          "He helps us persevere.",
          "He brings wisdom and discernment to our minds.",
          "He inspires others to help us.",
          "He compels us to help others.",
          "He gives us peace in the midst of trouble.",
          "He encourages us as we stand boldly in faith.",
          "He works and works and works in mysterious ways.",
        ],
      },
      p("And just when you might wonder if your neediness is becoming a nuisance to God, remember: God's presence is inexhaustible and His resources are limitless."),
      { type: "heart", text: "It's good to need God every moment of every day. To breathe. To survive. To flourish." },
      { type: "closing", text: "So yes, trouble will come. But God will never leave your side." },
    ],
  },
  {
    id: 32,
    title: "Living in God's Love",
    author: null,
    date: "August 10, 2026",
    category: "Devotional",
    readTime: "3 min read",
    excerpt:
      "A good friend reminds you who you are. God is a friend like that — except love isn't just what He does, it's what He is. Here's what changes when you actually live inside that.",
    blocks: [
      p("Have you ever met someone who was exceptionally kind and caring? Good friends are like this—welcoming, eager to know how you're doing, giving their undivided attention. A good friend reminds us who we are. They listen to everything, the good and the bad, with compassion and love."),
      p("God is a friend like this. He listens. He empathizes. He cares so much for us, and is kind in His responses. In fact, God does more than just show love—He is love. It is impossible for Him to be anything else because love is His very essence. His love is pure. It isn't selfish, disengaged, bitter, resentful, or passive. We can trust this kind of love. We can trust God."),
      {
        type: "scripture",
        reference: "1 John 4:16",
        verses: [
          "And so we know and rely on the love God has for us. God is love. Whoever lives in love lives in God, and God in them.",
        ],
      },
      p("How do you feel after you've spent time with a good friend? Maybe you feel more relaxed, you have a spring in your step, or you find that you have more courage to keep going. You might even find yourself loving others better because you feel so loved. The ripple effect of living in God's love is just like this and more. You can't help but love others when you know and experience how much God loved you."),
      p("This is the life we are invited to. A life that knows and relies on the love God has for us, and then loves others because of it. Today, how will you discover the love God has for you? When you know and experience the love God has for you, everything changes."),
    ],
  },
  {
    id: 33,
    title: "Keep Doing Good",
    author: null,
    date: "August 11, 2026",
    category: "Devotional",
    readTime: "4 min read",
    excerpt:
      "Even good people get tired of doing good. Paul knew that too — and told the Galatians exactly what to do about it.",
    blocks: [
      p("Do you remember the last time you were completely exhausted? Maybe you spent your entire day or week working on a hard project. Maybe you felt depleted after helping other people in your life. Or maybe hard situations and setbacks made you feel like giving up. All of us grow tired at some point."),
      p("Paul, the writer of Galatians, knew that the people he was writing to would also become weary of the work they were doing. During Paul's time, there was a lot of persecution and hurting people, and Paul was writing to encourage them in the work they were doing."),
      {
        type: "scripture",
        reference: "Galatians 6:9",
        verses: [
          "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
        ],
      },
      p("Inside Paul's encouragement to the Galatians is this truth: Even good people will tire of doing good things."),
      p("That's why Paul encourages everyone to continue to push forward in doing good. We should continue to help people. We should continue to share the hope of Jesus with people. We should continue to try and live as God would want us to."),
      p("God knows that we'll eventually grow weary. And when we grow tired and frustrated, we'll probably begin to question why we're doing any of this to begin with. (Maybe you've already asked yourself this.)"),
      p("But Galatians 6:9 encourages us to persevere in doing good things. Similar to how a farmer must work diligently to plant his crops and wait months before the actual harvest, Paul says there will be a harvest for those who do not give up."),
      p("Just like the Christians in Galatia, we also need to persevere in living godly lives and helping those around us. If we do not give up, Scripture says there will be a reward for us. We may receive that reward during our time on earth, or in heaven—but regardless of when we receive it, we should persevere in doing good."),
      p("That means that your work matters. There is value to how you live and love others."),
      p("So spend some time today considering the good that you have done and can continue to do for others. Who can you help? Who can you share the hope of Jesus with? How can you continue to persevere in living a godly life?"),
      p("If you've grown weary or defeated, make a commitment today to never give up. Choose to persevere through whatever season of life you're in, knowing that there will be a harvest for those who finish well."),
      { type: "prayer", text: "God, help me to never get tired of doing good things in Your name. As I grow closer to You, give me the endurance to serve and love others well—no matter how I'm feeling. I want my life to bring those around me closer to You. Thank You for never giving up on me! Amen." },
    ],
  },
  {
    id: 34,
    title: "Called to Love",
    author: null,
    date: "August 13, 2026",
    category: "Teaching",
    readTime: "6 min read",
    excerpt:
      "You'll never fully agree with everyone in your life — and that was never the condition for loving them. Here's what Jesus actually commanded, and what it looks like to love well without losing yourself in the process.",
    blocks: [
      p("You will never fully agree with another person. Not completely — not even with the people you're closest to."),
      p("That's not a flaw in your relationships. It's simply because there isn't another person on earth exactly like you. No one carries your exact story, your exact convictions, your exact way of seeing politics, money, relationships, or faith. You are unmistakably you. And the person sitting across from you—at your dinner table, in your church pew, on the other side of an argument—is unmistakably them."),
      p("Given how different we all are, it's no surprise that disagreement is part of life. But here's what should surprise us: our differences were never meant to be a reason to withhold love. Jesus was clear about this. On the night before His death, He gave His followers a command that had nothing to do with agreement and everything to do with love:"),
      {
        type: "scripture",
        reference: "John 13:34, NIV",
        verses: [
          "A new command I give you: Love one another. As I have loved you, so you must love one another.",
        ],
      },
      p('Notice what Jesus didn\'t say. He didn\'t say, "Love one another once you see eye to eye." He didn\'t say, "Love the people who think like you." He said simply: love one another. And in case anyone thought this only applied to people who were easy to love, He went further:'),
      {
        type: "scripture",
        reference: "Matthew 5:44",
        verses: [
          "Love your enemies and pray for those who persecute you.",
        ],
      },
      p("If love is commanded even toward our enemies, then it's certainly meant for the neighbor down the street, the coworker who frustrates us, and the family member we don't quite understand."),
      { type: "heading", text: "Love Your Neighbor as Yourself" },
      p("When someone once asked Jesus which commandment mattered most, He didn't point to one law—He pointed to two, and said they were inseparable:"),
      {
        type: "scripture",
        reference: "Mark 12:30-31",
        verses: [
          "Love the Lord your God with all your heart... Love your neighbor as yourself. There is no commandment greater than these.",
        ],
      },
      p("Then, to make sure no one could narrow the definition of \"neighbor\" down to just the people they liked, Jesus told the story of the Good Samaritan (Luke 10:25-37)—a man from a group despised by the religious crowd of the day, who stopped to help a stranger everyone else had walked past. The people who had every social and religious reason to help didn't. The one person with every reason to keep walking didn't either—he stopped, bandaged the wounds, and paid for the stranger's care out of his own pocket."),
      p("Jesus' point was simple and uncomfortable: your neighbor isn't defined by who's like you. It's defined by who's in front of you."),
      { type: "heading", text: "What Love Actually Looks Like" },
      p("Love, as Jesus modeled and taught it, isn't a feeling that shows up when circumstances are easy. It's a posture we choose. Scripture paints a fairly practical picture of what that posture looks like day to day:"),
      {
        type: "list",
        items: [
          "Love considers others first.",
          "Love looks for the best in people.",
          "Love shows respect, even in disagreement.",
          "Love seeks unity rather than division.",
          "Love isn't self-serving.",
          "Love displays patience.",
        ],
      },
      p("This is basically a plain-language version of what Paul wrote in 1 Corinthians 13—love is patient, love is kind, love does not insist on its own way. It's a high standard. And it's one none of us live up to perfectly."),
      { type: "heading", text: "Giving of Yourself, Without Giving Up Your Wellbeing" },
      p("To love people well often means giving of yourself—being present, being generous, letting people see who you really are instead of hiding behind a polished version of yourself. That kind of openness carries risk. People may not receive your honesty the way you hoped. Relationships built on real vulnerability can, at times, lead to disappointment or hurt."),
      p("But loving people this way doesn't mean deliberately walking into harm, or staying in situations where someone is repeatedly disrespecting or mistreating you. Loving someone and protecting your own wellbeing aren't opposites. Jesus loved people fully, and He also withdrew to rest, set boundaries with those trying to trap or manipulate Him, and didn't entrust Himself to people whose intentions weren't genuine (John 2:24). Wisdom and love were never at odds in His example."),
      p('So love generously—but that doesn\'t mean ignoring red flags or accepting mistreatment in the name of "being loving." You can love someone from a distance. You can love someone and still say no. You can care about a person\'s wellbeing without handing them the ability to repeatedly hurt you. Love gives of itself; it doesn\'t require you to erase yourself.'),
      p("We won't always agree. We won't always understand each other. But Jesus' command to love was never contingent on agreement—it starts with a willingness to love the person in front of us the way we've been loved. Not because it's easy. Because it's who we're called to be."),
      {
        type: "reflection",
        items: [
          "Who in your life is hardest to love right now — and what would it look like to love them well, even without full agreement?",
          "Where might you need to set a healthy boundary while still holding onto love for someone, rather than choosing between the two?",
          "Is there a \"neighbor\" in your life you've overlooked simply because they're different from you?",
        ],
      },
      { type: "prayer", text: "Lord, thank You for loving me first, long before I had anything figured out. Teach me to love others the way You've loved me—patiently, honestly, and without requiring agreement first. Give me wisdom to love people well while also protecting the heart You've given me. Help me see the neighbor in front of me the way You do. In Jesus' name, Amen." },
    ],
  },
  {
    id: 35,
    title: "The Sweetness of Patience",
    author: null,
    date: "August 16, 2026",
    category: "Devotional",
    readTime: "2 min read",
    excerpt:
      "Fruit picked too soon lacks the sweetness time was meant to give it. James says the same is true of a faith that skips patience — here's what the waiting is actually for.",
    blocks: [
      p("Have you ever plucked fruit prematurely?"),
      p("Perhaps you were drawn in by its vibrant color or sweet scent moving through the air. But when you took the first bite, you realized it lacked the ripeness you anticipated. Everything seemed right at first glance, but there was one missing ingredient…"),
      p("Time."),
      p("Even the simple act of picking fruit can teach us about time and patience:"),
      {
        type: "scripture",
        reference: "James 5:7-8",
        verses: [
          "Be patient, then, brothers and sisters, until the Lord's coming. See how the farmer waits for the land to yield its valuable crop, patiently waiting for the autumn and spring rains. You, too, be patient and stand firm because the Lord's coming is near.",
        ],
      },
      p("The author, James, penned these words under the inspiration of the Holy Spirit to a community of new Jewish converts to Christianity, dispersed throughout various regions. These early Christians faced many trials, including persecution and opposition, because of their newfound faith. James' call to wait patiently and endure was more than mere words on a page; they were a lifeline of hope and encouragement in the midst of adversity."),
      p("And just as those early believers confronted trials, we, too, will encounter challenges and suffering in our Christian journey. And, just like those early believers, you can choose patience—allowing the fruit of the Spirit to ripen within you, no matter the season of life. And when you do, your character will mature, your faith will deepen, and your relationship with God will become sweeter than you could imagine."),
      { type: "encourage", text: "Patience always bears the fruit of perseverance and strength, even today and even for you!" },
    ],
  },
  {
    id: 36,
    title: "The Peace That Guards",
    author: "Jonny Ardavanis",
    date: "August 17, 2026",
    category: "Devotional",
    readTime: "3 min read",
    excerpt:
      "Paul wrote \"be anxious for nothing\" from a jail cell, facing execution. What actually produces that kind of peace — and why it functions like an elite guard around a trusting heart.",
    blocks: [
      p('"And the peace of God, which surpasses all comprehension, will guard your hearts and your minds in Christ Jesus." Paul wrote those words from a jail cell. He was about to be beheaded. And he says, "Be anxious for nothing."'),
      { type: "quote", text: "Peace is the derivative of trust. And trust is the product of beholding God as revealed in His Word.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "Philippians 4:6-7; Isaiah 26:3; Colossians 3:15",
        verses: [
          "Be anxious for nothing, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all comprehension, will guard your hearts and your minds in Christ Jesus.",
          "You will keep him in perfect peace, whose mind is stayed on You, because he trusts in You.",
          "Let the peace of Christ rule in your hearts.",
        ],
      },
      p("Peace has been given to you if you're in Christ. But gifts have to be received. God's peace doesn't simply fall into your lap as you wait for it. It is something we must pursue."),
      p("So how do we experience it?"),
      { type: "heading", text: "Start Here: Faith" },
      p("People say, \"I placed my faith in Christ once upon a time.\" And we treat faith as if it's a past tense event. But the Scripture says the righteous shall live by faith—present tense. Faith is not a thing. Faith is an exercise. It is a constant fixation of your gaze and your mind upon who God is."),
      p("Isaiah 26:3: \"You will keep him in perfect peace, whose mind is stayed on You, because he trusts in You.\""),
      p("A mind stayed on God. Not glancing at God. Stayed on God. Fixed. Anchored."),
      p('Now Philippians 4:6—and don\'t miss the four words just before it. "The Lord is near." That\'s the background. If you don\'t understand God\'s nearness, you have much to be anxious about. But if the Lord is near, then Paul can say—from a jail cell, facing execution—"Be anxious for nothing."'),
      p('Not, "be anxious for less." Paul says, "nothing."'),
      p('Paul continues, "But in everything by prayer and supplication..." with what? Thanksgiving. Because one of the ways you solidify your convictions about the character of God is by thanking Him that He is who He reveals Himself to be. Thank You, God, that You are sovereign and loving and wise. You begin your prayer not with a grocery list of needs but with adoration. And as you pray this way, God\'s Spirit takes that truth and impresses it upon your heart so that it\'s not just something you check off—it\'s something you taste and believe.'),
      p('"And then the peace of God—which surpasses all comprehension..." Meaning what? This peace doesn\'t make sense to the watching world—"will guard your hearts and minds in Christ Jesus."'),
      p("That word \"guard\" is phrouros—an elite military unit standing outside a double-walled city. Impenetrable. Nothing is getting in."),
      p("And Colossians 3:15: \"Let the peace of Christ rule in your hearts.\" That word rule is brabeuō—it means umpire or arbitrator. The peace of God functions as the umpire in your heart. Anything that comes across the plate—any trial, any evil, any uncertainty—the peace of God calls it. And it guards you."),
      p('Horatio Spafford lost everything in the Chicago fire of 1871. He sent his wife and four daughters on a voyage to England. The ship was struck and sunk. All four daughters drowned. His wife survived and telegrammed him: "Saved alone, what shall I do?" He crossed the Atlantic to meet her. And the captain, knowing his tragedy, pointed to the place where his daughters had died.'),
      p('There, over those waters, Horatio Spafford wrote: "When sorrows like sea billows roll—whatever my lot, Thou hast taught me to say, it is well, it is well with my soul."'),
      p("That is supernatural peace. That is the garrison of God around a broken heart. That is what Jesus promised and what He delivers."),
      {
        type: "reflection",
        items: [
          "Are you exercising faith daily—fixing your mind on God—or treating faith as a past-tense event that happened when you got saved?",
          "Is your prayer life characterized by thanksgiving and adoration, or just a grocery list of requests?",
          "Can you say with Horatio Spafford, \"Whatever my lot—it is well with my soul\"? If not, what is preventing you?",
        ],
      },
      { type: "heart", text: "The peace of God will guard my heart like an elite garrison. Nothing gets through. But I must fix my mind on Him. Stay there. Trust Him." },
    ],
  },
  {
    id: 37,
    title: "The True Vine",
    author: "Jonny Ardavanis",
    date: "August 19, 2026",
    category: "Devotional",
    readTime: "2 min read",
    excerpt:
      "Jesus doesn't just say \"I am a vine.\" He says \"I am the true vine.\" What Israel's whole history says about the false one — and what actually connects anyone to God.",
    blocks: [
      p('Jesus doesn\'t say "I am a vine." He says "I am the true vine." Circle that word. True. Because if Jesus is the true vine, there has to be a false one.'),
      { type: "quote", text: "Nobody is connected to God the Father unless they are connected by faith to His one and only Son, Jesus Christ.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "John 15:1; Isaiah 5:1-7; Jeremiah 2:21",
        verses: [
          "I am the true vine, and My Father is the vinedresser.",
          "I planted you like a choice vine, a completely faithful seed. How then have you turned yourself before Me into degenerate shoots of a foreign vine?",
        ],
      },
      p('Throughout the Old Testament, God refers to His people Israel as His chosen vineyard. Isaiah 5—He dug around it. He planted it with the choicest vine. He built a tower. He put a hedge. He said, "This is My vineyard." And He expected it to produce good grapes.'),
      p("But it produced only worthless ones."),
      p('Isaiah 5:7: "The vineyard of the LORD of hosts is the house of Israel." He looked for justice—but behold, bloodshed. He looked for righteousness—but behold, a cry of distress.'),
      p('Jeremiah 2:21: "I planted you like a choice vine. How then have you turned yourself before Me into degenerate shoots of a foreign vine?"'),
      p("Ezekiel 15 says Israel is likened to a vine that ought to be burned. Hosea calls them empty vines, strange vines with no leaves."),
      p("At every stage throughout their history, God's people should have borne fruit. They should have looked like God. Instead they defected, rebelled, served idols, looked exactly like the nations around them. Thought they were connected to God. But bore no fruit of it."),
      p('And Jesus stands up and says, "I am the true vine."'),
      p("Which means what? As a branch, you could have no right connection to God unless you are connected to Me."),
      p('The Jews said, "We are descendants of Abraham. We have God as our father." And Jesus says, "No. You are not connected to God at all." Nobody is connected to God the Father unless they are connected by faith to His one and only Son Jesus Christ.'),
      p('This is why Paul says not all Israel is Israel. You can have external circumcision, but the circumcision God is after is the circumcision of the heart. Jesus tells them, "If you were really of Abraham, you would believe in Me."'),
      p("Can I ask you a question? Are you genuinely connected to the vine—or are you like the nation of Israel, going through the motions, externally religious, looking the part, bearing no fruit?"),
      p('Jesus says there are professors of faith who are not possessors. Many are going to stand before Him on that day and say, "Lord, Lord, did we not prophesy in Your name?" And He\'s going to look at them and say, "I never knew you."'),
      p('"Many."'),
      p("The true vine is Jesus. And you either are connected to Him by faith—or you are not connected to God at all."),
      {
        type: "reflection",
        items: [
          "Is your connection to God genuine and fruitful, or is it religious and external—going through the motions?",
          "Have you ever asked the question seriously: is my faith truly saving faith, or am I a professor who is not a possessor?",
          "What fruit in your life demonstrates that you are truly connected to the true vine?",
        ],
      },
      { type: "heart", text: "Israel was the false vine—religious, external, fruitless. Jesus is the true vine. I am connected to God only through Him—and only genuinely if I bear fruit." },
    ],
  },
  {
    id: 38,
    title: "From Dawn to Dusk",
    author: null,
    date: "August 20, 2026",
    category: "Devotional",
    readTime: "3 min read",
    excerpt:
      "From every nation, language, and skin color to every season your heart is in — worship was never meant to wait for perfect circumstances. It's for right now, from dawn to dusk.",
    blocks: [
      p("Close your eyes for a moment. And while you do that, picture this wonderfully diverse planet we call home. (Yes, really.)"),
      p("Everything that you just imagined—God created all of it. And God created all of us to worship Him."),
      p("From north to south and east to west. From bustling cities to slow-paced villages. From lifeless deserts to life-packed forests. From the highest mountains to the farthest oceans."),
      {
        type: "scripture",
        reference: "Psalm 113:3, NIV",
        verses: [
          "From the rising of the sun to the place where it sets, the name of the Lord is to be praised!",
        ],
      },
      p("The sun \"rises\" and \"sets\" on all of us. All people, all languages, all nations. All skin colors, eye colors, and hair colors. All shapes, sizes, and personalities. Rich and poor. Aching hearts and contagious smiles."),
      p("An eclectic mix of people from various parts of the world have been praising God from generation to generation—and it continues to happen now. And we know it will never stop."),
      p('In Revelation 7, John has a vision of a "great multitude that no one could count, from every nation, tribe, people, and language, standing before the throne and before the Lamb," who is Christ. They are serving and worshiping, all day and night.'),
      p("God's people—past, present, and future—are a worshiping people."),
      {
        type: "list",
        items: [
          "We can worship with our songs.",
          "We can worship with our money.",
          "We can worship with our lives.",
        ],
      },
      p("And one day, when we finally see things clearly, every knee will bow and every tongue will confess that Jesus Christ is Lord. But today, we don't have to wait to worship."),
      {
        type: "list",
        items: [
          "When sunlight streams through your windows, you can worship.",
          "When the evening sky turns orange-ish pink, you can worship.",
          "When you're in a season of waiting, you can worship.",
          "When you're in a season of receiving, you can worship.",
          "When your heart is breaking, you can worship.",
          "When your heart is full, you can worship.",
        ],
      },
      p("From dawn to dusk, let the name of the Lord be praised."),
      p("Today, think about this verse and consider what compels you to worship God. Then, shift your heart toward Him and don't forget to worship."),
      { type: "prayer", text: "God, You are good. No matter what goes on around me—You are good. You are worthy of praise because You are God. You provide for me, strengthen me, deliver me, and heal me. Even when I don't see You at work in my life, that doesn't change the fact that You are working. There is no one like You. So regardless of what I face today, I will praise You! In Jesus' name, Amen." },
    ],
  },
  {
    id: 39,
    title: "He Prunes Every Branch That Bears Fruit",
    author: "Jonny Ardavanis",
    date: "August 21, 2026",
    category: "Devotional",
    readTime: "3 min read",
    excerpt:
      "\"Every branch that bears fruit, He prunes it so that it may bear more fruit.\" What God's pruning actually looks like in the middle of trial, disappointment, and loss — and why it's love, not punishment.",
    blocks: [
      p('"Every branch that bears fruit, He prunes it so that it may bear more fruit." Want to know God\'s will for your life? More fruit. How does He do that? Well, let\'s not be creative. Let\'s just read.'),
      { type: "quote", text: "God does love you as you are, but He has no intention of leaving you as you are.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "John 15:2; Hebrews 12:5-7, 11; Psalm 119:71",
        verses: [
          "Every branch that bears fruit, He prunes it so that it may bear more fruit.",
          "For those whom the Lord loves, He disciplines, and He scourges every son whom He receives... All discipline for the moment seems not to be joyful, but sorrowful; yet to those who have been trained by it, it yields the peaceful fruit of righteousness.",
          "It was good for me that I was afflicted, that I may learn Your statutes.",
        ],
      },
      p("When a farmer tends to his fields, he cleanses the branch of anything that would thwart further growth. He takes the knife to the branch and removes things. The Greek word is kathairo—to clean, to prune. The Father is making us more like Christ."),
      p("This is why James says to consider it all joy when you encounter trials—because the testing of your faith transforms us. If the vinedresser loves his vineyard, he doesn't just let it be. He scrutinizes, examines, and removes anything toxic."),
      p("How does God prune us? Through difficulty. Through disappointment. Through failure. Through loss. Through pain. Through unmet expectations and unrealized hopes."),
      p('David says in Psalm 119:71, "It was good for me that I was afflicted, that I may learn Your statutes." This is God\'s love gift to His own. Pruning.'),
      p('Hebrews 12:5-7 says: "My son, do not regard lightly the discipline of the Lord, nor faint when you are reproved by Him. For those whom the Lord loves, He disciplines, and He scourges every son whom He receives." And then verse 8—and this is sobering: "If you are without discipline of which all have become partakers, then you are illegitimate children and not sons."'),
      p("If you've never felt the pruning work of God, you're not a legitimate child. That's just what it says."),
      p("I would be concerned for the soul of someone who has never been in a trial."),
      p('John Newton wrote: "I asked the Lord that I might grow in faith and love and every grace. Instead, He made me feel the hidden evils of my heart and let the angry powers of hell assault my soul. The Lord replied: I answered prayer for grace and faith. These inward trials I employ from self and pride to set thee free—that thou might seek thine all in Me."'),
      p("Newton asked to become like Christ. And God sent him trials to wean him from the world and from dependence on his own strength."),
      p("God does love you as you are. But He has no intention of leaving you as you are."),
      p('CS Lewis pictures this in Eustace, the boy turned dragon in The Voyage of the Dawn Treader. He frantically scratches at his own scales—but no matter how deep he picks, there is only more dragon underneath. Then Aslan, the Christ figure, says: "You will have to let me undress you." And the very first tear Aslan makes goes so deep that Eustace thinks it has gone to his heart. But then the skin peels off.'),
      p("You cannot prune yourself. God must do it."),
      p("And Spurgeon said it well: affliction is the handle, but the Word of God is the knife."),
      {
        type: "reflection",
        items: [
          "Are you currently in a trial? Have you considered that the vinedresser may be pruning you—not punishing you?",
          "If you've never experienced the discipline of God, does that concern you?",
          "What would it look like to have joy in your current trial because you know God is producing more fruit?",
        ],
      },
      { type: "heart", text: "The Father prunes every branch that bears fruit. He is not against me in my trial. He is for me—removing what prevents more fruit. This is His love." },
    ],
  },
  {
    id: 40,
    title: "Apart From Me You Can Do Nothing",
    author: "Jonny Ardavanis",
    date: "August 24, 2026",
    category: "Devotional",
    readTime: "2 min read",
    excerpt:
      "\"Apart from Me you can do nothing.\" Not a little — nothing. What it actually means to abide in the vine, and why so little spiritual growth might trace back to thinking you're the vine instead of the branch.",
    blocks: [
      p('"I am the vine, you are the branches; he who abides in Me and I in him, he bears much fruit, for apart from Me you can do nothing."'),
      p("Nothing. Not a little. Nothing."),
      { type: "quote", text: "Could it be that part of the reason you see such little growth in your life is because you think you're a vine and not a bruised branch?", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "John 15:4-5; Philippians 2:12-13; Galatians 5:22-23",
        verses: [
          "Abide in Me, and I in you. As the branch cannot bear fruit of itself unless it abides in the vine, so neither can you unless you abide in Me.",
          "Work out your salvation with fear and trembling; for it is God who is at work in you, both to will and to work for His good pleasure.",
          "The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control.",
        ],
      },
      p("Eleven times in eleven verses in John 15, Jesus uses the word remain. Abide. Stay with Me. That is not an accident."),
      p("The believer's responsibility is to abide. What does that mean? It means we remain close to Jesus. It means we live in constant dependence on Him. All Christian growth is organic growth—something God brings about as we live near to Him."),
      p('Jesus says, "You are the branches." By the way—you\'re not a trunk. You\'re not an oak tree. Jesus says we are smoldering wicks, bruised reeds (Matthew 12:20). And unless we are connected to the vine, He says, "Apart from Me you can do nothing."'),
      p("What does that mean? It doesn't mean you can't play Christian. A lot of people have done that. A lot of people have written Christian books, preached sermons, lived the Christian life thinking they could do it on their own."),
      p('When He says, "Apart from Me you can do nothing"—He means you can bear no actual fruit. You can play the game. But you cannot bear fruit unless you\'re abiding in the vine.'),
      p('Philippians 2:12-13 says, "Work out your salvation with fear and trembling. For it is God who works in and through you to will and to work for His good pleasure." We work—but it is God working in and through us.'),
      p("Can I just ask you a question? Could it be that part of the reason you see such little growth in your life is because you think you're a vine and not a bruised branch?"),
      p('You think the power is in you. You think the life comes from you. And Jesus says, "No—apart from Me, you can do nothing." The branch does not generate life. It receives it from the vine. The only job of the branch is to stay connected.'),
      p("Stay close. Abide. Remain. And the fruit will come—because fruit is what happens when a branch stays in the vine."),
      {
        type: "reflection",
        items: [
          "Are you trying to bear fruit through your own effort and discipline, or through dependence on Christ?",
          "What does it look like practically for you to abide in Christ this week—in your prayer life, your time in the Word, your fellowship with His people?",
          "Where in your life are you acting like the vine instead of the branch—relying on your own strength rather than His?",
        ],
      },
      { type: "heart", text: "I am a branch, not a vine. My job is not to generate life. My job is to stay connected. Apart from Him, nothing. In Him, much fruit." },
    ],
  },
  {
    id: 41,
    title: "Peace I Leave With You",
    author: "Jonny Ardavanis",
    date: "August 12, 2026",
    category: "Devotional",
    readTime: "2 min read",
    excerpt:
      "Over a billion people live with a mental health disorder, and people pay $1,600 for a moment of quiet. Into all of that, Jesus offers something no retreat can — because He doesn't just give peace. He is peace.",
    blocks: [
      p("Over a billion people worldwide are living with a mental health disorder. 32% of US adults report anxiety or depression. Anti-depressants among 12 to 24 year olds are up 66% since 2016. People are paying $1,600 to go to digital detox camps just to get a moment's quiet."),
      p("And into all of that, Jesus says something staggering."),
      { type: "quote", text: "The world promises you peace and gives you sand. God promises peace and gives you a double-walled castle.", attribution: "Jonny Ardavanis" },
      {
        type: "scripture",
        reference: "John 14:27; Judges 6:24; Ephesians 2:14",
        verses: [
          "Peace I leave with you; My peace I give to you; not as the world gives do I give to you. Do not let your heart be troubled, nor let it be fearful.",
          "The LORD is peace.",
          "For He Himself is our peace.",
        ],
      },
      p("It's Thursday night of Passion Week. Jesus is hours from His arrest, trial, beating, and crucifixion. The disciple's hopes are scraping the ground. They're despairing. They're afraid. And in the middle of His own great trouble and turmoil, Jesus begins to lob their way precious promises—promises intended to lift up their countenance and give them not just comfort but courage as well."),
      p("And He saves one final gift for last."),
      p('"Peace I leave with you. My peace I give to you."'),
      p('Circle that word: My. This is not the world\'s peace. He says so Himself. "Not as the world gives do I give to you." The world\'s peace is empty, hollow, fleeting, fickle, fading. It\'s transient. It\'s not real.'),
      p("But Jesus doesn't just provide peace. He doesn't just distribute peace like a vending machine. Look at Judges 6:24—God's name there is Yahweh Shalom. The Lord is peace. God's names are not arbitrary labels. They are representative of His nature, His identity. And God wants you to know something about Himself. He reveals His name as Yahweh Shalom. He is peace. He can give it because He is it."),
      p('And Ephesians 2:14 says of Jesus, "For He Himself is our peace."'),
      p('After the resurrection, Jesus appears to His disciples twice and says the same thing both times: "Peace be with you." Then He appears to Thomas and says it again. This is why Paul refers to God as the God of peace. Twelve out of thirteen letters Paul writes, he says, "Peace be with you." This isn\'t a pleasantry. It\'s a profound theological reality.'),
      p("This peace is free to you. But listen—it was very costly to Jesus."),
      p('You will never have subjective peace until you are at objective peace with God. People are spending thousands on calm retreats, looking for a moment\'s serenity. And God says, "You need peace with God." Because by nature we are enemies of God. Romans 3 says there is none righteous, not even one. Ephesians 2 says we were by nature children of wrath. The terminus of sin is eternal punishment.'),
      p('But Romans 5:1 says, "Therefore, having been justified by faith, we have peace with God through our Lord Jesus Christ."'),
      p("He is our peace. He secured it. He gives it. He is it."),
      {
        type: "reflection",
        items: [
          "Have you been looking for peace in retreats, routines, or relationships that can never truly provide it?",
          "Do you understand that subjective peace—the kind you feel—is only available when you are at objective peace with God through Christ?",
          "When you are anxious or fearful, are you turning to the God who is peace—or to the world's counterfeit?",
        ],
      },
      { type: "heart", text: "The world promises peace and gives me sand. Jesus is Yahweh Shalom—the Lord is peace. He doesn't just give it. He is it." },
    ],
  },
  {
    id: 42,
    title: "Creating a Heart of Gratitude",
    author: null,
    date: "August 25, 2026",
    category: "Devotional",
    readTime: "2 min read",
    excerpt:
      "Scripture doesn't just teach us how to lament — it teaches us how to give thanks in every season. Three simple starting points for building a genuine habit of gratitude toward God.",
    blocks: [
      p("One of the most powerful emotions is gratitude. If we can find ways to be thankful and grateful throughout our life, we will find the power and emotional strength to walk through some of life's hardest seasons."),
      p("It's not always easy to find ways to be thankful and grateful. But, one of the things Scripture teaches us throughout the Psalms is that there is always something to be grateful for."),
      p("The Psalms teach us various songs and poems for every season of our life. But more than that, they also teach us how to cultivate a heart of gratitude and worship towards God."),
      p("We belong to a God who loves us and cares deeply for us. God's love and goodness will never end. Psalm 100:5 praises God for these things:"),
      {
        type: "scripture",
        reference: "Psalm 100:5",
        verses: [
          "For the Lord is good and his love endures forever; his faithfulness continues through all generations.",
        ],
      },
      p("Through Psalms like this, we can begin to build a habit of gratitude towards God and all that He has done. We can thank God for what He has done in our lives, what He is currently doing, and what He will do in the future as we follow after Him."),
      p("Because God is always good, loving, and faithful, there is always something we can be grateful for—even in the midst of difficult seasons of life."),
      p("Take a few moments today to strengthen the habit of gratitude in your life."),
      {
        type: "list",
        items: [
          "First, begin by thanking God for who He is: that He is good, faithful, and loving towards you.",
          "Next, thank God for all that He has done. Thank Him for the good things in your life, and that He has walked with you through the hard times.",
          "Lastly, thank God for all He will continue to do in the days and years to come. He is trustworthy!",
        ],
      },
      { type: "prayer", text: "God, nothing is impossible for You. You love me even when I'm unloveable. You are good to me even when I don't deserve it. You are kind and compassionate toward me even when I mess up. You show me what faithful love looks like. Thank You for never leaving or forsaking me! Today, remind me of all the ways You have shown up in my life. You are worthy of my worship. In Jesus' name, Amen!" },
    ],
  },
  {
    id: 43,
    title: "From Worry to Worship: Seeing Your Anxiety Through God's Eyes",
    author: null,
    date: "August 26, 2026",
    category: "Teaching",
    readTime: "5 min read",
    excerpt:
      "God doesn't want you living in constant dread — and yet some days, you still do. What Scripture actually says about anxiety, and why the way through worry isn't fighting it harder, but turning it into worship.",
    blocks: [
      p("Two things can be true at the same time: God doesn't want you living in constant dread. And yet, some days, you still do."),
      p("Maybe you love Him with your whole heart, read your Bible, pray daily—and you still find yourself lying awake replaying worst-case scenarios. Maybe you want to be free of anxious thoughts, but you've learned the hard way that you can't just will them away. If that's you, take a breath. You're not failing at faith. You're human, living in a world that gives your nervous system plenty to respond to."),
      p("So often, anxiety gets talked about as something shameful—a spiritual failure, a lack of trust, a problem to eliminate as fast as possible. But what if the response God's after isn't stricter self-control, but a redirected gaze? What if the way through worry isn't to fight it harder, but to turn it into worship?"),
      { type: "heading", text: "What Scripture Actually Says" },
      p("Jesus addressed anxious hearts directly:"),
      {
        type: "scripture",
        reference: "Matthew 6:34",
        verses: ["Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own."],
      },
      p("Notice what He's not saying. He's not saying anxiety makes you a lesser Christian, or that feeling it means you don't trust Him enough. He's speaking gently into something He understands intimately—the human tendency to carry tomorrow's weight today. And just a few verses earlier in that same passage, He points His listeners toward the birds of the air and the flowers of the field—creatures that don't strive or store up, yet are fully cared for by the Father (Matthew 6:26–29). It's not a scolding. It's an invitation to lift our eyes off the worry long enough to notice who's actually holding it all together."),
      p("That shift—from staring at the problem to gazing at the Provider—is where worship begins."),
      { type: "heading", text: "Hagar in the Wilderness" },
      p("If anyone in Scripture understood overwhelming fear, it was Hagar. She was pregnant, alone, and fleeing mistreatment—running with nowhere to go and no one to turn to (Genesis 16). Whatever she was feeling in that wilderness, it's hard to imagine it wasn't some form of anxiety: the racing thoughts, the uncertainty, the sense that everything was unraveling and she had no control over any of it."),
      p("And that is exactly where God found her."),
      p("Not with a rebuke. Not with a command to calm down and trust harder. He came with presence. He asked about her situation—not because He didn't know, but because He wanted her to be heard. He spoke a blessing over her future. And what's remarkable is how Hagar responds to that encounter. She doesn't simply calm down and move on. She worships. She gives God a name, right there in the wilderness, in the middle of her fear:"),
      {
        type: "scripture",
        reference: "Genesis 16:13",
        verses: ["You are the God who sees me."],
      },
      p("That's worship born out of anxiety, not after it was resolved. Hagar's circumstances hadn't changed yet—she was still in the wilderness, still uncertain about what came next. But something in her had shifted from fixating on her fear to fixing her eyes on the God who saw her in it. That's the movement worship makes possible: not the absence of worry, but the presence of Someone bigger than it."),
      { type: "heading", text: "Letting Worship Interrupt the Worry" },
      p("Worship doesn't mean pretending anxiety isn't real, or singing a song until the feeling magically disappears. It means intentionally redirecting your attention—even mid-anxious-thought—toward who God is and what He's already done. Paul described something similar when he wrote:"),
      {
        type: "scripture",
        reference: "Philippians 4:6",
        verses: ["Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God."],
      },
      p('Prayer with thanksgiving. Not thanksgiving because everything is fine, but thanksgiving as an act of trust—naming what\'s true about God even while the anxious feeling is still present. That could look like speaking His character out loud when your mind is racing. It could look like a worship song playing while you fold laundry with a knotted stomach. It could look like simply whispering, "You are the God who sees me," the way Hagar did, before anything about your circumstances has actually changed.'),
      {
        type: "scripture",
        reference: "Philippians 4:7",
        verses: ["And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus."],
      },
      p("Yes! The Peace of God! God's peace doesn't always make sense to the world, but it guards our hearts when we need it the most."),
      p("This isn't a formula that erases anxiety instantly. But it does something important: it keeps you from facing your fear alone, and it re-centers your heart on the God who's holding what you can't."),
      { type: "heading", text: "Bringing It to Him" },
      p("Anxiety may not disappear the moment we turn it into worship—but we're never asked to manage it alone. The Holy Spirit doesn't just visit us in our composed, put-together moments. He lives in the anxious ones too. You are not too much for Him. You are not disqualified because you're struggling. You are seen—the same way Hagar was seen, in the middle of the wilderness, before anything had changed yet."),
      p("So today, when the worry rises, try letting it become an invitation to worship instead—a reminder to lift your eyes toward the One who already sees you and already holds what's ahead."),
      {
        type: "reflection",
        items: [
          "What would it look like to let a moment of anxiety become a moment of worship this week, rather than waiting for the worry to pass first?",
          "Like Hagar, is there a fear you've been carrying alone that you could bring honestly to God today?",
        ],
      },
      { type: "prayer", text: "God, I don't want to carry tomorrow's worries today, but sometimes it feels unavoidable. Help me turn my anxious thoughts into worship instead of letting them consume me. Remind me that You made me, and You see me, right where I am. Meet me in this moment the way You met Hagar—not with criticism, but with presence. I trust You with what I can't control. In Jesus' name, Amen." },
      { type: "closing", text: "If anxiety feels overwhelming or constant, please don't walk through it alone — consider talking with a Christian counselor or licensed therapist who understands Scripture and can walk alongside your faith as you find healing." },
    ],
  },
  {
    id: 44,
    title: "Look Up",
    author: null,
    date: "August 27, 2026",
    category: "Devotional",
    readTime: "2 min read",
    excerpt:
      "It's easy to fixate on the here and now — but Paul tells the Colossians to set their sights on heaven instead. Four things to remember about the reality that's still ahead.",
    blocks: [
      p("It's normal, as well as understandable, to spend our time, energy, and attention focusing on the here and now. We're busy, after all. Sometimes we're preoccupied. And when we stop to really think about it, it's difficult to perceive something beyond our five senses."),
      p("But in his letter to the Colossians, Paul encourages his fellow believers to look up:"),
      {
        type: "scripture",
        reference: "Colossians 3:1, NLT",
        verses: [
          "Since you have been raised to new life with Christ, set your sights on the realities of heaven, where Christ sits in the place of honor at God's right hand.",
        ],
      },
      p("As you think about Paul's words and the realities of heaven, here are four things to consider:"),
      {
        type: "list",
        items: [
          "First, heaven isn't some vague, dream-like state. It's a real place, with real people, where God is the true King.",
          "Second, there will come a day when we will all meet God face to face. We will no longer need faith or hope, because that which we've hoped for will finally be revealed.",
          "Third, our troubles and our heartbreaks (and even death itself) are temporary! Scripture tells us that, eventually, God will do away with pain and death and sickness and suffering—forever.",
          "Lastly (and most importantly), God is still on His throne, with Jesus beside Him in the place of honor. No matter how crazy, senseless, or heartbreaking the world can seem, we can have confidence knowing that nothing is outside of God's sovereign plan.",
        ],
      },
      p("So when you're tempted to look around at others or look inward at yourself, look up instead. Heaven is wherever God is, and that's the truest reality of all."),
      { type: "prayer", text: "God, I now realize that eternal life began the moment I accepted your free gifts of grace and salvation. As I follow You, please help me to remember to look up to have an eternal mindset. Give me the wisdom to be mindful of heaven as I'm living here on earth. In Jesus' name, Amen." },
    ],
  },
];

// ---------------------------------------------------------------------------
// SLUGS — turns a post title into a clean, shareable URL fragment, e.g.
// "We Will Worship and We Will Reign" -> "we-will-worship-and-we-will-reign"
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// TOPICS — cross-category tags, separate from Foundations/Teaching/
// Devotional. Lets someone browse "everything about grief" regardless of
// which category it's filed under. Add a post's id to a tag's array to
// tag it — a post can carry more than one tag.
// ---------------------------------------------------------------------------

const POST_TAGS = {
  "The Gospel Explained": [1, 9, 12, 19],
  "Grace & Assurance": [3, 14, 7, 31],
  "Sin & Repentance": [8, 17],
  "Grief & Comfort": [6, 21, 22, 30],
  "Purpose & Calling": [5, 13, 23, 26],
  "Prayer": [2, 18],
  "Worship": [4, 38],
  "Friendship": [20],
  "Discipline & Growth": [10, 11, 24, 25, 39],
  "Identity in Christ": [16],
  "Peace": [36, 41],
};

// ---------------------------------------------------------------------------
// AUTHORS — bio info for contributors whose byline should link somewhere.
// A post's author only becomes clickable if their name has an entry here.
// ---------------------------------------------------------------------------

const AUTHORS = {
  "Jonny Ardavanis": {
    role: "Lead Teaching Pastor & Elder, Stonebridge Bible Church",
    bio: [
      "Jonny has served as Lead Teaching Pastor and an Elder at Stonebridge Bible Church since June 2023. He also founded Dial In Ministries, which puts out weekly podcasts, devotionals, and sermons to help believers dig deeper into Scripture and actually live it out.",
      "Before that, he was Dean of Campus Life at The Master's University — his own alma mater — focused on student discipleship, and before that, Camp Director at Hume Lake Christian Camps in Central California, running high school summer programs and mentoring youth leaders.",
      "In October 2024 he published Consider the Lilies: Finding Perfect Peace in the Character of God. He and his wife, Caity, have three daughters — Lily Jean, Scottie Joan, and Sadie June.",
    ],
  },
};

function postsByAuthor(authorName) {
  return [...POSTS].filter((p) => p.author === authorName).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function tagsForPost(postId) {
  return Object.keys(POST_TAGS).filter((tag) => POST_TAGS[tag].includes(postId));
}

// "Keep Reading" picks — a shared topic tag (Grace & Assurance, Grief &
// Comfort, etc.) is a much stronger signal of genuine relevance than just
// sharing a category (Teaching/Devotional/Foundations is a pretty coarse
// bucket), so posts sharing a tag are ranked first, tied by how many tags
// they share; same-category posts fill in after that; newest breaks ties.
// A post with no tag or category overlap at all is left out rather than
// forced in just to hit the count.
function getRelatedPosts(post, max = 2) {
  const myTags = new Set(tagsForPost(post.id));
  return POSTS.filter((p) => p.id !== post.id)
    .map((p) => ({
      post: p,
      sharedTags: tagsForPost(p.id).filter((t) => myTags.has(t)).length,
      sameCategory: p.category === post.category,
    }))
    .filter((s) => s.sharedTags > 0 || s.sameCategory)
    .sort((a, b) => {
      if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
      if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1;
      return new Date(b.post.date) - new Date(a.post.date);
    })
    .slice(0, max)
    .map((s) => s.post);
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getPostBySlug(slug) {
  return POSTS.find((post) => slugify(post.title) === slug) || null;
}

const CATEGORIES = ["All", "Foundations", "Teaching", "Devotional"];



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

function getVerseOfDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return VERSES_OF_DAY[dayOfYear % VERSES_OF_DAY.length];
}

// Curated posts for the "Start Here" section — the clearest explanations
// of the gospel itself, pulled out from the general post stream.
const FOUNDATIONAL_POST_IDS = [1, 12, 19];

// "From the Archive" — resurfaces an older post on the homepage, one per
// calendar week. Originally proposed as a date-anniversary ("one year ago
// today") widget, but every post on the site so far is from the same
// year, so that version would have shown nothing until 2027 — this
// version works immediately instead, and everyone sees the same pick
// during the same week (not a different one per page load) so it reads as
// a deliberate choice rather than a random shuffle.
function getFromArchivePost() {
  const recentIds = new Set(
    [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map((p) => p.id)
  );
  // Sorted by id (not array position) so the cycling order stays stable
  // even if posts are edited or reordered in the array later.
  const eligible = [...POSTS].filter((p) => !recentIds.has(p.id)).sort((a, b) => a.id - b.id);
  if (eligible.length === 0) return null;

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekNumber = Math.floor(Date.now() / msPerWeek);
  return eligible[weekNumber % eligible.length];
}

// A short guided reading path for first-time visitors, in a specific
// suggested order. This order is a first-pass guess from the posts'
// titles/themes, not a close read of the full content -- worth revisiting
// once it's live. Reuses the existing "The Gospel Explained" POST_TAGS
// group (4 posts) rather than a separate list, so there's only one place
// that ever needs updating. Every post here already has its own real,
// public URL -- nothing about this plan ever makes a post inaccessible;
// "upcoming" in ReadingPlanView is a progress cue only, never a gate.
const READING_PLAN_POST_IDS = [1, 9, 12, 19];

// ---------------------------------------------------------------------------
// READ HISTORY — a light, entirely local memory of which posts a visitor has
// opened, kept in their own browser's localStorage. Nothing is sent
// anywhere, no account involved; it just powers a quiet "Continue Reading"
// nudge on Home and a small read-count on the Blogs page. Safe to fail
// silently (private browsing, storage disabled, quota full, etc.) since
// none of this is essential to using the site.
// ---------------------------------------------------------------------------

const READ_HISTORY_KEY = "gospel-lens-read-history";
const READ_HISTORY_MAX = 100;

function getReadHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(READ_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Records a post as read, moving it to the end (most-recent) if it was
// already in the list rather than duplicating it, and caps the list length
// so localStorage usage can't grow unbounded for a long-time reader.
function recordPostRead(postId) {
  if (typeof window === "undefined") return;
  try {
    const history = getReadHistory().filter((id) => id !== postId);
    history.push(postId);
    window.localStorage.setItem(READ_HISTORY_KEY, JSON.stringify(history.slice(-READ_HISTORY_MAX)));
  } catch {
    // localStorage unavailable — quietly skip, nothing else depends on this
  }
}

// ---------------------------------------------------------------------------
// SAVED POSTS — a deliberate "come back to this" list, distinct from the
// read-history-driven Continue Reading above. Same local-only approach
// (nothing sent anywhere, no account), but this is opt-in per post via the
// bookmark icon rather than automatic on every visit.
// ---------------------------------------------------------------------------

const SAVED_POSTS_KEY = "gospel-lens-saved-posts";

function getSavedPostIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_POSTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isPostSaved(postId) {
  return getSavedPostIds().includes(postId);
}

// Toggles postId in the saved list and returns the resulting state (true =
// now saved, false = now removed) so a caller can update its own local
// state without a second localStorage read.
function toggleSavedPost(postId) {
  if (typeof window === "undefined") return false;
  try {
    const ids = getSavedPostIds();
    const idx = ids.indexOf(postId);
    const nowSaved = idx === -1;
    if (nowSaved) ids.push(postId);
    else ids.splice(idx, 1);
    window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(ids));
    return nowSaved;
  } catch {
    return isPostSaved(postId);
  }
}

// ---------------------------------------------------------------------------
// READING TIME — calculated from actual word count (~200 wpm) instead of
// a hand-typed estimate, so it stays accurate as posts get edited.
// ---------------------------------------------------------------------------

function estimateReadTime(post) {
  const words = post.blocks.reduce((total, block) => {
    if (block.type === "p" || block.type === "quote" || block.type === "heart" || block.type === "prayer" || block.type === "encourage" || block.type === "closing" || block.type === "heading") {
      return total + block.text.split(/\s+/).filter(Boolean).length;
    }
    if (block.type === "scripture") {
      return total + block.verses.join(" ").split(/\s+/).filter(Boolean).length;
    }
    if (block.type === "reflection" || block.type === "share" || block.type === "list") {
      return total + block.items.join(" ").split(/\s+/).filter(Boolean).length;
    }
    return total;
  }, 0);
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

// Splits a post into one text segment per block (title first) for the
// browser's built-in text-to-speech (see useListenToPost). Read as separate
// queued utterances rather than one giant string — each block gets a clean
// breath/pause between it and the next, instead of running on flat.
function postToSpeechSegments(post) {
  const segments = [`${post.title}.`];
  post.blocks.forEach((block) => {
    if (["p", "heading", "quote", "heart", "prayer", "encourage", "closing"].includes(block.type)) {
      segments.push(block.text);
    } else if (block.type === "scripture") {
      segments.push(block.verses.join(". "));
    } else if (block.type === "reflection" || block.type === "share" || block.type === "list") {
      segments.push(block.items.join(". "));
    }
  });
  return segments;
}

// Picks the best-sounding voice available in the visitor's own browser.
// There's no free way to get a truly natural, emotive narrator voice — that
// needs a paid cloud voice service — but most modern browsers do ship at
// least one noticeably better-than-default voice (labeled "Natural",
// "Enhanced", "Premium", "Neural", or a Google cloud voice) alongside the
// flatter robotic-sounding default. This just finds the best of what's
// already there for free.
// A handful of default system voices that are widely considered clearer and
// warmer than the rest of their platform's stock lineup, for when nothing
// is explicitly labeled Natural/Enhanced/Neural — used as a tie-breaker,
// not a hard requirement.
const GOOD_DEFAULT_VOICE_NAMES = ["samantha", "ava", "google us english", "aria", "jenny", "zoe"];

function pickBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length ? english : voices;
  const scored = pool.map((v) => {
    const name = v.name.toLowerCase();
    let score = 0;
    if (name.includes("natural")) score += 5;
    if (name.includes("neural")) score += 5;
    if (name.includes("premium") || name.includes("enhanced")) score += 4;
    if (name.includes("google")) score += 3;
    if (!v.localService) score += 2; // cloud-served voices are usually higher quality
    if (v.lang === "en-US" || v.lang === "en-GB") score += 1;
    if (GOOD_DEFAULT_VOICE_NAMES.some((good) => name.includes(good))) score += 1.5;
    return { v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].v;
}

// Shared listen-to-post playback logic, used by both the top and bottom
// buttons on a post so they stay in sync — clicking either one affects the
// same reading. Status is a small state machine rather than a boolean:
//   idle     — nothing queued; tapping the main button starts from the top
//   speaking — actively reading; tapping the main button pauses in place
//   paused   — paused mid-read; tapping the main button resumes from there
// The separate restart() action fully stops and clears the queue, so the
// next tap on the main button starts over from the beginning — kept as a
// distinct small control rather than folded into the main button, so the
// everyday tap (pause/resume) stays a single obvious action.
function useListenToPost(post) {
  const [status, setStatus] = useState("idle"); // idle | speaking | paused
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Speaking one segment at a time and only creating the next utterance once
  // the previous one truly finishes (chained via onend), instead of queueing
  // every paragraph upfront with repeated .speak() calls. Queueing many
  // utterances at once and then pausing/resuming across the whole queue is
  // the flaky part of this browser API — utterances with nothing holding a
  // live reference to them can get garbage-collected mid-queue, which shows
  // up as speech skipping around, stalling, or picking up from an
  // unpredictable point. Refs (not local variables) keep the in-progress
  // utterance and the remaining segments alive across renders.
  const segmentsRef = useRef([]);
  const indexRef = useRef(0);
  const voiceRef = useRef(null);
  const utteranceRef = useRef(null);

  const stopAll = () => {
    // Null the ref BEFORE cancelling — cancel() fires the in-flight
    // utterance's own onend/onerror asynchronously, and both handlers below
    // check "is this utterance still the current one" by identity against
    // this ref. Clearing it first means that stale event is always ignored,
    // no matter when the browser actually gets around to firing it.
    utteranceRef.current = null;
    if (supported) window.speechSynthesis.cancel();
  };

  // Stop any reading in progress whenever the underlying post changes —
  // including navigating to a different post entirely, not just leaving
  // the post view — so switching posts never leaves the old one still
  // reading over the new one. Also covers unmount (Home/Blogs/About).
  useEffect(() => {
    return () => {
      stopAll();
      setStatus("idle");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  // Browsers can restore a page from the back/forward cache (bfcache)
  // without re-running this component's setup — if speech was paused when
  // the visitor navigated away, the restored page can otherwise resume
  // speaking on its own with no click involved. Force a clean stop whenever
  // the page is (re)shown this way.
  useEffect(() => {
    if (!supported) return;
    const onPageShow = (event) => {
      if (event.persisted) {
        stopAll();
        setStatus("idle");
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  const speakFrom = (index) => {
    const segments = segmentsRef.current;
    if (index >= segments.length) {
      utteranceRef.current = null;
      setStatus("idle");
      return;
    }
    const u = new SpeechSynthesisUtterance(segments[index]);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 0.85; // slower, reflective reading pace rather than rushed
    u.pitch = 0.97;
    u.onend = () => {
      // Ignore a stale event from an utterance we've since replaced (pause,
      // restart, or a new post) — see the identity-check note in stopAll().
      if (utteranceRef.current !== u) return;
      indexRef.current = index + 1;
      speakFrom(index + 1);
    };
    u.onerror = () => {
      // Cancelling an in-progress utterance (to pause, restart, stop, or
      // switch posts) fires onerror, not onend — that's expected, not a
      // real failure, so only react if this utterance is still current.
      if (utteranceRef.current !== u) return;
      utteranceRef.current = null;
      setStatus("idle");
    };
    utteranceRef.current = u; // keep a live reference so it can't be GC'd mid-speech
    window.speechSynthesis.speak(u);
  };

  const start = () => {
    stopAll();
    segmentsRef.current = postToSpeechSegments(post);
    voiceRef.current = pickBestVoice();
    indexRef.current = 0;
    setStatus("speaking");
    speakFrom(0);
  };

  const toggle = () => {
    if (!supported) return;
    if (status === "idle") {
      start();
    } else if (status === "speaking") {
      // Deliberately NOT using the browser's native
      // speechSynthesis.pause()/resume() here — verified this is genuinely
      // unreliable in real-world use (this is a long-documented Web Speech
      // API gotcha, not just an implementation bug here): some browsers
      // effectively ignore pause() and keep talking, others cancel playback
      // outright instead of truly pausing, and resume() afterwards is a
      // no-op either way. Instead, "pause" is implemented by cancelling the
      // in-flight utterance ourselves and simply remembering which segment
      // (paragraph) we were on — indexRef.current isn't advanced until a
      // segment finishes naturally (see speakFrom's onend), so it still
      // points at the interrupted one. "Resume" just re-speaks that segment
      // from its start. This trades exact mid-sentence resume for something
      // that actually works consistently everywhere.
      utteranceRef.current = null;
      window.speechSynthesis.cancel();
      setStatus("paused");
    } else if (status === "paused") {
      setStatus("speaking");
      speakFrom(indexRef.current);
    }
  };

  const restart = () => {
    if (!supported) return;
    stopAll();
    setStatus("idle");
  };

  return { status, toggle, restart, supported };
}

// Builds one lowercase blob of everything searchable in a post — title,
// excerpt, author, category, topic tags, and every word in the body — so
// a search for any keyword anywhere in a post actually finds it.
const searchIndexCache = new Map();

function getSearchIndex(post) {
  if (searchIndexCache.has(post.id)) return searchIndexCache.get(post.id);

  const bodyText = post.blocks
    .map((block) => {
      if (block.text) return block.text;
      if (block.verses) return block.verses.join(" ");
      if (block.items) return block.items.join(" ");
      return "";
    })
    .join(" ");

  const index = [
    post.title,
    post.excerpt,
    post.author || "",
    post.category,
    tagsForPost(post.id).join(" "),
    bodyText,
  ]
    .join(" ")
    .toLowerCase();

  searchIndexCache.set(post.id, index);
  return index;
}

// ---------------------------------------------------------------------------
// SHARED UI PIECES
// ---------------------------------------------------------------------------

function Eyebrow({ children, center = false }) {
  return (
    <div
      className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold mb-4 ${
        center ? "justify-center" : ""
      }`}
    >
      <span className="w-6 h-px bg-[#B08D57]" />
      {children}
    </div>
  );
}

function Nav({ view, setView, menuOpen, setMenuOpen, onSearch, dark, toggleDark }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const linkClass = (v) =>
    `text-sm tracking-wide transition-colors duration-200 pb-1 border-b ${
      view === v || (v === "blog" && (view === "post" || view === "collection"))
        ? "text-[#1C1F26] dark:text-[#F2F1EC] border-[#B08D57]"
        : "text-[#5B5F6B] dark:text-[#A9ADB6] border-transparent hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] hover:border-[#B08D57]/50"
    }`;

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
    setSearchOpen(false);
    setQuery("");
  };

  // "/" or Cmd/Ctrl+K opens search from anywhere on the site, the same
  // convention used by GitHub, Linear, Notion, etc. "/" is ignored while
  // the visitor is already typing somewhere (so it can still be typed as
  // a literal character); Cmd/Ctrl+K is a deliberate modifier combo, so it
  // always fires regardless of focus.
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isCmdK = (e.metaKey || e.ctrlKey) && key === "k";
      const isSlash = key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!isCmdK && !isSlash) return;

      const target = e.target;
      const isEditableTarget = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isSlash && isEditableTarget) return;

      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#F8F7F3]/90 dark:bg-[#14161B]/90 backdrop-blur-sm border-b border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between gap-3">
        <button onClick={() => setView("home")} className="flex items-center gap-2.5 group shrink-0">
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#B08D57] text-[#B08D57] group-hover:bg-[#B08D57] group-hover:text-[#F8F7F3] transition-colors duration-300">
            <BookOpen size={15} strokeWidth={1.75} />
          </span>
          <span
            className="text-[22px] text-[#1C1F26] dark:text-[#F2F1EC] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            The Gospel Lens
          </span>
        </button>

        {searchOpen ? (
          <form onSubmit={submitSearch} className="flex-1 flex items-center gap-2 max-w-sm">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the blog…"
              className="w-full bg-white dark:bg-[#1E2128] border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 px-3 py-2 text-sm text-[#1C1F26] dark:text-[#F2F1EC] placeholder:text-[#8A8D96] rounded-sm focus:outline-none focus:border-[#4A5D4E]"
            />
            <button type="button" onClick={() => setSearchOpen(false)} className="text-[#8A8D96] dark:text-[#7C808A] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]" aria-label="Close search">
              <X size={18} />
            </button>
          </form>
        ) : (
          <>
            <nav className="hidden sm:flex items-center gap-8">
              <button onClick={() => setView("home")} className={linkClass("home")}>
                Home
              </button>
              <button onClick={() => setView("about")} className={linkClass("about")}>
                About
              </button>
              <button onClick={() => setView("blog")} className={linkClass("blog")}>
                Blogs
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                title="Search (press / or ⌘K)"
                className="text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] transition-colors duration-200"
              >
                <Search size={18} strokeWidth={2} />
              </button>
              <button
                onClick={() => setView("saved")}
                aria-label="Saved Posts"
                title="Saved Posts"
                className={`transition-colors duration-200 ${
                  view === "saved"
                    ? "text-[#B08D57]"
                    : "text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]"
                }`}
              >
                <Bookmark size={18} strokeWidth={2} fill={view === "saved" ? "currentColor" : "none"} />
              </button>
              <button
                onClick={toggleDark}
                aria-label="Toggle dark mode"
                className="text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] transition-colors duration-200"
              >
                {dark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
              </button>
              <button className="sm:hidden text-[#1C1F26] dark:text-[#F2F1EC]" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        )}
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 px-6 py-4 flex flex-col gap-4 bg-[#F8F7F3] dark:bg-[#14161B]">
          <button onClick={() => { setView("home"); setMenuOpen(false); }} className={`text-left ${linkClass("home")}`}>
            Home
          </button>
          <button onClick={() => { setView("about"); setMenuOpen(false); }} className={`text-left ${linkClass("about")}`}>
            About
          </button>
          <button onClick={() => { setView("blog"); setMenuOpen(false); }} className={`text-left ${linkClass("blog")}`}>
            Blogs
          </button>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done
  const buttondownFormRef = useRef(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "saving") return;
    setStatus("saving");
    try {
      await window.storage?.set(`newsletter:${Date.now()}`, email.trim(), true);
    } catch (err) {
      // storage optional — fail silently, UI still confirms
    }
    setStatus("done");
    setEmail("");
  };

  // The live Buttondown form (below) is a real cross-origin POST that opens
  // Buttondown's own confirmation page in a new tab (target="_blank") — we
  // never get a response back to react to, since it's a native form
  // submission, not a fetch call. So this is a same-tab, optimistic
  // acknowledgment shown the moment someone submits, rather than something
  // waiting on a result we structurally can't observe. Buttondown double
  // opt-ins everyone, so "check your email to confirm" is accurate
  // regardless of what happens in the new tab.
  const handleButtondownSubmit = () => {
    setStatus("done");
    // Let the native submission read the field first, then clear it —
    // resetting synchronously inside the submit handler risks clearing the
    // value before the browser has captured it for the actual POST.
    setTimeout(() => buttondownFormRef.current?.reset(), 50);
    setTimeout(() => setStatus("idle"), 6000);
  };

  return (
    <footer className="border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 mt-24">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10 border-b border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
          <div>
            <h3
              className="text-lg text-[#1C1F26] dark:text-[#F2F1EC] mb-1"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
            >
              Get new posts by email
            </h3>
            <p className="text-sm text-[#5B5F6B] dark:text-[#A9ADB6]">One email, whenever something new is published. No spam.</p>
          </div>
          {BUTTONDOWN_USERNAME ? (
            <div className="w-full sm:w-auto">
              <form
                ref={buttondownFormRef}
                action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`}
                method="post"
                target="_blank"
                onSubmit={handleButtondownSubmit}
                className="flex w-full sm:w-auto gap-2"
              >
                <input type="hidden" name="embed" value="1" />
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="you@example.com"
                  className="flex-1 sm:w-64 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 px-4 py-2.5 text-sm text-[#1C1F26] dark:text-[#F2F1EC] placeholder:text-[#8A8D96] focus:outline-none focus:border-[#4A5D4E] rounded-sm"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap bg-[#1C1F26] text-[#F8F7F3] px-5 py-2.5 text-sm font-medium hover:bg-[#4A5D4E] transition-colors duration-300 rounded-sm"
                >
                  Subscribe
                </button>
              </form>
              {status === "done" && (
                <p className="flex items-center gap-1.5 text-xs text-[#4A5D4E] mt-2">
                  <Check size={13} strokeWidth={2.5} />
                  Check your email to confirm your subscription.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 sm:w-64 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 px-4 py-2.5 text-sm text-[#1C1F26] dark:text-[#F2F1EC] placeholder:text-[#8A8D96] focus:outline-none focus:border-[#4A5D4E] rounded-sm"
              />
              <button
                type="submit"
                className="whitespace-nowrap bg-[#1C1F26] text-[#F8F7F3] px-5 py-2.5 text-sm font-medium hover:bg-[#4A5D4E] transition-colors duration-300 rounded-sm"
              >
                {status === "done" ? "Subscribed ✓" : "Subscribe"}
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <div className="flex items-center gap-2 text-[#5B5F6B] dark:text-[#A9ADB6]">
            <BookOpen size={14} strokeWidth={1.75} className="text-[#B08D57]" />
            <span className="text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Gospel Lens
            </span>
          </div>

          {CONTACT_EMAIL && (
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#4A5D4E] underline underline-offset-2 transition-colors duration-200"
              >
                Contact
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Blog Submission — The Gospel Lens")}`}
                className="text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#4A5D4E] underline underline-offset-2 transition-colors duration-200"
              >
                Submit a Blog Post
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Share Your Story — The Gospel Lens")}&body=${encodeURIComponent("I wanted to share how a post on The Gospel Lens impacted me:\n\n")}`}
                className="text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#4A5D4E] underline underline-offset-2 transition-colors duration-200"
              >
                Share Your Story
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Site Suggestion — The Gospel Lens")}`}
                className="text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#4A5D4E] underline underline-offset-2 transition-colors duration-200"
              >
                Suggest an Idea
              </a>
            </div>
          )}

          <p className="text-xs text-[#8A8D96] dark:text-[#7C808A] tracking-wide">
            © 2026 The Gospel Lens. Every good gift is from above.
          </p>
        </div>

        <p className="text-[11px] text-[#8A8D96] dark:text-[#7C808A] leading-relaxed mt-6 pt-6 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 max-w-2xl">
          Some articles on this site are curated, adapted, or quoted from other Christian teachers, authors, and ministries, and are shared here for devotional and educational purposes. All rights remain with their original creators. Scripture quotations are taken from the translations noted with each verse.
        </p>
        <p className="text-[11px] text-[#8A8D96] dark:text-[#7C808A] leading-relaxed mt-3 max-w-2xl">
          Unless otherwise noted, Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function CategoryTag({ category }) {
  return (
    <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#4A5D4E] bg-[#4A5D4E]/8 px-2.5 py-1 rounded-full">
      {category}
    </span>
  );
}

// Not a <button> anymore -- an invisible full-cover button handles "open
// the post" (still real keyboard/screen-reader accessible), and the
// bookmark toggle is its own real button layered on top, since a <button>
// can't legally contain another <button>. The visible content in between
// is pointer-events-none so clicks pass through to whichever of the two
// buttons is actually underneath that point.
function PostCard({ post, onOpen, featured = false, onToggleSave }) {
  const [saved, setSaved] = useState(() => isPostSaved(post.id));

  const handleToggleSave = (e) => {
    e.stopPropagation();
    const nowSaved = toggleSavedPost(post.id);
    setSaved(nowSaved);
    onToggleSave?.(post.id, nowSaved);
  };

  return (
    <div
      className={`group relative flex flex-col bg-white dark:bg-[#1E2128] border border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 hover:border-[#B08D57]/40 rounded-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-15px_rgba(28,31,38,0.25)] ${
        featured ? "p-8" : "p-7"
      }`}
    >
      <button onClick={() => onOpen(post)} className="absolute inset-0 z-0 text-left" aria-label={`Read ${post.title}`} />
      <button
        onClick={handleToggleSave}
        aria-label={saved ? "Remove from Saved Posts" : "Save for later"}
        title={saved ? "Remove from Saved Posts" : "Save for later"}
        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#14161B]/85 text-[#8A8D96] dark:text-[#7C808A] hover:text-[#B08D57] transition-colors duration-200"
      >
        <Bookmark size={15} strokeWidth={2} className={saved ? "text-[#B08D57]" : ""} fill={saved ? "currentColor" : "none"} />
      </button>
      <div className="pointer-events-none flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4 pr-8">
          <CategoryTag category={post.category} />
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#8A8D96] dark:text-[#7C808A]">{estimateReadTime(post)}</span>
        </div>
        <h3
          className={`text-[#1C1F26] dark:text-[#F2F1EC] mb-2 leading-snug ${featured ? "text-2xl" : "text-xl"}`}
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {post.title}
        </h3>
        <span className="text-[11px] text-[#8A8D96] dark:text-[#7C808A] mb-3">
          {post.author ? `By ${post.author} · ` : ""}
          {post.date}
        </span>
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] leading-relaxed mb-6 flex-1">{post.excerpt}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4A5D4E] group-hover:gap-2.5 transition-all duration-300">
          Read More
          <ArrowRight size={14} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// POST BODY RENDERER — turns the `blocks` array into styled sections
// ---------------------------------------------------------------------------

// "Share this verse," but for a specific post's Scripture Focus box rather
// than the homepage Verse of the Day -- reuses the exact same card-image
// generation. Multiple verses in one box are joined into a single quote,
// matching how the box already displays them together.
function ScriptureShareButton({ post, reference, verses }) {
  const [status, setStatus] = useState("idle"); // idle | working | done | fallback

  const handleShare = async () => {
    setStatus("working");
    const result = await shareVerseCard({
      text: verses.join(" "),
      attribution: reference,
      eyebrow: "SCRIPTURE FOCUS",
      title: `${post.title} — The Gospel Lens`,
      url: `${window.location.origin}/${slugify(post.title)}`,
      filename: `${slugify(post.title)}-scripture.png`,
    });
    if (result === "shared" || result === "cancelled") {
      setStatus("idle");
      return;
    }
    setStatus(result === "copied-image" ? "done" : "fallback");
    setTimeout(() => setStatus("idle"), 2500);
  };

  const labels = {
    idle: "Share this verse",
    working: "Preparing image…",
    done: "Verse card copied — paste anywhere",
    fallback: "Text + link copied",
  };

  return (
    <button
      onClick={handleShare}
      disabled={status === "working"}
      className="no-print inline-flex items-center gap-1.5 text-xs font-medium text-[#4A5D4E] dark:text-[#8FAE95] hover:text-[#B08D57] mt-4 transition-colors duration-200 disabled:opacity-60"
    >
      {status === "done" || status === "fallback" ? <Check size={13} strokeWidth={2} /> : <Share2 size={13} strokeWidth={2} />}
      {labels[status]}
    </button>
  );
}

function PostBody({ blocks, post }) {
  let paragraphIndex = -1;

  return (
    <div className="space-y-6 text-[#2E323B] dark:text-[#D9D9D9] text-[18px] leading-[1.9]">
      {blocks.map((block, i) => {
        if (block.type === "p") {
          paragraphIndex += 1;
          const isFirst = paragraphIndex === 0;
          return (
            <p key={i}>
              {isFirst ? (
                <>
                  <span
                    className="float-left text-7xl leading-[0.75] pr-3 pt-2 text-[#4A5D4E]"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                  >
                    {block.text.charAt(0)}
                  </span>
                  {block.text.slice(1)}
                </>
              ) : (
                block.text
              )}
            </p>
          );
        }

        if (block.type === "heading") {
          return (
            <h2
              key={i}
              className="text-2xl text-[#1C1F26] dark:text-[#F2F1EC] pt-4"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={i} className="not-prose space-y-2 pl-1">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex gap-3 text-[18px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <div key={i} className="not-prose bg-[#1C1F26] text-[#F8F7F3] rounded-sm px-7 py-6 my-8">
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-[#B08D57] mt-1 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-2">
                    Wisdom of the Day
                  </p>
                  <p className="text-[17px] leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{block.text}"
                  </p>
                  {block.attribution && (
                    <p className="text-sm text-[#B0B4BD] mt-3">— {block.attribution}</p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (block.type === "scripture") {
          return (
            <div key={i} className="not-prose border-l-4 border-[#B08D57] bg-[#4A5D4E]/6 rounded-r-sm px-6 py-6 my-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold mb-3">
                Scripture Focus · {block.reference}
              </p>
              <div className="space-y-3">
                {block.verses.map((v, vi) => (
                  <p key={vi} className="text-[17px] leading-relaxed italic text-[#2E323B] dark:text-[#D9D9D9]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{v}"
                  </p>
                ))}
              </div>
              {post && <ScriptureShareButton post={post} reference={block.reference} verses={block.verses} />}
            </div>
          );
        }

        if (block.type === "reflection") {
          return (
            <div key={i} className="not-prose bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-7 py-6 my-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold mb-4">
                Reflection Questions
              </p>
              <ul className="space-y-3">
                {block.items.map((q, qi) => (
                  <li key={qi} className="flex gap-3 text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">
                    <span className="text-[#B08D57] font-semibold shrink-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {qi + 1}.
                    </span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === "heart") {
          return (
            <div key={i} className="not-prose flex gap-3 items-start bg-[#B08D57]/10 border border-[#B08D57]/30 rounded-sm px-6 py-5 my-8">
              <Quote size={18} className="text-[#B08D57] mt-1 shrink-0" strokeWidth={2} />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a6f42] font-semibold mb-2">
                  Write This On Your Heart
                </p>
                <p className="text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">{block.text}</p>
              </div>
            </div>
          );
        }

        if (block.type === "encourage") {
          return (
            <div key={i} className="not-prose text-center border-y border-[#B08D57]/30 py-8 my-10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-3">
                Be Encouraged
              </p>
              <p
                className="text-[22px] sm:text-2xl leading-snug text-[#1C1F26] dark:text-[#F2F1EC] max-w-lg mx-auto"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === "share") {
          return (
            <div key={i} className="not-prose bg-[#4A5D4E]/6 rounded-sm px-7 py-6 my-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold mb-4">
                Share Your Faith
              </p>
              <ul className="space-y-3">
                {block.items.map((item, ii) => (
                  <li key={ii} className="flex gap-3 text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-2.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === "prayer") {
          return (
            <div key={i} className="not-prose bg-[#1C1F26]/4 border-l-4 border-[#1C1F26]/20 dark:border-[#F2F1EC]/20 rounded-r-sm px-7 py-6 my-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#5B5F6B] dark:text-[#A9ADB6] font-semibold mb-3">
                A Prayer
              </p>
              <p className="text-[17px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9] italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === "closing") {
          return (
            <p key={i} className="text-sm italic text-[#8A8D96] dark:text-[#7C808A] pt-2">
              {block.text}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VIEWS
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// VERSE CARD IMAGE — draws a shareable graphic (dark card, wrapped verse
// text, reference, and the site URL baked right into the image) so that
// however it gets shared, the link travels with it. Used by the "Share
// this verse" button below.
// ---------------------------------------------------------------------------

function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// `attribution` is used verbatim (e.g. "Romans 10:9, ESV" or a post's own
// scripture-block reference like "John 15:4-5; Philippians 2:12-13") rather
// than a hardcoded translation suffix, since this now also generates cards
// for a post's own Scripture Focus box, not just the homepage Verse of the
// Day, and those references don't all share one translation.
async function generateVerseCardBlob({ text, attribution, eyebrow = "VERSE OF THE DAY" }) {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.load("700 48px 'Playfair Display'");
      await document.fonts.ready;
    } catch (err) {
      // if fonts fail to report ready, draw anyway with fallback fonts
    }
  }

  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#1C1F26";
  ctx.fillRect(0, 0, size, size);

  // Thin gold accent line near top
  ctx.strokeStyle = "#B08D57";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 40, 150);
  ctx.lineTo(size / 2 + 40, 150);
  ctx.stroke();

  // Eyebrow label
  ctx.fillStyle = "#B08D57";
  ctx.font = "600 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText(eyebrow, size / 2, 200);
  ctx.letterSpacing = "0px";

  // Verse text, wrapped, centered, and auto-shrunk to fit -- a post's own
  // Scripture Focus box can combine several verses into one much longer
  // quote than a single Verse of the Day ever is, and a fixed font size
  // risked exactly the kind of overflow found and fixed in the per-post
  // share cards (see scripts/build-share-cards.js's fitTitle). Two layers
  // of defense here too: shrink to fit, then clamp the reference line's
  // position as a hard backstop regardless of how the text wrapped.
  const maxTextWidth = size - 200;
  const topBound = 260;
  const bottomBound = size - 260;
  const quoted = `"${text}"`;
  let fontSize = 46;
  let lines = [];
  let lineHeight = 62;
  while (fontSize >= 24) {
    ctx.font = `italic 500 ${fontSize}px 'Playfair Display', Georgia, serif`;
    lines = wrapCanvasText(ctx, quoted, maxTextWidth);
    lineHeight = fontSize * 1.35;
    if (lines.length * lineHeight <= bottomBound - topBound) break;
    fontSize -= 2;
  }
  ctx.fillStyle = "#F8F7F3";
  ctx.font = `italic 500 ${fontSize}px 'Playfair Display', Georgia, serif`;
  const totalTextHeight = lines.length * lineHeight;
  let y = topBound + Math.max(0, (bottomBound - topBound - totalTextHeight) / 2) + fontSize * 0.75;
  for (const line of lines) {
    ctx.fillText(line, size / 2, y);
    y += lineHeight;
  }

  // Reference -- shrunk to fit horizontally too, since a combined
  // multi-reference citation (e.g. three passages joined with ";") can run
  // considerably longer than a single "Book Chapter:Verse".
  let refFontSize = 30;
  ctx.font = `400 ${refFontSize}px Inter, sans-serif`;
  const refText = `— ${attribution}`;
  while (refFontSize > 18 && ctx.measureText(refText).width > maxTextWidth) {
    refFontSize -= 2;
    ctx.font = `400 ${refFontSize}px Inter, sans-serif`;
  }
  ctx.fillStyle = "#B0B4BD";
  ctx.fillText(refText, size / 2, Math.min(y + 20, size - 160));

  // Footer wordmark + URL baked into the image itself
  ctx.fillStyle = "#B08D57";
  ctx.font = "700 28px 'Playfair Display', Georgia, serif";
  ctx.fillText("THE GOSPEL LENS", size / 2, size - 110);

  ctx.fillStyle = "#8A8D96";
  ctx.font = "400 24px Inter, sans-serif";
  const siteUrl = window.location.href.split("#")[0].replace(/^https?:\/\//, "").replace(/\/$/, "");
  ctx.fillText(siteUrl, size / 2, size - 70);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

// Shared by VerseOfDay's "Share this verse" and ScriptureShareButton (on
// each post's Scripture Focus box) -- generates the card image, then picks
// the best available way to actually hand it to the visitor: the native
// share sheet with the image attached on phones, a straight image-to-
// clipboard copy on desktop, or a plain text+link copy as a last resort.
// Returns a status string the caller uses to pick its own button label.
async function shareVerseCard({ text, attribution, eyebrow, title, url, filename }) {
  // The link now lives directly inside the shared text itself (not just a
  // separate structural `url` field) -- WhatsApp and most chat apps
  // auto-linkify a plain URL sitting in message text into a real tappable
  // link, which survives far more consistently than relying on an app's
  // own handling of a separate `url` field.
  const shareText = `"${text}" — ${attribution}\n\nRead more: ${url}`;
  const blob = await generateVerseCardBlob({ text, attribution, eyebrow });
  const file = blob ? new File([blob], filename, { type: "image/png" }) : null;

  // Native share WITH a file attached is mobile-only. Verified live (a
  // real repro from a real desktop share) that Chrome's macOS
  // implementation of file-sharing via the Web Share API is genuinely
  // broken, not just inconsistent: it round-trips the file through a
  // local temp path under ~/Library/Application Support/Google/Chrome/
  // <profile>/WebShare/share-<uuid>/<filename>, and handing that off to
  // WhatsApp Desktop, that literal local file path leaked into the
  // visible message text AND the whole share was duplicated -- two
  // images, two text messages, from one click. This lives in Chrome's own
  // OS-integration layer, not anything this page controls, so the fix is
  // to avoid that code path entirely on desktop rather than risk visitors
  // hitting Brian's exact repro. (An earlier attempt fixed a *different*
  // theory -- a rich link preview competing with the image -- which
  // turned out not to be the actual cause; this is.)
  // On mobile, always prefer native share -- with the file when the
  // device supports it, text-only otherwise. Both are safe on mobile;
  // the bug above is specific to desktop Chrome's file-sharing bridge.
  const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile && navigator.share) {
    try {
      const canShareFile = file && navigator.canShare && navigator.canShare({ files: [file] });
      if (canShareFile) {
        await navigator.share({ title, text: shareText, files: [file] });
      } else {
        await navigator.share({ title, text: shareText, url });
      }
      return "shared";
    } catch (err) {
      return "cancelled"; // user closed the share sheet
    }
  }

  // Desktop's default path when there's an actual image to share: copy it
  // to the clipboard, and -- in that same clipboard write -- include the
  // caption text too, so a paste target that reads text (like a caption
  // box) can pick up the link without a second, separate copy. This never
  // touches the broken OS-share-extension bridge above, so it can't hit
  // that bug at all. Deliberately checked BEFORE any desktop native-share
  // fallback, so a valid image is never silently dropped in favor of a
  // text-only share sheet.
  if (file && navigator.clipboard && window.ClipboardItem) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": file, "text/plain": new Blob([shareText], { type: "text/plain" }) }),
      ]);
      return "copied-image";
    } catch (err) {
      // Some browsers reject a multi-type ClipboardItem outright -- retry
      // with just the image, which matters most, rather than failing
      // entirely and falling all the way through to text-only.
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": file })]);
        return "copied-image";
      } catch (err2) {
        // fall through to the text-only fallback below
      }
    }
  }

  // No image available at all (e.g. canvas rendering failed) but native
  // share still exists: still better than a bare clipboard copy, and
  // doesn't touch the file-sharing bridge since there's no file here.
  if (!file && navigator.share) {
    try {
      await navigator.share({ title, text: shareText, url });
      return "shared";
    } catch (err) {
      return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    return "copied-text";
  } catch (err) {
    return "cancelled";
  }
}

function VerseOfDay() {
  const verse = useMemo(() => getVerseOfDay(), []);
  const [status, setStatus] = useState("idle"); // idle | working | done | fallback

  const handleShare = async () => {
    setStatus("working");
    const result = await shareVerseCard({
      text: verse.text,
      attribution: `${verse.reference}, ESV`,
      title: "Verse of the Day — The Gospel Lens",
      url: window.location.href.split("#")[0],
      filename: "verse-of-the-day.png",
    });
    if (result === "shared" || result === "cancelled") {
      setStatus("idle");
      return;
    }
    setStatus(result === "copied-image" ? "done" : "fallback");
    setTimeout(() => setStatus("idle"), 2500);
  };

  const labels = {
    idle: "Share this verse",
    working: "Preparing image…",
    done: "Verse card copied — paste anywhere",
    fallback: "Text + link copied",
  };

  return (
    <div className="max-w-2xl mx-auto px-6 sm:px-8 -mt-6 mb-6">
      <div className="bg-[#1C1F26] rounded-sm px-7 py-7 sm:px-9 sm:py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-4">
          <Sunrise size={13} strokeWidth={2} />
          Verse of the Day
        </div>
        <p
          className="text-[#F8F7F3] text-lg sm:text-xl leading-relaxed italic"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          "{verse.text}"
        </p>
        <p className="text-[#B0B4BD] text-sm mt-4 tracking-wide">— {verse.reference}, ESV</p>
        <button
          onClick={handleShare}
          disabled={status === "working"}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B0B4BD] hover:text-[#B08D57] mt-5 transition-colors duration-200 disabled:opacity-60"
        >
          {status === "done" || status === "fallback" ? <Check size={13} strokeWidth={2} /> : <Share2 size={13} strokeWidth={2} />}
          {labels[status]}
        </button>
      </div>
    </div>
  );
}

function AboutView() {
  return (
    <section className="max-w-2xl mx-auto px-6 sm:px-8 pt-20 pb-28">
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] text-center mb-12"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        The Person Behind the Lens
      </h1>

      <div className="space-y-6 text-[#2E323B] dark:text-[#D9D9D9] text-[18px] leading-[1.9]">
        <p>
          <span
            className="float-left text-7xl leading-[0.75] pr-3 pt-2 text-[#4A5D4E]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            G
          </span>
          reetings in the name of the Lord — I'm Brian, the person behind The Gospel Lens.
        </p>
        <p>
          I was born and raised in India and now live in the United States — two very different worlds that, in their own way, taught me the same thing: the gospel isn't a cultural export or a Western idea. It's good news for everyone, everywhere.
        </p>
        <p>
          I started this site because I kept running into the same problem — people (myself included, at different points) who had heard about Jesus their whole lives without ever really hearing the gospel clearly. Not a list of rules. Not a vague sense of "be a good person." The actual news: that God, in Christ, did for us what we could never do for ourselves.
        </p>
        <p>
          This isn't a pulpit, and I'm not a pastor or a theologian. I'm just someone who wants that news explained plainly, and who's gathered voices — some mine, some from teachers I trust — to help do that. My hope is simple: that whoever lands on this page, wherever they're starting from, walks away seeing the gospel a little more clearly than before.
        </p>
      </div>
    </section>
  );
}

// The deliberate "come back to this" list -- see the SAVED POSTS section
// above. Distinct from Continue Reading (which is automatic and shows only
// the single most recent post); this shows everything the visitor chose to
// bookmark, newest-saved first, and updates live if they unsave one right
// from this page.
function SavedPostsView({ openPost, setView }) {
  const [savedIds, setSavedIds] = useState(() => [...getSavedPostIds()].reverse());

  const handleToggleSave = (postId, nowSaved) => {
    if (!nowSaved) setSavedIds((ids) => ids.filter((id) => id !== postId));
  };

  const savedPosts = savedIds.map((id) => POSTS.find((p) => p.id === id)).filter(Boolean);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-24">
      <h1 className="text-4xl text-[#1C1F26] dark:text-[#F2F1EC] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Saved Posts
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-10 max-w-lg">
        Posts you've deliberately set aside to come back to — stored privately in this browser only, never sent anywhere.
      </p>

      {savedPosts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm">
          <Bookmark size={28} strokeWidth={1.75} className="mx-auto text-[#8A8D96] dark:text-[#7C808A] mb-4" />
          <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-6">
            Nothing saved yet — tap the bookmark icon on any post to add it here.
          </p>
          <button
            onClick={() => setView("blog")}
            className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-6 py-2.5 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
          >
            Browse the Blogs
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={openPost} onToggleSave={handleToggleSave} />
          ))}
        </div>
      )}
    </section>
  );
}

// The 4-day guided path (see READING_PLAN_POST_IDS above). "Upcoming" days
// are visually distinct from "next" and "done," but every single one is a
// real, clickable link the whole time -- nothing here is ever actually
// gated behind finishing an earlier day.
function ReadingPlanView({ openPost }) {
  const readIds = new Set(getReadHistory());
  const planPosts = READING_PLAN_POST_IDS.map((id) => POSTS.find((p) => p.id === id)).filter(Boolean);
  const readCount = planPosts.filter((p) => readIds.has(p.id)).length;
  const nextIndex = planPosts.findIndex((p) => !readIds.has(p.id));

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 pt-16 pb-24">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-3">Guided Reading Plan</p>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-4"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        4 Days to Understand the Gospel
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-8 max-w-lg">
        A short path through the posts that explain the gospel most clearly, in order. Every post below is a real, open link — read them in any order you like; this is just a suggested path, not a requirement.
      </p>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-sm text-[#5B5F6B] dark:text-[#A9ADB6] whitespace-nowrap">
          {readCount} of {planPosts.length} days complete
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-[#1C1F26]/10 dark:bg-[#F2F1EC]/12 overflow-hidden">
          <div className="h-full bg-[#B08D57] rounded-full transition-[width] duration-300" style={{ width: `${(readCount / planPosts.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {planPosts.map((post, i) => {
          const isDone = readIds.has(post.id);
          const isNext = i === nextIndex;
          return (
            <button
              key={post.id}
              onClick={() => openPost(post)}
              className={`flex items-center gap-4 text-left bg-white dark:bg-[#1E2128] border rounded-sm px-5 py-4 transition-colors duration-200 hover:border-[#4A5D4E]/50 ${
                isNext ? "border-[#B08D57]" : "border-[#1C1F26]/10 dark:border-[#F2F1EC]/12"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone
                    ? "bg-[#4A5D4E] text-white"
                    : isNext
                      ? "bg-[#B08D57]/15 text-[#B08D57] border-2 border-[#B08D57]"
                      : "bg-[#1C1F26]/8 dark:bg-[#F2F1EC]/10 text-[#8A8D96] dark:text-[#7C808A]"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.1em] text-[#8A8D96] dark:text-[#7C808A] font-semibold">
                  Day {i + 1}
                  {isNext ? " · Up Next" : ""}
                </div>
                <div className="text-[#1C1F26] dark:text-[#F2F1EC] font-medium mt-0.5 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {post.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// Shown for any path that isn't Home, Blogs, About, a real post, or a real
// author collection — a typo'd or dead link, rather than silently landing
// on Home with no explanation. See scripts/prerender.js for the matching
// static dist/404.html, which covers requests Vercel serves before any of
// this JS ever runs.
function NotFoundView({ setView, openPost }) {
  const recentPosts = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <section className="max-w-2xl mx-auto px-6 sm:px-8 pt-24 pb-16 text-center">
      <Eyebrow center>
        <span className="mx-auto">404</span>
      </Eyebrow>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-5"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        This Page Isn't Here
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[16px] leading-relaxed max-w-md mx-auto mb-10">
        The link may be broken, or the page may have moved. Whatever it was, it isn't lost to us — you can always find your way back.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-20">
        <button
          onClick={() => setView("home")}
          className="inline-flex items-center gap-2 bg-[#1C1F26] text-[#F8F7F3] px-6 py-3 text-sm tracking-wide hover:bg-[#4A5D4E] transition-colors duration-300"
        >
          Go Home
        </button>
        <button
          onClick={() => setView("blog")}
          className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-6 py-3 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
        >
          Browse the Blogs
        </button>
      </div>

      <div className="text-left">
        <Eyebrow>In the Meantime</Eyebrow>
        <div className="grid sm:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={openPost} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionView({ authorName, openPost, setView }) {
  const info = AUTHORS[authorName];
  if (!info) return null;

  const posts = postsByAuthor(authorName);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-28">
      <button
        onClick={() => setView("blog")}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] mb-10 hover:gap-3 transition-all duration-300"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back to Blogs
      </button>

      <p className="text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-3">Teaching From</p>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-2"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        {authorName}
      </h1>
      <p className="text-[#4A5D4E] text-sm font-medium mb-10">{info.role}</p>

      <div className="max-w-2xl space-y-5 text-[#2E323B] dark:text-[#D9D9D9] text-[17px] leading-[1.85] mb-16">
        {info.bio.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] font-semibold mb-6">
        Collection · {posts.length} {posts.length === 1 ? "post" : "posts"} on The Gospel Lens
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onOpen={openPost} />
        ))}
      </div>
    </section>
  );
}

function postsByTag(tagName) {
  const ids = POST_TAGS[tagName] || [];
  return [...POSTS].filter((p) => ids.includes(p.id)).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// A real, permanent page per topic (added 2026-09-04) -- previously topics
// only existed as filter chips on the Blogs page with no page of their own
// to link to or for search engines to index. Mirrors CollectionView's
// structure closely. Carries a "Back to Blogs" link *and* a row of every
// other topic, so a visitor can jump straight between topics without ever
// going back to Blogs first -- Brian asked specifically that switching
// topics not force a round trip through the Blogs page.
function TopicView({ topicName, openPost, setView, openTopic }) {
  const posts = postsByTag(topicName);
  if (posts.length === 0) return null;

  const otherTopics = Object.keys(POST_TAGS).filter((t) => t !== topicName);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-28">
      <button
        onClick={() => setView("blog")}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] mb-10 hover:gap-3 transition-all duration-300"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back to Blogs
      </button>

      <p className="text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-3">Topic</p>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-3"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        {topicName}
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-10">
        {posts.length} {posts.length === 1 ? "post" : "posts"} on The Gospel Lens.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onOpen={openPost} />
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] font-semibold mb-4">Other Topics</p>
      <div className="flex flex-wrap gap-2">
        {otherTopics.map((t) => (
          <button
            key={t}
            onClick={() => openTopic(t)}
            className="text-xs text-[#5B5F6B] dark:text-[#A9ADB6] bg-[#4A5D4E]/6 hover:bg-[#4A5D4E]/12 hover:text-[#4A5D4E] px-3 py-1.5 rounded-full transition-colors duration-200"
          >
            {t}
          </button>
        ))}
      </div>
    </section>
  );
}

// Quiet "pick up where you left off" nudge — only appears once a visitor
// has actually opened a post before (see READ HISTORY above), pointing at
// the most recent one. Reads localStorage once per mount, which is enough
// since HomeView remounts fresh whenever the view switches back to Home.
function ContinueReadingCard({ openPost }) {
  const [lastPost] = useState(() => {
    const history = getReadHistory();
    if (!history.length) return null;
    return POSTS.find((p) => p.id === history[history.length - 1]) || null;
  });

  if (!lastPost) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 -mt-8 mb-4">
      <button
        onClick={() => openPost(lastPost)}
        className="w-full text-left flex items-center justify-between gap-4 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-5 py-4 hover:border-[#4A5D4E]/50 transition-colors duration-200"
      >
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] font-semibold">
            Continue Reading
          </span>
          <div className="text-[#1C1F26] dark:text-[#F2F1EC] font-medium mt-0.5 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lastPost.title}
          </div>
        </div>
        <ArrowRight size={16} strokeWidth={2} className="shrink-0 text-[#4A5D4E]" />
      </button>
    </div>
  );
}

// Dark solid card, deliberately distinct from the lighter Continue Reading
// card just above it, matching the treatment approved in the mockup —
// makes it read as a separate "worth a second look" moment rather than
// blending into ordinary post cards.
function FromArchiveCard({ openPost }) {
  const [post] = useState(() => getFromArchivePost());
  if (!post) return null;

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 pb-4">
      <button
        onClick={() => openPost(post)}
        className="w-full text-left flex items-center gap-4 bg-[#1C1F26] rounded-sm px-6 py-5 hover:bg-[#252932] transition-colors duration-200"
      >
        <Archive size={20} strokeWidth={1.75} className="text-[#B08D57] shrink-0" />
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#B08D57] font-semibold">From the Archive</span>
          <div className="text-[#F8F7F3] font-medium mt-0.5 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
            {post.title}
          </div>
          <span className="text-[11px] text-[#8A8D96]">Originally published {post.date}</span>
        </div>
      </button>
    </section>
  );
}

function HomeView({ setView, openPost, openReadingPlan }) {
  return (
    <>
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-20 pb-24 text-center">
        <Eyebrow center>
          <span className="mx-auto">A Christian Editorial Journal</span>
        </Eyebrow>
        <h1
          className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-6xl leading-[1.1] max-w-3xl mx-auto"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          Ordinary life, seen through an eternal lens.
        </h1>
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          Reflections on the gospel of Jesus Christ — for the doubting, the weary, and the curious alike.
        </p>
        <button
          onClick={() => setView("blog")}
          className="mt-10 inline-flex items-center gap-2 bg-[#1C1F26] text-[#F8F7F3] px-7 py-3 text-sm tracking-wide hover:bg-[#4A5D4E] transition-colors duration-300"
        >
          Read the Blogs
          <ArrowRight size={15} strokeWidth={2} />
        </button>
      </section>

      <ContinueReadingCard openPost={openPost} />

      <VerseOfDay />

      <section className="bg-white dark:bg-[#1E2128] border-y border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20">
          <Eyebrow>Our Mission</Eyebrow>
          <h2 className="text-3xl text-[#1C1F26] dark:text-[#F2F1EC] mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            What is the Gospel?
          </h2>
          <div className="space-y-5 text-[#3A3E47] dark:text-[#D9D9D9] text-[17px] leading-[1.85]">
            <p>
              <span
                className="float-left text-6xl leading-[0.8] pr-3 pt-1 text-[#4A5D4E]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                T
              </span>
              he gospel is simply this: God loved a broken world enough to enter it. In Jesus Christ, he lived the life we could not live, died the death we deserved, and rose again so that all who trust in him might be forgiven, made new, and brought home to God — not by our effort, but by his grace.
            </p>
            <p>
              It is not a to-do list. It is not a religion of rule-keeping. It is news of something already accomplished, received simply by faith. That distinction changes everything about how we live, love, fail, and hope.
            </p>
            <p>
              The Gospel Lens exists to hold ordinary life up to that light — our work, our relationships, our doubts, our grief — and to write about what becomes visible when we do.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <Eyebrow>Start Here</Eyebrow>
        <h2 className="text-3xl text-[#1C1F26] dark:text-[#F2F1EC] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          New here? Start with these.
        </h2>
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-10 max-w-lg">
          If you want to understand what the gospel actually is before anything else, these three posts are the clearest place to begin.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FOUNDATIONAL_POST_IDS.map((id) => {
            const post = POSTS.find((pp) => pp.id === id);
            return post ? <PostCard key={post.id} post={post} onOpen={openPost} featured /> : null;
          })}
        </div>
        <button
          onClick={openReadingPlan}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] mt-8 hover:gap-3 transition-all duration-300"
        >
          Prefer a guided path? Follow the 4-Day Plan
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </section>

      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <h2 className="text-3xl text-[#1C1F26] dark:text-[#F2F1EC] mb-10" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          Recent Posts
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...POSTS]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map((post) => (
              <PostCard key={post.id} post={post} onOpen={openPost} />
            ))}
        </div>
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setView("blog")}
            className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-7 py-3 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
          >
            See More
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </section>

      <FromArchiveCard openPost={openPost} />
    </>
  );
}

const PAGE_SIZE = 9;

function BlogListView({ openPost, initialSearch = "", openTopic }) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [readCount] = useState(() => getReadHistory().length);

  // Whenever a search arrives from the nav bar, apply it here too
  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  const filtered = useMemo(() => {
    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matched = [...POSTS]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((post) => (category === "All" ? true : post.category === category))
      .filter((post) => {
        if (terms.length === 0) return true;
        const index = getSearchIndex(post);
        // Every word the person typed has to appear somewhere in the post —
        // order and exact phrasing don't matter, so "grace faith" finds
        // posts about both without needing that exact phrase.
        return terms.every((term) => index.includes(term));
      });

    if (terms.length === 0) return matched;

    // While actively searching, a post whose title matches should always
    // outrank one that just happens to mention the word once in passing —
    // sort is stable, so date order is preserved within each tier.
    return [...matched].sort((a, b) => {
      const aTitleMatch = terms.every((term) => a.title.toLowerCase().includes(term));
      const bTitleMatch = terms.every((term) => b.title.toLowerCase().includes(term));
      if (aTitleMatch === bTitleMatch) return 0;
      return aTitleMatch ? -1 : 1;
    });
  }, [search, category]);

  // Reset pagination whenever the search or category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category]);

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const topics = Object.keys(POST_TAGS);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-24">
      <h1 className="text-4xl text-[#1C1F26] dark:text-[#F2F1EC] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Blogs
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-8 max-w-lg">
        Every post viewed through one lens: the finished work of Christ.
        {readCount > 0 && (
          <span className="block text-[#8A8D96] dark:text-[#7C808A] text-[13px] mt-1">
            You've read {readCount} {readCount === 1 ? "post" : "posts"} so far.
          </span>
        )}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8D96] dark:text-[#7C808A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, topics, verses…"
            className="w-full bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 pl-9 pr-9 py-2.5 text-sm text-[#1C1F26] dark:text-[#F2F1EC] placeholder:text-[#8A8D96] focus:outline-none focus:border-[#4A5D4E] rounded-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8D96] dark:text-[#7C808A] hover:text-[#1C1F26]"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] px-3.5 py-2 rounded-full border-2 transition-all duration-200 ${
                  active
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-[0_4px_12px_-4px_rgba(74,93,78,0.5)]"
                    : "bg-white dark:bg-[#1E2128] text-[#5B5F6B] dark:text-[#A9ADB6] border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 hover:border-[#4A5D4E]/50"
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#1E2128]" />}
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] font-semibold mr-1">Topics:</span>
        {topics.map((tag) => (
          <button
            key={tag}
            onClick={() => openTopic(tag)}
            className="text-xs text-[#5B5F6B] dark:text-[#A9ADB6] bg-[#4A5D4E]/6 hover:bg-[#4A5D4E]/12 hover:text-[#4A5D4E] px-3 py-1.5 rounded-full transition-colors duration-200"
          >
            {tag}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#8A8D96] dark:text-[#7C808A] mb-8">
        Showing {filtered.length} {filtered.length === 1 ? "post" : "posts"}
        {category !== "All" ? <> in <span className="font-semibold text-[#4A5D4E]">{category}</span></> : null}
        {search.trim() ? <> matching "<span className="font-semibold text-[#1C1F26] dark:text-[#F2F1EC]">{search.trim()}</span>"</> : null}
      </p>

      {filtered.length === 0 ? (
        <p className="text-[#8A8D96] dark:text-[#7C808A] text-sm py-16 text-center">
          Nothing matches that search yet — try a different word or category.
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} onOpen={openPost} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-7 py-3 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="no-print fixed top-20 left-0 w-full h-[3px] bg-transparent z-20">
      <div className="h-full bg-[#B08D57] transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}

// Presentational only — playback state/logic lives in useListenToPost so the
// top and bottom buttons on a post can share one state and either can
// control the same reading. Main button is a simple play/pause/resume
// toggle; the small restart button (only shown once something's queued)
// fully stops and clears it so the next tap starts from the beginning.
function ListenButton({ status, onToggle, onRestart, supported }) {
  if (!supported) return null;
  const label = status === "speaking" ? "Pause" : status === "paused" ? "Resume" : "Listen to This Post";
  const Icon = status === "speaking" ? Pause : Play;
  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
      >
        <Icon size={14} strokeWidth={2} />
        {label}
      </button>
      {status !== "idle" && (
        <button
          onClick={onRestart}
          aria-label="Restart from the beginning"
          title="Restart from the beginning"
          className="inline-flex items-center justify-center w-8 h-8 text-[#8A8D96] dark:text-[#7C808A] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
        >
          <RotateCcw size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

function ShareBar({ post }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = () => `${window.location.origin}/${slugify(post.title)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // clipboard unavailable — fail quietly
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: shareUrl() });
      } catch (err) {
        // user cancelled — no action needed
      }
    } else {
      handleCopy();
    }
  };

  const shareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-3 mt-14 pt-8 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
      <span className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] font-semibold mr-1">Share</span>
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200 sm:hidden"
      >
        <Share2 size={14} strokeWidth={2} />
        Share
      </button>
      <button
        onClick={shareX}
        className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
      >
        Share on X
      </button>
      <button
        onClick={shareFacebook}
        className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
      >
        Share on Facebook
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
      >
        {copied ? <Check size={14} strokeWidth={2} /> : <Link2 size={14} strokeWidth={2} />}
        {copied ? "Link Copied" : "Copy Link"}
      </button>
    </div>
  );
}

function SinglePostView({ post, setView, openPost, openCollection }) {
  const { status: listenStatus, toggle: toggleListen, restart: restartListen, supported: listenSupported } = useListenToPost(post || POSTS[0]);
  const [saved, setSaved] = useState(() => isPostSaved((post || POSTS[0]).id));

  // Quietly note this post as read — see the READ HISTORY section above.
  useEffect(() => {
    if (post) recordPostRead(post.id);
  }, [post?.id]);

  // This component doesn't unmount between posts (only `post` changes), so
  // the bookmark toggle's own local state needs an explicit refresh here
  // rather than just a useState initializer.
  useEffect(() => {
    if (post) setSaved(isPostSaved(post.id));
  }, [post?.id]);

  if (!post) return null;

  const handleToggleSave = () => setSaved(toggleSavedPost(post.id));

  const related = getRelatedPosts(post, 2);

  const sortedByDate = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentIndex = sortedByDate.findIndex((p) => p.id === post.id);
  const newerPost = currentIndex > 0 ? sortedByDate[currentIndex - 1] : null;
  const olderPost = currentIndex < sortedByDate.length - 1 ? sortedByDate[currentIndex + 1] : null;

  return (
    <article className="pt-16 pb-28">
      <ReadingProgress />
      <div className="max-w-2xl mx-auto px-6 sm:px-8">
        <button
          onClick={() => setView("blog")}
          className="no-print inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] mb-10 hover:gap-3 transition-all duration-300"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to Blogs
        </button>

        <CategoryTag category={post.category} />
        <p className="post-byline text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] mt-3">
          {post.author && AUTHORS[post.author] ? (
            <button
              onClick={() => openCollection(post.author)}
              className="hover:text-[#4A5D4E] hover:underline underline-offset-2 transition-colors duration-200"
            >
              By {post.author}
            </button>
          ) : post.author ? (
            `By ${post.author}`
          ) : null}
          {post.author ? " · " : ""}
          {post.date} · {estimateReadTime(post)}
        </p>
        <h1
          className="text-[#1C1F26] dark:text-[#F2F1EC] text-3xl sm:text-[2.75rem] leading-[1.15] mt-4 mb-5"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {post.title}
        </h1>

        <div className="no-print flex flex-wrap gap-3 mb-10">
          <ListenButton status={listenStatus} onToggle={toggleListen} onRestart={restartListen} supported={listenSupported} />
          <button
            onClick={handleToggleSave}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
          >
            <Bookmark size={14} strokeWidth={2} className={saved ? "text-[#B08D57]" : ""} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save for Later"}
          </button>
        </div>

        <PostBody blocks={post.blocks} post={post} />

        <div className="no-print flex flex-wrap gap-3 mb-6">
          <ListenButton status={listenStatus} onToggle={toggleListen} onRestart={restartListen} supported={listenSupported} />
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
          >
            <Printer size={14} strokeWidth={2} />
            Print / Save as PDF
          </button>
        </div>

        <ShareBar post={post} />

        {(olderPost || newerPost) && (
          <div className="no-print grid grid-cols-2 gap-4 mt-8">
            {olderPost ? (
              <button
                onClick={() => openPost(olderPost)}
                className="text-left border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-4 py-3 hover:border-[#4A5D4E]/50 transition-colors duration-200"
              >
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] mb-1">
                  <ArrowLeft size={11} strokeWidth={2} /> Older
                </span>
                <span className="text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] line-clamp-2">{olderPost.title}</span>
              </button>
            ) : <div />}
            {newerPost ? (
              <button
                onClick={() => openPost(newerPost)}
                className="text-right border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-4 py-3 hover:border-[#4A5D4E]/50 transition-colors duration-200"
              >
                <span className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] mb-1">
                  Newer <ArrowRight size={11} strokeWidth={2} />
                </span>
                <span className="text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] line-clamp-2">{newerPost.title}</span>
              </button>
            ) : <div />}
          </div>
        )}

        <div className="no-print mt-8">
          <button
            onClick={() => setView("blog")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] hover:text-[#4A5D4E] transition-colors duration-300"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Blogs
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <div className="no-print max-w-5xl mx-auto px-6 sm:px-8 mt-20 pt-14 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
          <Eyebrow>Keep Reading</Eyebrow>
          <h3 className="text-2xl text-[#1C1F26] dark:text-[#F2F1EC] mb-8" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            More Posts Like This
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {related.map((p) => (
              <PostCard key={p.id} post={p} onOpen={openPost} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// ROOT APP
// ---------------------------------------------------------------------------

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="no-print fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-[#1C1F26] text-[#F8F7F3] flex items-center justify-center shadow-lg hover:bg-[#4A5D4E] transition-colors duration-300"
    >
      <ArrowRight size={16} strokeWidth={2.5} style={{ transform: "rotate(-90deg)" }} />
    </button>
  );
}

export default function GospelLensApp() {
  const [view, setView] = useState("home");
  const [activePost, setActivePost] = useState(null);
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // The inline script in index.html already applied the right class to
  // <html> before this ever mounts (saved localStorage choice, else the
  // system's prefers-color-scheme) — read that back rather than always
  // starting from false, so state and DOM agree from the first render
  // instead of a toggle being needed to "notice" dark mode is already on.
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  const [navSearch, setNavSearch] = useState("");

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      try {
        window.localStorage.setItem("gospel-lens-theme", next ? "dark" : "light");
      } catch (e) {
        // localStorage unavailable — theme just won't persist, non-fatal
      }
      return next;
    });
  };

  const handleNavSearch = (query) => {
    setNavSearch(query);
    setView("blog");
    window.history.pushState(null, "", "/blog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Read the URL path on load (and on back/forward navigation) so a shared
  // link like /we-will-worship-and-we-will-reign opens that exact post
  // instead of always landing on Home. Old-style #slug and #post-4 links
  // (from before real URLs existed) are silently upgraded in place —
  // history.replaceState swaps the hash for the real path with no visible
  // redirect, so links already shared out in the wild keep working.
  useEffect(() => {
    const applyLocation = () => {
      const path = window.location.pathname.replace(/\/+$/, "") || "/";
      const hash = window.location.hash.replace("#", "");

      if (path === "/" && hash) {
        let target = null;
        if (hash === "blog") target = "/blog";
        else if (hash === "about") target = "/about";
        else if (hash.startsWith("post-")) {
          const id = parseInt(hash.replace("post-", ""), 10);
          const found = POSTS.find((pp) => pp.id === id);
          if (found) target = `/${slugify(found.title)}`;
        } else if (hash.startsWith("collection-")) {
          const authorSlug = hash.replace("collection-", "");
          const authorName = Object.keys(AUTHORS).find((name) => slugify(name) === authorSlug);
          if (authorName) target = `/collection/${slugify(authorName)}`;
        } else {
          const found = getPostBySlug(hash);
          if (found) target = `/${slugify(found.title)}`;
        }
        if (target) {
          window.history.replaceState(null, "", target);
          return applyLocation();
        }
      }

      if (path === "/blog") {
        setView("blog");
        return;
      }
      if (path === "/about") {
        setView("about");
        return;
      }
      if (path === "/saved") {
        setView("saved");
        return;
      }
      if (path.startsWith("/collection/")) {
        const authorSlug = path.replace("/collection/", "");
        const authorName = Object.keys(AUTHORS).find((name) => slugify(name) === authorSlug);
        if (authorName) {
          setActiveAuthor(authorName);
          setView("collection");
          return;
        }
      }
      if (path.startsWith("/topics/")) {
        const topicSlug = path.replace("/topics/", "");
        const topicName = Object.keys(POST_TAGS).find((name) => slugify(name) === topicSlug);
        if (topicName) {
          setActiveTopic(topicName);
          setView("topic");
          return;
        }
      }
      if (path === "/liked") {
        setView("liked");
        return;
      }
      if (path === "/start-here") {
        setView("readingplan");
        return;
      }
      if (path !== "/") {
        const found = getPostBySlug(path.replace(/^\//, ""));
        if (found) {
          setActivePost(found);
          setView("post");
          return;
        }
        // A non-root path that didn't match blog/about/a collection/a post
        // above is a genuine dead or mistyped link — show a real "not
        // found" page instead of silently falling back to Home.
        setView("notfound");
        return;
      }
      setView("home");
    };
    applyLocation();
    window.addEventListener("popstate", applyLocation);
    return () => window.removeEventListener("popstate", applyLocation);
  }, []);

  // Keep the browser tab title in sync with what's on screen
  useEffect(() => {
    if (view === "post" && activePost) {
      document.title = `${activePost.title} — The Gospel Lens`;
    } else if (view === "blog") {
      document.title = "Blogs — The Gospel Lens";
    } else if (view === "about") {
      document.title = "The Person Behind the Lens — The Gospel Lens";
    } else if (view === "collection" && activeAuthor) {
      document.title = `${activeAuthor} — The Gospel Lens`;
    } else if (view === "topic" && activeTopic) {
      document.title = `${activeTopic} — The Gospel Lens`;
    } else if (view === "saved") {
      document.title = "Saved Posts — The Gospel Lens";
    } else if (view === "liked") {
      document.title = "Liked Posts — The Gospel Lens";
    } else if (view === "readingplan") {
      document.title = "4 Days to Understand the Gospel — The Gospel Lens";
    } else if (view === "notfound") {
      document.title = "Page Not Found — The Gospel Lens";
    } else {
      document.title = "The Gospel Lens";
    }
  }, [view, activePost, activeAuthor, activeTopic]);

  const openPost = (post) => {
    setActivePost(post);
    setView("post");
    window.history.pushState(null, "", `/${slugify(post.title)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCollection = (authorName) => {
    setActiveAuthor(authorName);
    setView("collection");
    window.history.pushState(null, "", `/collection/${slugify(authorName)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTopic = (topicName) => {
    setActiveTopic(topicName);
    setView("topic");
    window.history.pushState(null, "", `/topics/${slugify(topicName)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openReadingPlan = () => {
    setView("readingplan");
    window.history.pushState(null, "", "/start-here");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeView = (v) => {
    setView(v);
    setMenuOpen(false);
    window.history.pushState(null, "", v === "home" ? "/" : `/${v}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#14161B] flex flex-col transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        * { font-family: 'Inter', sans-serif; }

        @media print {
          header, footer, .no-print { display: none !important; }
          body, .min-h-screen { background: #fff !important; }
          article { padding: 0 !important; }
          a[href]:after { content: none !important; }

          /* The byline (author · date · read time) uses a light gray meant
             for screens — printers/PDF export often wash light gray out to
             near-invisible, and its clickable-author <button> can pick up
             stray print-only chrome. Force solid, plain text here so it
             actually reads on paper, without touching colors anywhere else
             in the article (the scripture/quote callout boxes rely on
             theirs, e.g. light text on a dark background). */
          .post-byline {
            color: #1C1F26 !important;
            font-size: 11px !important;
          }
          .post-byline button {
            background: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            font: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      <Nav view={view} setView={changeView} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onSearch={handleNavSearch} dark={dark} toggleDark={toggleDark} />

      <main className="flex-1">
        {view === "home" && <HomeView setView={changeView} openPost={openPost} openReadingPlan={openReadingPlan} />}
        {view === "blog" && <BlogListView openPost={openPost} initialSearch={navSearch} openTopic={openTopic} />}
        {view === "about" && <AboutView />}
        {view === "collection" && <CollectionView authorName={activeAuthor} openPost={openPost} setView={changeView} />}
        {view === "topic" && <TopicView topicName={activeTopic} openPost={openPost} setView={changeView} openTopic={openTopic} />}
        {view === "post" && <SinglePostView post={activePost} setView={changeView} openPost={openPost} openCollection={openCollection} />}
        {view === "saved" && <SavedPostsView openPost={openPost} setView={changeView} />}
        {view === "readingplan" && <ReadingPlanView openPost={openPost} />}
        {view === "notfound" && <NotFoundView setView={changeView} openPost={openPost} />}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}

// Named exports alongside the default — used only by scripts/notify-buttondown.js
// (via esbuild, see loadPostsData() there) to read the real POSTS/AUTHORS data,
// blocks included, for building newsletter email HTML. Doesn't affect the app.
export { POSTS, AUTHORS };
