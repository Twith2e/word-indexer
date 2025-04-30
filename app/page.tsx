import BookReader from "./components/book-reader";
import Navbar from "./ui/home/navbar";
import { BsLightbulbFill } from "react-icons/bs";

export default function Home() {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="px-4 lg:px-12">
        <div className="flex flex-col-reverse mt-5 lg:mt-0 lg:flex-row lg:justify-between lg:items-center">
          <h2 className="mt-12 mb-6 text-4xl font-bold text-[#1c1c1c]">
            Extract Text
          </h2>
          <div className="border border-[#FFC107] ring ring-[#FFC107] p-4">
            <div className="flex gap-1">
              <BsLightbulbFill size={20} color="#FFC107" />
              <span>NOTE!</span>
            </div>
            <span className="mt-5">
              At the moment only <code>.epub</code> files are can be read by{" "}
              <cite>ASE</cite>
            </span>
          </div>
        </div>

        <BookReader />
      </main>
    </>
  );
}
