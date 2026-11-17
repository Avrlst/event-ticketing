export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-950 text-white">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
          Redefining <span className="text-zinc-500">Live Experiences.</span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Platform ticketing generasi baru. Cepat, aman, dan tanpa antrean. Didesain untuk pengalaman maksimal.
        </p>
        
        <div className="pt-4">
          <button className="px-8 py-4 bg-white text-zinc-950 font-semibold rounded-full hover:bg-zinc-200 transition-colors duration-200">
            Jelajahi Event
          </button>
        </div>
      </div>
    </main>
  );
}