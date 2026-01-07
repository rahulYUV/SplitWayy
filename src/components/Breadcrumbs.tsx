interface BreadcrumbsProps {
    userName?: string;
    currentPage?: string;
    className?: string;
}

export function Breadcrumbs({ currentPage, className = "" }: BreadcrumbsProps) {
    return (
        <div className={`flex flex-col ${className}`}>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                <span className="hidden md:inline opacity-40">HOME</span>
                {currentPage && (
                    <>
                        <span className="hidden md:inline text-[#32dd9e] text-2xl font-normal opacity-100">{">"}</span>
                        <span className="uppercase">{currentPage}</span>
                    </>
                )}
            </h2>
        </div>
    );
}
