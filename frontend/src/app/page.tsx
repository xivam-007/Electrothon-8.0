import React from 'react';


const LandingPage = () => {
  return (
    <>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

        {/* Hero Section */}
        <section className="bg-blue-600 text-white py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-6">
              Welcome to Makhan Move [cite: 2]
            </h1>
            <p className="text-2xl mb-8 font-light">
              The "Trust Layer" for Moving in India[cite: 34].
            </p>
            <p className="text-lg mb-10 text-blue-100 max-w-2xl mx-auto">
              The Indian moving industry is valued at ₹20,000+ Crores, yet nearly 90% of it is unorganized, leading to zero accountability[cite: 24, 25]. We are here to fix that.
            </p>
            <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-slate-100 transition duration-300">
              Get Started Now
            </button>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">The Indian Relocation Crisis [cite: 20]</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-red-600 mb-3">The "Hostage" Scam [cite: 26]</h3>
              <p>A prevalent fraud exists where movers quote a low price, load the truck, and then demand 2-3x the price to unload[cite: 26, 27].</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-red-600 mb-3">Hidden Cost Shocks [cite: 29]</h3>
              <p>Surprise charges for "Union Tax" or "Green Tax" are included in 40-50% of final bills in India[cite: 29, 30]. These fees are never mentioned upfront[cite: 30].</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-red-600 mb-3">No Standard Pricing [cite: 32]</h3>
              <p>The price for a 2BHK move can vary wildly, quoted anywhere from ₹8,000 to ₹25,000[cite: 32, 33]. This depends purely on your negotiation skills[cite: 33].</p>
            </div>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="bg-slate-900 text-white py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">Why AI Agents? [cite: 34]</h2>
            <div className="grid md:grid-cols-2 gap-12 text-left">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-blue-400">Voice-First AI [cite: 41]</h3>
                <p className="text-lg text-slate-300">
                  Our AI Agent calls drivers directly, speaking "Hinglish" to bridge the digital gap[cite: 42].
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-blue-400">Ruthless Negotiation [cite: 43]</h3>
                <p className="text-lg text-slate-300">
                  A binding WhatsApp contract lists every inclusion, killing the scam before it starts[cite: 43]. The Strategist Agent grills them on specific Indian costs upfront[cite: 44].
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">From Chaos to Confirmed Deal [cite: 46]</h2>


          <div className="space-y-6 mt-8">
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h4 className="text-xl font-bold">User Input [cite: 51]</h4>
                <p>You state your needs, such as moving a 2BHK from Bangalore to Gurgaon[cite: 52]. This can be done via WhatsApp or Web[cite: 51].</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h4 className="text-xl font-bold">The Haggler [cite: 53]</h4>
                <p>Our AI Voice Agent calls up to 5 movers[cite: 53, 54]. It negotiates actively for a better price using reviews and competition[cite: 54].</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h4 className="text-xl font-bold">The Brain [cite: 55]</h4>
                <p>The Strategist Agent compares the gathered quotes[cite: 55, 56]. It evaluates them not just on price, but on "Hidden Cost Risk"[cite: 56].</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <h4 className="text-xl font-bold">User Verification [cite: 58]</h4>
                <p>You receive one final, verified option[cite: 58, 59]. This comes with a "Safe Move Guarantee"[cite: 59].</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">5</div>
              <div>
                <h4 className="text-xl font-bold">Finalization [cite: 60]</h4>
                <p>The AI generates a binding digital contract as a PDF via WhatsApp[cite: 60, 61]. Finally, you pay securely into Escrow[cite: 61].</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="bg-blue-50 py-16 text-center border-t border-slate-200">
          <h2 className="text-3xl font-bold mb-6">Ready for a Safe Move?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            We hold the money and release it to the mover only after safe unloading[cite: 104, 105]. Experience the difference today.
          </p>
          <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition duration-300">
            Start Your Move
          </button>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;