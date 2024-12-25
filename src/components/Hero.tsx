import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-red-800">
        <div className="absolute inset-0 bg-[url('/patterns/professional-pattern.svg')] opacity-5"></div>
        
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-red-500/10 blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-slate-500/10 blur-[100px] animate-pulse-slower"></div>
        </div>
      </div>

      <div className="absolute inset-0 bg-professional-grid opacity-[0.03]"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-slide-right"></div>
        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-400/20 to-transparent animate-slide-left"></div>
      </div>

      <div className="relative z-10 text-center px-4">
        <div className="relative inline-block">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-[2px] h-16 bg-gradient-to-b from-transparent via-red-500/50 to-transparent"></div>
          <h1 className="relative">
            <span className="block text-6xl font-bold text-white tracking-tight
                         [text-shadow:0_4px_8px_rgba(0,0,0,0.2)] 
                         animate-title-slide-up">
              Next Forward
            </span>
            <span className="block text-2xl mt-3 font-normal tracking-wider text-slate-200/90
                         [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]
                         animate-subtitle-fade-in">
              労働問題解決ガイド
            </span>
          </h1>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-[2px] h-16 bg-gradient-to-b from-transparent via-red-500/50 to-transparent"></div>
        </div>

        <div className="mt-12 relative">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-[1px] bg-gradient-to-r from-red-500/50 to-transparent"></div>
          <p className="text-xl tracking-wide text-slate-200/95 leading-relaxed
                     [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]
                     animate-text-fade-in">
            退職交渉でお困りの方へ
            <span className="block mt-2 text-red-100/90 font-medium tracking-wider animate-emphasis">
              プロフェッショナルが全て解決します
            </span>
          </p>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-[1px] bg-gradient-to-l from-red-500/50 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}