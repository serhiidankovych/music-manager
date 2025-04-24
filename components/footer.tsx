import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" max-w-4xl mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Serhii Dankovych
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="https://github.com/serhiidankovych" target="_blank">
            <Github className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>

          <Link href="mailto:serhiidankovych@gmail.com">
            <Mail className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/serhii-dankovych-706642255/"
            target="_blank"
          >
            <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
