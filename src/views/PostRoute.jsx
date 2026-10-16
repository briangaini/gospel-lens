import { Suspense, useEffect, useMemo, useState } from "react";
import { SinglePostView } from "./lazy";
import { getLoadedPostBody, loadPostBody } from "../lib/posts";

// What the post page shows while its body is still on its way: the title and
// summary, which are already known, so there's something real to read at once.
function PostLoading({ post, failed }) {
  return (
    <div className="max-w-[760px] mx-auto px-6 sm:px-8 pt-14 sm:pt-20 pb-24 min-h-[70vh]">
      <h1 className="text-[#1C1F26] dark:text-[#F2F1EC] text-[34px] sm:text-5xl leading-[1.1] mb-5" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        {post.title}
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-lg italic leading-relaxed">{post.excerpt}</p>
      {failed && (
        <p className="mt-8 text-[15px] text-[#5B5F6B] dark:text-[#A9ADB6]">
          This post couldn't be loaded. Check your connection and{" "}
          <button type="button" onClick={() => window.location.reload()} className="hit font-semibold text-[#4A5D4E] dark:text-[#8FAE95] underline underline-offset-[3px]">
            try again
          </button>
          .
        </p>
      )}
    </div>
  );
}

// Opens a post: starts fetching its body and the post page's code together, then
// shows the full page once the body is here. `post` is the post's details (from
// the always-loaded list); the body (its blocks) is fetched on demand.
export function PostRoute({ post, ...props }) {
  const [blocks, setBlocks] = useState(() => getLoadedPostBody(post.id));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setBlocks(getLoadedPostBody(post.id));
    setFailed(false);
    SinglePostView.preload();
    loadPostBody(post.id).then(
      (b) => live && setBlocks(b),
      () => live && setFailed(true)
    );
    return () => {
      live = false;
    };
  }, [post.id]);

  // One stable object per (post, body), so the page's hooks don't see a new post every render.
  const full = useMemo(() => (blocks ? { ...post, blocks } : null), [post, blocks]);
  // Right after switching posts, `blocks` may still be the previous post's for one render.
  const ready = full && getLoadedPostBody(post.id) === blocks;

  if (!ready) return <PostLoading post={post} failed={failed} />;
  return (
    <Suspense fallback={<PostLoading post={post} />}>
      <SinglePostView post={full} {...props} />
    </Suspense>
  );
}
