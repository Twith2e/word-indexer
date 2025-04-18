import BookReader from "./components/book-reader";
import Navbar from "./ui/home/navbar";

export default function Home() {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="px-12">
        <h2 className="mt-12 mb-6 text-4xl font-bold text-[#1c1c1c]">
          Extract Text
        </h2>
        <BookReader />
      </main>
    </>
  );
}
