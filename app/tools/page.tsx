import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export const metadata = {
    title: "Tools | Vorotech",
    description: "Useful tools and utilities.",
};

export default function ToolsPage() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <h1 className="text-4xl font-bold mb-8 font-abel">Tools</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    href="/tools/scheduler"
                    className="group p-6 border rounded-xl hover:shadow-lg transition-all duration-300 bg-card hover:border-primary/50"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-semibold">On-Call Scheduler</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Generate fair and optimized on-call shift schedules for your team, considering time offs and constraints.
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
                        Open Tool <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
