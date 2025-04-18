export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 text-white bg-[#3F3D56]">
      <div className="text-lg font-bold">Ase</div>
      <div className="space-x-4">
        <a href="/" className="hover:text-gray-300">
          Home
        </a>
        <a href="/about" className="hover:text-gray-300">
          About
        </a>
        <a href="/contact" className="hover:text-gray-300">
          Contact
        </a>
      </div>
    </nav>
  );
}
