import Link from "next/link";
import { getStage, STAGES } from "@/engine/session";

export function generateStaticParams() {
  return STAGES.map((s) => ({ id: s.id }));
}

const REP_OPTIONS = [10, 25, 50, 100];

export default async function StagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stage = getStage(id);

  if (!stage) {
    return (
      <div className="text-center py-12">
        <div className="text-muted">Stage not found</div>
        <Link href="/gym" className="text-action">Back to Gym</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/gym" className="text-sm text-muted hover:text-foreground">
          &larr; Back
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Stage {stage.id}: {stage.name}</h1>
        <p className="text-muted">{stage.description}</p>
      </div>

      {/* What you'll practice */}
      <div className="rounded-2xl border border-line bg-card p-4 space-y-2">
        <h2 className="font-semibold">In this stage</h2>
        <ul className="text-sm text-muted space-y-1">
          {stage.focusTypes.length > 1 && (
            <li>Focus: actor-focus & object-focus</li>
          )}
          {stage.aspects.length > 1 && (
            <li>Aspects: {stage.aspects.join(", ")}</li>
          )}
          <li>Pronouns: ako, ka, kami, kayo, tayo, siya, sila</li>
          {stage.objects.length > 0 && (
            <li>Objects: mangga, kanin, isda, manok, tinapay, mansanas</li>
          )}
          {stage.allowTime && (
            <li>Time: kahapon, ngayon, mamaya, bukas</li>
          )}
        </ul>
      </div>

      {/* Rep count selection */}
      <div className="space-y-3">
        <h2 className="font-semibold">Choose rep count</h2>
        <div className="grid grid-cols-2 gap-3">
          {REP_OPTIONS.map((reps) => (
            <Link
              key={reps}
              href={`/gym/drill?stage=${stage.id}&reps=${reps}`}
              className="rounded-2xl border border-line bg-card p-4 text-center transition-colors hover:border-foreground/30"
            >
              <div className="text-2xl font-bold">{reps}</div>
              <div className="text-sm text-muted">reps</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Start button */}
      <Link
        href={`/gym/drill?stage=${stage.id}&reps=25`}
        className="block rounded-2xl bg-action py-4 text-center font-semibold text-white"
      >
        Start Drill
      </Link>
    </div>
  );
}
