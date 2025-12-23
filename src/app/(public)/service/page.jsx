// app/(site)/services/[slug]/page.tsx
import Image from "next/image"
import Link from "next/link"
import { Phone, FileText, ClipboardList, ChevronRight } from "lucide-react"

const categories = [
    "Abdominal surgery",
    "Addiction psychiatry",
    "Cardiology",
    "Clinical cardiology",
    "Dermatology",
    "General surgery",
]

const faqs = [
    {
        question: "What if my patient does not have a matched sibling?",
        answer:
            "Our transplant team evaluates alternative donor options including unrelated registries, haploidentical donors, and cord blood units based on disease status and risk.",
    },
    {
        question: "How is the Emergency Department staffed?",
        answer:
            "The department is covered 24/7 by board‑certified emergency physicians, senior residents, and a dedicated critical care nursing team.",
    },
    {
        question: "What should I carry for my first appointment?",
        answer:
            "Please bring previous reports, current medications list, insurance details, and a valid photo ID to help streamline your registration.",
    },
]

export default function ServicePage() {
    return (
        <main className="w-full bg-slate-50 mt-20">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row lg:py-12">
                {/* LEFT: Content */}
                <section className="flex-1 space-y-8">
                    {/* Hero image */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="relative h-72 w-full sm:h-80 md:h-96">
                            <Image
                                src="/images/services/pediatrics-example.jpg"
                                alt="Doctor consulting with patient"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    {/* Heading + description */}
                    <section className="space-y-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                            Add Your Heading Text Here
                        </h1>
                        <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                            Alternative innovation to extensive empowered web services whereas standardized
                            process compelling results for premier medical empowerment. Dramatically strategize
                            forward opportunities before seamless customer partnership. Clinically integrate
                            impactful care.
                        </p>
                        <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                            Proactively fashion non‑disruptive advances. Globally orchestrate value‑based
                            metrics, uniquely synergize evidence‑based solutions, and rapidly iterate
                            interdisciplinary frameworks for advanced family‑focused care. Increasingly harness
                            collaborative care pathways for sustainable patient progress.
                        </p>
                    </section>

                    {/* Two feature cards */}
                    <section className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <h3 className="mb-1 text-base font-semibold text-slate-900">
                                Make Appointment
                            </h3>
                            <p className="text-sm text-slate-600">
                                Schedule an appointment with our specialists for focused, timely clinical guidance.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h3 className="mb-1 text-base font-semibold text-slate-900">
                                Get Consultation
                            </h3>
                            <p className="text-sm text-slate-600">
                                Connect with experienced consultants for second opinions and comprehensive
                                treatment planning.
                            </p>
                        </div>
                    </section>

                    {/* Blue highlight strip */}
                    <section className="rounded-2xl bg-sky-600 px-5 py-4 text-sm font-medium text-white shadow-sm">
                        Competently architect intermediated deliverables; client‑centric niches continually
                        underwhelm without coordinated clinical leadership.
                    </section>

                    {/* Second content block */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Add Your Heading Text Here
                        </h2>
                        <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                            Alternative innovation to extensive empowered web services whereas standardized
                            process compelling results for premier medical empowerment. Objectively evolve
                            integrated platforms and cross‑functional collaborations for consistent clinical
                            quality.
                        </p>
                    </section>

                    {/* FAQ / Accordion */}
                    <section className="space-y-3">
                        {faqs.map((faq, index) => (
                            <details
                                key={faq.question}
                                className="group rounded-xl bg-white px-4 py-3 text-sm shadow-sm"
                            >
                                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-slate-900">
                                    <span className="font-medium">{faq.question}</span>
                                    <span className="shrink-0 text-slate-400 group-open:rotate-90 transition-transform">
                                        <ChevronRight className="h-4 w-4" />
                                    </span>
                                </summary>
                                <div className="mt-2 border-t pt-2 text-slate-600">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </section>
                </section>

                {/* RIGHT: Sidebar */}
                <aside className="w-full shrink-0 space-y-6 lg:w-80">
                    {/* Categories */}
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-lg font-semibold text-slate-900">
                            Categories
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {categories.map((name) => (
                                <li key={name}>
                                    <button className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left text-slate-700 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700">
                                        <span>{name}</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Call buttons */}
                    <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Call
                        </h3>
                        <button className="flex w-full items-center justify-between rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
                            <span>Service Report</span>
                            <FileText className="h-4 w-4" />
                        </button>
                        <button className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
                            <span>Monthly Report</span>
                            <ClipboardList className="h-4 w-4" />
                        </button>
                    </section>

                    {/* Blue contact card */}
                    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 p-6 text-white shadow-md">
                        <p className="text-xs uppercase tracking-[0.2em] text-sky-200">
                            Delivering quality health care
                        </p>
                        <h3 className="mt-2 text-lg font-semibold md:text-xl">
                            Delivering Quality Health Care
                            <br />
                            For Next Generations
                        </h3>

                        <div className="mt-4 flex items-center gap-3 text-sky-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/30">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-sky-200">
                                    Emergency Call
                                </p>
                                <p className="text-lg font-semibold">+123 (4567) 890</p>
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-sky-200">
                            4.9 Average Rating on Customer Reviews
                        </p>

                        <Link
                            href="/contact-us"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400"
                        >
                            Contact us
                        </Link>
                    </section>
                </aside>
            </div>
        </main>
    )
}
