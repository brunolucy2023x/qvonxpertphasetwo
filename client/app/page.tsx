"use client";

import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
  Card,
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
  Globe,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // ================= SEARCH HANDLER =================
  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      router.push(`/findwork?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // ================= MARKETPLACE MODULES =================
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

  const metrics = [
    { icon: <Globe />, label: "Countries", value: "120+" },
    { icon: <Briefcase />, label: "Opportunities", value: "150K+" },
    { icon: <Users />, label: "Users", value: "90K+" },
    { icon: <DollarSign />, label: "Transactions", value: "$2M+" },
  ];

  return (
    <main className="bg-white">
      <Header />

      {/* HERO */}
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
            QvonXpert is building an Upwork-style marketplace combined with a
            modern job ecosystem.
          </p>

          <div className="mt-8 flex gap-3 bg-white p-2 rounded-xl max-w-2xl mx-auto">
            <Input
              placeholder="Search jobs, services, freelancers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none text-black"
            />
            <Button className="bg-[#7263f3]" onClick={handleSearch}>
              <SearchIcon className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="py-16 bg-[#f7f9fb]">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-[#7263f3] flex justify-center mb-2">{m.icon}</div>
              <h3 className="text-xl font-bold">{m.value}</h3>
              <p className="text-sm text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            A Complete Digital Work Marketplace
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {marketplace.map((item, i) => (
              <Card
                key={i}
                className="rounded-2xl border shadow-sm hover:shadow-xl transition"
              >
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

      <Footer />
    </main>
  );
}