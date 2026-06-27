import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "what_works", label: "What works" },
  { value: "whats_bad", label: "What's not working" },
  { value: "suggestion", label: "Suggestion" },
  { value: "factual_inaccuracy", label: "Factual inaccuracy" },
  { value: "bug", label: "Bug" },
  { value: "content_request", label: "Content request" },
  { value: "other", label: "Other" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<CategoryValue>("suggestion");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      const prev = JSON.parse(localStorage.getItem("entoquest:feedback") ?? "[]");
      prev.push({ category, message, ts: Date.now(), page: location.pathname });
      localStorage.setItem("entoquest:feedback", JSON.stringify(prev));
    } catch {
      /* ignore */
    }
    toast.success("Feedback saved locally.");
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-foreground">Send feedback</h2>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {sent ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="rounded-md bg-success/10 px-3 py-2 text-success">Thanks! Your note was saved.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSent(false);
                  setMessage("");
                }}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
              >
                Send another
              </button>
              <button
                onClick={onClose}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="text-foreground">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryValue)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-foreground">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                rows={5}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                placeholder="Tell us what you think…"
              />
              <span className="text-[10px] text-muted-foreground">{message.length}/5000</span>
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!message.trim()}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}