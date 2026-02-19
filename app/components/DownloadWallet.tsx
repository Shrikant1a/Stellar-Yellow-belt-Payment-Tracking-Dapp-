export default function DownloadWallet() {
    const wallets = [
        { name: 'Freighter', url: 'https://www.freighter.app/', primary: true },
        { name: 'Albedo', url: 'https://albedo.link/' },
        { name: 'Lobstr', url: 'https://lobstr.co/' },
        { name: 'xBull', url: 'https://xbull.app/' },
    ]

    return (
        <div className="mt-8 w-full max-w-2xl bg-[#1e1e24]/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in-up transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 text-lg">📁</span>
                <h3 className="font-bold text-white text-lg">Download a Wallet</h3>
            </div>

            <p className="text-gray-400 text-sm mb-6">
                Don't have a Stellar wallet yet? Install one of the supported wallets below.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wallets.map((wallet) => (
                    <a
                        key={wallet.name}
                        href={wallet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
              group flex flex-col items-center justify-center gap-3 py-4 px-2 rounded-xl transition-all duration-300 border
              ${wallet.primary
                                ? 'bg-gradient-to-br from-[#3E3B8E] to-[#2D2A6E] border-[#5552A0] hover:border-[#7A77C8] hover:shadow-[0_0_15px_rgba(85,82,160,0.5)]'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                            }
            `}
                    >
                        <DownloadTrayIcon className={`w-5 h-5 transition-transform group-hover:-translate-y-1 ${wallet.primary ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                        <span className={`text-sm font-medium ${wallet.primary ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{wallet.name}</span>
                    </a>
                ))}
            </div>
        </div>
    )
}

function DownloadTrayIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={className}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5M8.25 13.5L12 17.25l3.75-3.75" />
        </svg>
    )
}
