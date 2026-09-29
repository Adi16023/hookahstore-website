'use client';

interface SkeletonCardProps {
    index: number;
}

function SkeletonCard({ index }: SkeletonCardProps) {
    return (
        <div
            className="relative flex-shrink-0"
            style={{
                width: '257px',
                height: '442px',
            }}
        >
            <div
                className="relative w-full h-full"
                style={{
                    backgroundColor: '#181818',
                    borderRadius: '12px',
                    border: '1px solid #2a2a2a',
                }}
            >
                {/* Image Placeholder - Gray Box */}
                <div
                    className="mx-auto bg-gray-700/30 rounded-lg animate-pulse"
                    style={{
                        width: '168px',
                        height: '168px',
                        marginTop: '24px',
                        marginBottom: '250px',
                    }}
                />

                {/* Variation Chips Placeholder - 3 small rectangles */}
                <div
                    className="flex gap-2 px-6"
                    style={{
                        marginTop: '-235px',
                        marginBottom: '15px',
                    }}
                >
                    {[1, 2, 3].map((chip) => (
                        <div
                            key={chip}
                            className="bg-gray-700/30 rounded animate-pulse"
                            style={{
                                width: '47px',
                                height: '27px',
                            }}
                        />
                    ))}
                </div>

                {/* Divider Line */}
                <div
                    className="mx-6"
                    style={{
                        width: '201px',
                        height: '1px',
                        backgroundColor: '#414141',
                        marginBottom: '8px',
                    }}
                />

                {/* Title Placeholder */}
                <div
                    className="mx-6 bg-gray-700/30 rounded animate-pulse"
                    style={{
                        height: '20px',
                        width: '180px',
                        marginBottom: '8px',
                    }}
                />

                {/* Description Placeholder - 2 lines */}
                <div className="mx-6 space-y-2" style={{ marginBottom: '12px' }}>
                    <div
                        className="bg-gray-700/30 rounded animate-pulse"
                        style={{
                            height: '12px',
                            width: '200px',
                        }}
                    />
                    <div
                        className="bg-gray-700/30 rounded animate-pulse"
                        style={{
                            height: '12px',
                            width: '160px',
                        }}
                    />
                </div>

                {/* CTA Button Placeholder - Long rectangle */}
                <div
                    className="mx-auto bg-gray-700/30 rounded-full animate-pulse"
                    style={{
                        width: '206px',
                        height: '35px',
                        marginTop: '12px',
                    }}
                />
            </div>
        </div>
    );
}

export default function WholesaleProductSkeletonGrid() {
    return (
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '0px', paddingBottom: '60px' }}>
            {/* Section with 125px left padding only */}
            <div className="relative overflow-x-hidden" style={{ paddingLeft: '125px' }}>
                {/* Skeleton Cards Container */}
                <div className="relative overflow-x-hidden" style={{ padding: '20px 0' }}>
                    <div
                        className="flex"
                        style={{
                            gap: '29px',
                        }}
                    >
                        {/* Render 8 skeleton cards */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                            <SkeletonCard key={index} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
