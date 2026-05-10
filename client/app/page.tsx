"use client";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import {
  Briefcase,
  Users,
  Laptop,
  Building,
  SearchIcon,
  CheckCircleIcon,
  Globe,
  TrendingUp,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {

  // ================= MARKETPLACE MODULES (UPWORK STYLE) =================
  const marketplace = [
    {
      icon: <Briefcase className="w-6 h-6 text-[#7263f3]" />,
      title: "Job Marketplace",
      description: "Find full-time, part-time & remote jobs globally.",
      link: "/findwork",
      cta: "Find Jobs",
    },
    {
      icon: <Laptop className="w-6 h-6 text-[#7263f3]" />,
      title: "Freelance Services",
      description: "Hire or offer services (design, dev, marketing, etc).",
      link: "/findwork",
      cta: "Explore Services",
    },
    {
      icon: <Users className="w-6 h-6 text-[#7263f3]" />,
      title: "Talent Profiles",
      description: "Professionals showcase skills & portfolios.",
      link: "/findwork",
      cta: "Browse Talent",
    },
    {
      icon: <Building className="w-6 h-6 text-[#7263f3]" />,
      title: "Employer Hub",
      description: "Post jobs, hire talent, manage applications.",
      link: "/post",
      cta: "Hire Now",
    },
  ];

  // ================= INVESTOR METRICS =================
  const metrics = [
    { icon: <Globe />, label: "Countries", value: "120+" },
    { icon: <Briefcase />, label: "Opportunities", value: "150K+" },
    { icon: <Users />, label: "Users", value: "90K+" },
    { icon: <DollarSign />, label: "Transactions", value: "$2M+" },
  ];

  return (
    <main className="bg-white">

      <Header />

      {/* ================= HERO (MARKETPLACE + INVESTOR) ================= */}
      <section className="relative h-[92vh] flex items-center justify-center">
        <Image
          src="/a.jpg"
          alt="hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center text-white max-w-4xl px-6">
          <Badge className="mb-4 bg-white/10 border-white/20 text-white">
            Multi-Sided Talent Marketplace Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Jobs. Freelancers. Talent. One Ecosystem.
          </h1>
          <p className="mt-6 text-gray-200 text-lg">
            QvonXpert is building an Upwork-style marketplace combined with
            a modern job ecosystem for global hiring and digital work.
          </p>
          {/* SEARCH */}
          <div className="mt-8 flex gap-3 bg-white p-2 rounded-xl max-w-2xl mx-auto">
            <Input
              placeholder="Search jobs, services, freelancers..."
              className="border-none text-black"
            />
            <Button className="bg-[#7263f3]">
              <SearchIcon className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          {/* CTA */}
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild>
              <Link href="/findwork">Explore Marketplace</Link>
            </Button>
            <Button variant="outline" className="text-white border-white" asChild>
              <Link href="/post">Start Hiring</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ================= INVESTOR METRICS ================= */}
      <section className="py-16 bg-[#f7f9fb]">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-[#7263f3] flex justify-center mb-2">
                {m.icon}
              </div>
              <h3 className="text-xl font-bold">{m.value}</h3>
              <p className="text-sm text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= MARKETPLACE STRUCTURE ================= */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            A Complete Digital Work Marketplace
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {marketplace.map((item, i) => (
              <Card key={i} className="rounded-2xl border shadow-sm hover:shadow-xl transition">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-[#7263f3]/10 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full bg-[#7263f3]">
                    <Link href={item.link}>{item.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROBLEM / OPPORTUNITY (INVESTOR PITCH) ================= */}
      <section className="py-24 bg-[#f7f9fb]">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-4">Market Problem</h3>
            <p className="text-gray-600">
              Hiring is fragmented. Freelancing platforms are isolated.
              Job boards lack intelligence and scalability.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 text-[#7263f3]">
              QvonXpert Solution
            </h3>
            <p className="text-gray-600">
              A unified ecosystem combining jobs, freelance services,
              and talent marketplaces into one scalable platform.
            </p>
          </div>
        </div>
      </section>

      {/* ================= VISION BANNER ================= */}
      <section className="relative h-[60vh] flex items-center justify-center">
        <Image
          src="/b.jpg"
          alt="vision"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white">
          <h2 className="text-3xl font-bold">
            The Future of Work is Unified
          </h2>
          <p className="mt-2 text-gray-200">
            One platform. Infinite opportunities.
          </p>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-28 bg-[#d7dedc] text-center">
        <h2 className="text-3xl font-bold mb-4">
          Join the Marketplace Revolution
        </h2>
        <p className="text-gray-600 mb-8">
          Start hiring, freelancing, or building your career today.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/findwork">Enter Marketplace</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/post">Become an Employer</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}