'use client';

// Scrolls continuously. Pauses while the pointer is over the bar
// (.warning-marquee:hover in globals.css). prefers-reduced-motion slows it.
export default function TopWarningBar() {
    return (
        <aside
            role="complementary"
            aria-label="Health Warning"
            className="warning-marquee w-full h-[63px] overflow-hidden relative"
        >
            <div
                className="flex h-full absolute whitespace-nowrap animate-marquee-infinite"
            >
                {/* Pattern repeated twice for seamless infinite scroll */}
                {[...Array(2)].map((_, setIndex) => (
                    <div key={setIndex} className="flex h-full">
                        {/* Red Section 1 */}
                        <div className="w-[505px] h-[63px] bg-[#FF0000] flex items-center justify-center flex-shrink-0">
                            <p className="font-montserrat font-semibold text-[18px] text-white uppercase tracking-tight whitespace-nowrap px-4">
                                WARNING: TOBACCO CAUSES PAINFUL DEATH
                            </p>
                        </div>

                        {/* Black Section 1 */}
                        <div className="w-[353px] h-[63px] flex flex-col items-center justify-center flex-shrink-0" style={{ backgroundColor: '#000000', gap: 2 }}>
                            <p className="font-montserrat font-bold text-[16px] text-white uppercase whitespace-nowrap leading-tight m-0">
                                QUIT TODAY CALL 1800-11-2356
                            </p>
                            <a
                                href="https://ntcp.mohfw.gov.in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-montserrat font-normal text-[12px] whitespace-nowrap underline leading-tight m-0"
                                style={{ color: '#ffffff' }}
                            >
                                National Tobacco Quitline: 1800-11-2356
                            </a>
                        </div>

                        {/* Red Section 2 */}
                        <div className="w-[505px] h-[63px] bg-[#FF0000] flex items-center justify-center flex-shrink-0">
                            <p className="font-montserrat font-semibold text-[18px] text-white uppercase tracking-tight whitespace-nowrap px-4">
                                WARNING: TOBACCO CAUSES PAINFUL DEATH
                            </p>
                        </div>

                        {/* Black Section 2 */}
                        <div className="w-[353px] h-[63px] flex flex-col items-center justify-center flex-shrink-0" style={{ backgroundColor: '#000000', gap: 2 }}>
                            <p className="font-montserrat font-bold text-[16px] text-white uppercase whitespace-nowrap leading-tight m-0">
                                QUIT TODAY CALL 1800-11-2356
                            </p>
                            <a
                                href="https://ntcp.mohfw.gov.in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-montserrat font-normal text-[12px] whitespace-nowrap underline leading-tight m-0"
                                style={{ color: '#ffffff' }}
                            >
                                National Tobacco Quitline: 1800-11-2356
                            </a>
                        </div>

                        {/* Red Section 3 */}
                        <div className="w-[505px] h-[63px] bg-[#FF0000] flex items-center justify-center flex-shrink-0">
                            <p className="font-montserrat font-semibold text-[18px] text-white uppercase tracking-tight whitespace-nowrap px-4">
                                WARNING: TOBACCO CAUSES PAINFUL DEATH
                            </p>
                        </div>

                        {/* Black Section 3 */}
                        <div className="w-[353px] h-[63px] flex flex-col items-center justify-center flex-shrink-0" style={{ backgroundColor: '#000000', gap: 2 }}>
                            <p className="font-montserrat font-bold text-[16px] text-white uppercase whitespace-nowrap leading-tight m-0">
                                QUIT TODAY CALL 1800-11-2356
                            </p>
                            <a
                                href="https://ntcp.mohfw.gov.in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-montserrat font-normal text-[12px] whitespace-nowrap underline leading-tight m-0"
                                style={{ color: '#ffffff' }}
                            >
                                National Tobacco Quitline: 1800-11-2356
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
