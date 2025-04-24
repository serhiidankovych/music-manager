import { Button } from "@/components/ui/button";

import Link from "next/link";
import { features } from "@/data/features";
export default function Home() {
  return (
    <main className=" bg-background text-foreground dark">
      <section
        className="min-h-screen relative w-full py-32 md:py-48 overflow-hidden 
                   bg-[url(/pattern.svg)] bg-repeat "
      >
        <div
          className="absolute inset-0 z-10 
                     bg-gradient-to-b from-background via-background/90 to-background/70"
        ></div>

        <div className="container relative z-20 px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-primary">Honey,</span> Your Music is
              Perfectly Managed
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Genesis Front-End School // Case Task // Managing music tracks
            </p>
            <Link href="/tracks">
              <Button className="mt-8" size="lg" variant={"candy"}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-card-foreground">
              Main Features
            </h2>
            <p className="text-muted-foreground mt-2">
              Everything you need to manage your music collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-secondary rounded-lg hover:shadow-md transition-all cursor-pointer border border-border"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-accent rounded-full mr-4">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <h3 className="font-semibold text-lg text-secondary-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
