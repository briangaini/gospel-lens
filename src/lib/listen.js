import { useEffect, useRef, useState } from "react";
import { postToSpeechSegments } from "./postText";

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
// Brian's explicit pick (2026-09-14, after comparing real options via a
// dedicated voice-picker page): "Google US English" whenever a visitor's
// browser actually offers it. This voice was already usually winning the
// scoring below on Chrome anyway, but "usually" wasn't good enough — an
// exact-name match here makes it deterministic, not just the current
// highest scorer, so a future browser update can't quietly out-score it
// and swap the voice out from under him. Chrome (and other Chromium
// browsers) exposes this Google cloud voice; Safari and most mobile
// browsers don't, since it's Google's, not Apple's or the OS's — those
// fall through to the scored pick below exactly as before.
const PREFERRED_VOICE_NAME = "google us english";
function pickBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred = voices.find((v) => v.name.toLowerCase() === PREFERRED_VOICE_NAME);
  if (preferred) return preferred;
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
export function useListenToPost(post) {
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
    if (voiceRef.current) {
      u.voice = voiceRef.current;
      // Also set `lang` explicitly to match the chosen voice, not just
      // `voice` -- a real, documented Chrome quirk (setting `.voice` alone
      // is unreliable and can silently fall back to a different, local
      // default voice, especially for a "network"/cloud voice like Google
      // US English) that this project hit for real: Brian confirmed
      // "Google US English" was correctly marked auto-picked, yet Samantha
      // kept playing on Mac Chrome regardless. This is the documented fix.
      u.lang = voiceRef.current.lang;
    }
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
