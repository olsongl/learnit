import Link from "next/link";
import {
  Search,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Dumbbell,
  Apple,
  Briefcase,
  Monitor,
  Music,
  Camera,
  Star,
  CheckCircle2,
  DollarSign,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const categories = [
  { name: "Fitness", icon: Dumbbell, count: 48, color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
  { name: "Nutrition", icon: Apple, count: 35, color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
  { name: "Business", icon: Briefcase, count: 62, color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { name: "Technology", icon: Monitor, count: 89, color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  { name: "Music", icon: Music, count: 27, color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  { name: "Photography", icon: Camera, count: 31, color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
];

const steps = [
  {
    icon: Search,
    title: "Browse",
    description: "Explore courses across dozens of categories from verified instructors.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    description: "Every teacher's credentials are reviewed and displayed so you know who you're learning from.",
  },
  {
    icon: BookOpen,
    title: "Learn",
    description: "Enroll and start learning at your own pace with video lessons, quizzes, and downloads.",
  },
];

const valueProps = [
  {
    icon: ShieldCheck,
    title: "Verified Teachers",
    description:
      "Every instructor submits credentials that are reviewed by our team. A verified badge means real qualifications.",
  },
  {
    icon: DollarSign,
    title: "Flexible Pricing",
    description:
      "Free courses, one-time purchases, or monthly subscriptions. Teachers set fair prices, and our fees are transparent.",
  },
  {
    icon: Award,
    title: "Expert Content",
    description:
      "Courses built by professionals who practice what they teach. Quality content you can trust.",
  },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Certified Personal Trainer",
    text: "As a CPT, I was tired of platforms where anyone could call themselves a fitness expert. Cmart verifies credentials so my students know they're getting real expertise.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Web Development Student",
    text: "I enrolled in three courses on Cmart and every instructor actually had industry experience. The credential badges gave me confidence before I even hit 'enroll.'",
    rating: 5,
  },
  {
    name: "Maria Gonzalez",
    role: "Nutrition Coach & Teacher",
    text: "The platform fee is incredibly fair and the payout process is seamless. I migrated all my courses here and my students appreciate the transparency.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 sm:py-28 lg:py-36">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Learn from{" "}
            <span className="text-primary">Verified Experts</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Cmart is the course marketplace where every teacher&apos;s
            credentials are reviewed and verified. Browse with confidence,
            learn from the real deal.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/courses">
                Browse Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/pricing">
                Start Teaching
                <GraduationCap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Getting started is simple. Three steps to quality education from
              qualified instructors.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <span className="mt-4 block text-sm font-semibold text-primary">
                  Step {index + 1}
                </span>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-muted/50 py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Explore Categories
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              From fitness to tech, find courses taught by credentialed
              professionals in every field.
            </p>
          </div>
          <div className="mt-14 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/categories/${cat.name.toLowerCase()}`}
                className="group"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${cat.color}`}
                    >
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 font-semibold group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cat.count} courses
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/categories">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Cmart */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Cmart?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              We built a marketplace that puts trust and quality first.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {valueProps.map((prop) => (
              <Card key={prop.title} className="border-0 shadow-none bg-transparent">
                <CardHeader className="items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <prop.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{prop.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {prop.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Our Community Says
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Teachers and students sharing their Cmart experience.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-20 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Whether you want to learn a new skill or share your expertise,
            Cmart is the place. Join a community that values real credentials.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Link href="/courses">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
            >
              <Link href="/pricing">
                Start Teaching
                <GraduationCap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
