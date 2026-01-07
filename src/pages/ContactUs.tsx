import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
// ... imports

// ... inside component ...
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
        <Mail className="w-10 h-10 text-[#32dd9e] mb-6" />
        <h3 className="text-2xl font-bold mb-2">Email Support</h3>
        <p className="text-white/60 mb-6">For general queries, support, or partnership opportunities.</p>
        <a href="mailto:support@splitwayy.com" className="text-[#32dd9e] font-bold text-lg hover:underline">support@splitwayy.com</a>
    </div>

    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
        <MapPin className="w-10 h-10 text-[#32dd9e] mb-6" />
        <h3 className="text-2xl font-bold mb-2">Registered Office</h3>
        <p className="text-white/60 mb-6">Visit our main office headquarters.</p>
        <address className="not-italic text-white/80 leading-relaxed">
            SplitWayy Inc.<br />
            Sector 62, Noida<br />
            Uttar Pradesh, India - 201309
        </address>
    </div>

    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
        <Phone className="w-10 h-10 text-[#32dd9e] mb-6" />
        <h3 className="text-2xl font-bold mb-2">Phone Support</h3>
        <p className="text-white/60 mb-6">Mon-Fri from 10am to 5pm.</p>
        <a href="tel:+919876543210" className="text-[#32dd9e] font-bold text-lg hover:underline">+91 98765 43210</a>
    </div>
</div>
            </main >
        </div >
    );
}
