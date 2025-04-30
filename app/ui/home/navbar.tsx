import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-5 text-white bg-[#0e0e0e]">
      <div className="text-3xl font-bold">Ase</div>
      <div className="space-x-4 hidden lg:flex">
        <Link href="/" className="hover:text-gray-300">
          Home
        </Link>
        <Link href="/about" className="hover:text-gray-300">
          About
        </Link>
        <Link href="/contact" className="hover:text-gray-300">
          Contact
        </Link>
      </div>
    </nav>
  );
}
