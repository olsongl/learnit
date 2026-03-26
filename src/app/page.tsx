import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Learn from{" "}
        <span className="text-primary">Verified Experts</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
        Cmart is a course marketplace where every teacher&apos;s credentials are
        verified. Browse courses with confidence knowing your instructors are
        the real deal.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/courses"
          className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Browse Courses
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-input bg-background px-6 py-3 text-sm font-semibold hover:bg-accent"
        >
          Start Teaching
        </Link>
      </div>
    </div>
  );
}
