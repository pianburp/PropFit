
import Link from "next/link";
import { Home } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                            <div className="rounded-md bg-primary p-1 text-primary-foreground">
                                <Home className="h-4 w-4" />
                            </div>
                            <span>PropFit</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Helping real estate professionals close more deals by qualifying leads faster.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Testimonials</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Changelog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">About</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Twitter</Link></li>
                            <li><Link href="#" className="hover:text-foreground">LinkedIn</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Contact Support</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} PropFit. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
