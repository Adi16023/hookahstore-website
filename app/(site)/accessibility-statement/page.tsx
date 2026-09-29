"use client";
export const runtime = 'edge';
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../components/providers/ThemeProvider";

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

function Chevron({ open, dark }: { open: boolean; dark: boolean }) {
    return (
        <svg
            width="22"
            height="24"
            viewBox="0 0 22.16 24.004"
            fill="none"
            style={{
                flexShrink: 0,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms ease",
            }}
        >
            <path
                d="M3.69332 8.30861L11.0812 15.6953L18.4667 8.30861"
                stroke={dark ? "#ffffff" : "#857149"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.923333"
            />
        </svg>
    );
}

const sections = [
    { title: "Commitment to Accessibility and Inclusion", content: LOREM },
    { title: "Measures to Ensure Accessibility", content: LOREM },
    { title: "Contact Information for Accessibility Issues", content: LOREM },
    { title: "Encouragement for User Feedback", content: LOREM },
    { title: "Specific Accessibility Features", content: LOREM },
    { title: "Continuous Improvement Commitment", content: LOREM },
];

export default function AccessibilityStatementPage() {
    const { dark } = useTheme();
    const [openSet, setOpenSet] = useState<Set<number>>(new Set([0]));

    function toggle(i: number) {
        setOpenSet((prev) => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    }

    const borderColor = dark ? "#5D5D5D" : "#d7d8db";
    const textPrimary = dark ? "#ffffff" : "#101114";
    const textSecondary = dark ? "rgba(255,255,255,0.7)" : "#101114";
    const bg = dark ? "transparent" : "#ffffff";

    return (
        <div style={{ backgroundColor: bg, width: "100%", minHeight: "100vh", transition: "background-color 200ms" }}>

            {/* ── Breadcrumb ── */}
            <div
                style={{
                    borderBottom: `1px solid ${borderColor}`,
                    minHeight: "49px",
                    display: "flex",
                    alignItems: "center",
                    transition: "border-color 200ms",
                }}
            >
                <div
                    className="flex items-center pl-[16px] md:pl-[64px] xl:pl-[312px]"
                    style={{ paddingTop: "10px", paddingBottom: "10px" }}
                >
                    <Link
                        href="/"
                        style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "20px",
                            color: dark ? "rgba(255,255,255,0.7)" : "#1b1c1f",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Home
                    </Link>
                    <div style={{ width: "16px", height: "16px", margin: "0 4px", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span
                        aria-current="page"
                        style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "20px",
                            color: dark ? "#ffffff" : "#1b1c1f",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Accessibility Statement
                    </span>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="px-[16px] md:px-[64px] xl:px-[312px] pt-[40px] md:pt-[60px]">

                {/* Title */}
                <h1
                    style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 600,
                        fontStyle: "normal",
                        color: textPrimary,
                        margin: 0,
                        transition: "color 200ms",
                    }}
                    className="text-[28px] leading-[36px] mt-0 md:text-[40px] md:leading-[54px] md:mt-0"
                >
                    Accessibility Statement
                </h1>

                {/* ── Accordion ── */}
                <div
                    style={{ backgroundColor: bg, transition: "background-color 200ms" }}
                    className="mt-[17px] md:mt-[18px]"
                >
                    {sections.map((section, i) => {
                        const isOpen = openSet.has(i);
                        const isLast = i === sections.length - 1;
                        return (
                            <div
                                key={section.title}
                                style={{
                                    borderTop: `1px solid ${borderColor}`,
                                    borderBottom: isLast ? `1px solid ${borderColor}` : undefined,
                                    transition: "border-color 200ms",
                                }}
                            >
                                {/* Header button */}
                                <button
                                    type="button"
                                    onClick={() => toggle(i)}
                                    style={{
                                        width: "100%",
                                        height: "73px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        paddingLeft: "8px",
                                        paddingRight: "8px",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "var(--font-montserrat), sans-serif",
                                            fontWeight: 600,
                                            fontSize: "18px",
                                            lineHeight: "24px",
                                            color: textPrimary,
                                            transition: "color 200ms",
                                        }}
                                    >
                                        {section.title}
                                    </span>
                                    <Chevron open={isOpen} dark={dark} />
                                </button>

                                {/* Expanded body */}
                                {isOpen && (
                                    <div
                                        style={{ overflow: "hidden" }}
                                        className="py-[8.75px] pl-0 pr-0 md:pl-[12px] md:pr-[12px]"
                                    >
                                        <p
                                            style={{
                                                fontFamily: "var(--font-montserrat), sans-serif",
                                                fontWeight: 400,
                                                fontSize: "16px",
                                                lineHeight: "20px",
                                                color: dark ? "rgba(255,255,255,0.75)" : "#101114",
                                                margin: 0,
                                                transition: "color 200ms",
                                            }}
                                        >
                                            {section.content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer note */}
                <p
                    style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "28px",
                        color: textSecondary,
                        transition: "color 200ms",
                    }}
                    className="mt-[40px] md:mt-[48px] text-[14px] md:text-[18px]"
                >
                    Thank you for visiting The Hookah Store (thehookahstore.in). We are dedicated to making our website accessible to all users and appreciate your support in this endeavor.
                </p>

                <div style={{ height: "60px" }} />
            </div>
        </div>
    );
}
