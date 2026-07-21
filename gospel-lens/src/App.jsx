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
const BUTTONDOWN_USERNAME = "";

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
  "Grace & Assurance": [3, 14, 7],
  "Sin & Repentance": [8, 17],
  "Grief & Comfort": [6, 21, 22],
  "Purpose & Calling": [5, 13, 23, 26],
  "Prayer": [2, 18],
  "Worship": [4],
  "Friendship": [20],
  "Discipline & Growth": [10, 11, 24, 25],
  "Identity in Christ": [16],
};

function tagsForPost(postId) {
  return Object.keys(POST_TAGS).filter((tag) => POST_TAGS[tag].includes(postId));
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
      view === v || (v === "blog" && view === "post")
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

  return (
    <header className="sticky top-0 z-30 bg-[#F8F7F3]/90 dark:bg-[#14161B]/90 backdrop-blur-sm border-b border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between gap-3">
        <button onClick={() => setView("home")} className="flex items-center gap-2.5 group shrink-0">
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#B08D57] text-[#B08D57] group-hover:bg-[#B08D57] group-hover:text-[#F8F7F3] transition-colors duration-300">
            <BookOpen size={15} strokeWidth={1.75} />
          </span>
          <span
            className="text-[22px] text-[#1C1F26] dark:text-[#F2F1EC] tracking-tight hidden xs:inline"
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
                className="text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] transition-colors duration-200"
              >
                <Search size={18} strokeWidth={2} />
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
            <form
              action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`}
              method="post"
              target="_blank"
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
            <div className="flex items-center gap-5 text-xs">
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
 
function PostCard({ post, onOpen, featured = false }) {
  return (
    <button
      onClick={() => onOpen(post)}
      className={`group text-left flex flex-col bg-white dark:bg-[#1E2128] border border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 hover:border-[#B08D57]/40 rounded-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-15px_rgba(28,31,38,0.25)] ${
        featured ? "p-8" : "p-7"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
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
    </button>
  );
}
 
// ---------------------------------------------------------------------------
// POST BODY RENDERER — turns the `blocks` array into styled sections
// ---------------------------------------------------------------------------
 
function PostBody({ blocks }) {
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
 
function VerseOfDay() {
  const verse = useMemo(() => getVerseOfDay(), []);
  const [copied, setCopied] = useState(false);
 
  const shareText = `"${verse.text}" — ${verse.reference} (ESV)`;
  const shareUrl = () => window.location.href.split("#")[0];
 
  const handleShare = async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Verse of the Day — The Gospel Lens", text: shareText, url });
      } catch (err) {
        // user cancelled — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n\nRead more at ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // clipboard unavailable — fail quietly
      }
    }
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B0B4BD] hover:text-[#B08D57] mt-5 transition-colors duration-200"
        >
          {copied ? <Check size={13} strokeWidth={2} /> : <Share2 size={13} strokeWidth={2} />}
          {copied ? "Copied — paste anywhere" : "Share this verse"}
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
 
function HomeView({ setView, openPost }) {
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
    </>
  );
}
 
const PAGE_SIZE = 9;
 
function BlogListView({ openPost, initialSearch = "" }) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
 
  // Whenever a search arrives from the nav bar, apply it here too
  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);
 
  const filtered = useMemo(() => {
    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return [...POSTS]
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
            onClick={() => setSearch(tag)}
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
    <div className="fixed top-20 left-0 w-full h-[3px] bg-transparent z-20">
      <div className="h-full bg-[#B08D57] transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}
 
function ShareBar({ post }) {
  const [copied, setCopied] = useState(false);
 
  const shareUrl = () => {
    const base = window.location.href.split("#")[0];
    return `${base}#${slugify(post.title)}`;
  };
 
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
 
function SinglePostView({ post, setView, openPost }) {
  if (!post) return null;
 
  const related = POSTS.filter((p) => p.category === post.category && p.id !== post.id).slice(0, 2);
 
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
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] mb-10 hover:gap-3 transition-all duration-300"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to Blogs
        </button>
 
        <CategoryTag category={post.category} />
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] mt-3">
          {post.author ? `By ${post.author} · ` : ""}
          {post.date} · {estimateReadTime(post)}
        </p>
        <h1
          className="text-[#1C1F26] dark:text-[#F2F1EC] text-3xl sm:text-[2.75rem] leading-[1.15] mt-4 mb-10"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {post.title}
        </h1>
 
        <PostBody blocks={post.blocks} />
 
        <ShareBar post={post} />
 
        {(olderPost || newerPost) && (
          <div className="grid grid-cols-2 gap-4 mt-8">
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
 
        <div className="mt-8">
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
        <div className="max-w-5xl mx-auto px-6 sm:px-8 mt-20 pt-14 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
          <Eyebrow>Keep Reading</Eyebrow>
          <h3 className="text-2xl text-[#1C1F26] dark:text-[#F2F1EC] mb-8" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            More in {post.category}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [navSearch, setNavSearch] = useState("");
 
  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };
 
  const handleNavSearch = (query) => {
    setNavSearch(query);
    setView("blog");
    window.location.hash = "blog";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
  // Read the URL hash on load (and whenever it changes) so a shared link
  // like #we-will-worship-and-we-will-reign opens that exact post instead
  // of always landing on Home. Old-style #post-4 links still work too.
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
 
      if (hash === "blog") {
        setView("blog");
        return;
      }
      if (hash === "about") {
        setView("about");
        return;
      }
      if (hash.startsWith("post-")) {
        const id = parseInt(hash.replace("post-", ""), 10);
        const found = POSTS.find((pp) => pp.id === id);
        if (found) {
          setActivePost(found);
          setView("post");
          return;
        }
      }
      if (hash) {
        const found = getPostBySlug(hash);
        if (found) {
          setActivePost(found);
          setView("post");
          return;
        }
      }
      setView("home");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);
 
  // Keep the browser tab title in sync with what's on screen
  useEffect(() => {
    if (view === "post" && activePost) {
      document.title = `${activePost.title} — The Gospel Lens`;
    } else if (view === "blog") {
      document.title = "Blogs — The Gospel Lens";
    } else if (view === "about") {
      document.title = "The Person Behind the Lens — The Gospel Lens";
    } else {
      document.title = "The Gospel Lens";
    }
  }, [view, activePost]);
 
  const openPost = (post) => {
    setActivePost(post);
    setView("post");
    window.location.hash = slugify(post.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
  const changeView = (v) => {
    setView(v);
    setMenuOpen(false);
    window.location.hash = v === "home" ? "" : v;
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
        }
      `}</style>
 
      <Nav view={view} setView={changeView} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onSearch={handleNavSearch} dark={dark} toggleDark={toggleDark} />
 
      <main className="flex-1">
        {view === "home" && <HomeView setView={changeView} openPost={openPost} />}
        {view === "blog" && <BlogListView openPost={openPost} initialSearch={navSearch} />}
        {view === "about" && <AboutView />}
        {view === "post" && <SinglePostView post={activePost} setView={changeView} openPost={openPost} />}
      </main>
 
      <Footer />
      <BackToTop />
    </div>
  );
}
 
