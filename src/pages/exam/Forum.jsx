import { useEffect, useState } from "react";
import { examApi, formatExamDate } from "../../utils/examApi";
import { PageHeader, Pill, PrimaryButton, Surface } from "./components/ExamUI";
import EdvoraLoader from "../../common/EdvoraLoader";
import { openSnackbar } from "../../common/snackbar/snackbar";

export default function Forum() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("General");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await examApi.listForum();
    setPosts(data || []);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await load();
      } catch (error) {
        openSnackbar({ message: error.message, variant: "error" });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      openSnackbar({ message: "Title and body required", variant: "warning" });
      return;
    }
    setSaving(true);
    try {
      await examApi.createForumPost({ title, body, tag });
      openSnackbar({ message: "Post published", variant: "success" });
      setTitle("");
      setBody("");
      setShowForm(false);
      await load();
    } catch (error) {
      openSnackbar({ message: error.message, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EdvoraLoader message="Loading forum…" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Forum"
        description="Ask doubts and share tips with peers."
        action={
          <PrimaryButton onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New post"}
          </PrimaryButton>
        }
      />

      {showForm ? (
        <Surface className="p-4 sm:p-5 mb-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full h-11 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] px-3 text-sm outline-none focus:border-[#a77a95]"
          />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tag (e.g. Mathematics)"
            className="w-full h-11 rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] px-3 text-sm outline-none focus:border-[#a77a95]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write your doubt or tip…"
            className="w-full rounded-xl border border-[#e8d5e0] bg-[#fdf8fb] px-3 py-2.5 text-sm outline-none focus:border-[#a77a95] resize-y"
          />
          <PrimaryButton disabled={saving} onClick={submit}>
            {saving ? "Publishing…" : "Publish"}
          </PrimaryButton>
        </Surface>
      ) : null}

      <Surface className="overflow-hidden">
        {posts.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#735366]/65">
            No posts yet. Be the first to ask.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0e4eb]">
            {posts.map((post) => (
              <li key={post.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{post.tag}</Pill>
                  <span className="text-[11px] text-[#735366]/50">
                    {formatExamDate(post.time)}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-sm text-[#3d1f33]">
                  {post.title}
                </p>
                <p className="mt-1 text-sm text-[#735366]/75 whitespace-pre-wrap">
                  {post.body}
                </p>
                <p className="mt-1 text-xs text-[#735366]/65">
                  {post.author} · {post.replies || 0} replies
                </p>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}
