"use client";

import ePub from "epubjs";
import { Suspense, useEffect, useState, useCallback } from "react";
import { CiCirclePlus } from "react-icons/ci";
import Image from "next/image";
// import pdfToText from "react-pdftotext";

type TocEntry = { label: string; href: string };

export type EpubSection = {
  label: string;
  type: "cover" | "toc" | "chapter";
  text: string;
  words: string[];
};

export async function ePubReader(file: File): Promise<EpubSection[]> {
  const buffer = await file.arrayBuffer();
  const book = ePub(buffer);
  await book.ready;

  const sections: EpubSection[] = [];
  try {
    const coverUrl: string | null = await book.coverUrl();
    sections.push({
      label: "Cover Image",
      type: "cover",
      text: coverUrl || "",
      words: [],
    });
  } catch {
    // no cover found → skip
  }

  const nav = await book.loaded.navigation;
  const toc = nav.toc as TocEntry[];
  const tocLabels = toc.map((e) => e.label).join(" ");
  const tocWords = tocLabels
    .replace(/[^\w'\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  sections.push({
    label: "Table of Contents",
    type: "toc",
    text: tocLabels,
    words: tocWords,
  });

  for (const entry of toc) {
    const href = entry.href.split("#")[0];
    const doc = (await book.load(href)) as Document;
    const raw = doc.documentElement.textContent || "";
    const cleaned = raw
      .replace(/[^\w'\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const ws = cleaned ? cleaned.split(" ") : [];

    const cleanedLabel = entry.label
      .replace(/[^\w'\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const labelWords = cleanedLabel.split(" ");
    const firstLabelWord = labelWords[0];
    const lastLabelWord = labelWords[labelWords.length - 1];

    let startIndex = ws.findIndex((word) => word === lastLabelWord);
    const firstWordIndex = ws.findIndex((word) => word === firstLabelWord);

    if (firstWordIndex > startIndex && startIndex !== -1) {
      startIndex = ws.findIndex(
        (word, index) => index > startIndex && word === lastLabelWord
      );
    }

    sections.push({
      label: cleanedLabel,
      type: "chapter",
      text: raw
        .replace(/[^\w'\s]+/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      words: startIndex !== -1 ? ws.slice(startIndex + 1) : ws,
    });
  }

  return sections;
}

// export async function extractPdfText(file: File): Promise<EpubSection[]> {
//   const sections: EpubSection[] = [];
//   try {
//     const rawText = await pdfToText(file);
//     const cleaned = rawText
//       .replace(/[^\w'\s]+/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();

//     const words = cleaned ? cleaned.split(" ") : [];
//     sections.push({
//       label: "PDF Document",
//       type: "chapter",
//       text: cleaned,
//       words,
//     });

//     return sections;
//   } catch (error) {
//     console.error("Failed to extract text from PDF:", error);
//     return [];
//   }
// }

export default function BookReader() {
  const [texts, setTexts] = useState<EpubSection[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<EpubSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortedWords, setSortedWords] = useState<
    Record<string, [string, number][]>
  >({});

  const filterTexts = useCallback(
    (searchTerm: string) => {
      if (searchTerm === "All Sections") {
        setFilteredTexts(texts);
        return;
      }
      const filteredArray = texts.filter((section) =>
        section.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTexts(filteredArray);
    },
    [texts]
  );

  function sort(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const sectionLabel = event.target.name;

    const section = filteredTexts.find((s) => s.label === sectionLabel);
    if (!section) return;

    const wordCounts = section.words.reduce((acc, word) => {
      const lowerWord = word.toLowerCase();
      acc[lowerWord] = (acc[lowerWord] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const wordEntries = Object.entries(wordCounts);

    switch (value) {
      case "A to Z":
        wordEntries.sort(([a], [b]) => a.localeCompare(b));
        break;
      case "Z to A":
        wordEntries.sort(([a], [b]) => b.localeCompare(a));
        break;
      case "Longest to Shortest":
        wordEntries.sort(([a], [b]) => b.length - a.length);
        break;
      case "Shortest to Longest":
        wordEntries.sort(([a], [b]) => a.length - b.length);
        break;
      case "Most Used":
        wordEntries.sort(([, a], [, b]) => b - a);
        break;
      case "Least Used":
        wordEntries.sort(([, a], [, b]) => a - b);
        break;
    }

    setSortedWords((prev) => ({
      ...prev,
      [sectionLabel]: wordEntries,
    }));
  }

  useEffect(() => {
    if (texts.length > 0) {
      setFilteredTexts(texts);
      // Initialize sorted words for each section
      const initialSortedWords = texts.reduce((acc, section) => {
        if (section.type !== "cover") {
          const wordCounts = section.words.reduce((wordAcc, word) => {
            const lowerWord = word.toLowerCase();
            wordAcc[lowerWord] = (wordAcc[lowerWord] || 0) + 1;
            return wordAcc;
          }, {} as Record<string, number>);
          acc[section.label] = Object.entries(wordCounts).sort(([a], [b]) =>
            a.localeCompare(b)
          );
        }
        return acc;
      }, {} as Record<string, [string, number][]>);
      setSortedWords(initialSortedWords);
    }
  }, [texts]);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setIsLoaded(true);
      try {
        if (file.type === "application/pdf") {
          console.log("Coming soon...");
        } else if (file.type === "application/epub+zip") {
          const result = await ePubReader(file);
          setTexts(result);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <label
        className="bg-[#0e0e0e] text-white cursor-pointer flex items-center w-fit gap-2 px-3 py-2 rounded-lg active:scale-104"
        htmlFor="book"
      >
        <CiCirclePlus className="text-2xl" />
        <span>Pick a book</span>
      </label>
      <input
        onChange={handleInputChange}
        className="hidden"
        id="book"
        type="file"
        accept=".epub,.pdf"
      />

      {isLoading && (
        <div className="mt-6 space-y-6">
          <div className="h-[300px] w-[200px] bg-gray-200 rounded-lg animate-pulse"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex flex-wrap flex-col md:flex-row md:gap-1 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                  <div
                    key={j}
                    className="h-7 w-16 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-col md:flex-row gap-2 md:gap-4 flex-wrap">
        {isLoaded &&
          texts.map((text, index) => (
            <button
              key={index}
              className="bg-gray-400 text-[#0e0e0e] px-3 py-2 rounded-md cursor-pointer"
              onClick={() => filterTexts(text.label)}
            >
              {text.label}
            </button>
          ))}
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div>
          {filteredTexts.length > 0 && (
            <div className="mt-6">
              {filteredTexts.map((section, index) => (
                <div key={index} className="mb-4">
                  {section.type === "cover" ? (
                    <Image
                      src={section.text}
                      alt="Book cover"
                      width={200}
                      height={300}
                      className="rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-3xl font-semibold text-[#3F3D56]">
                        {section.label}
                      </h3>
                      <div className="text-lg font-bold text-[#333333]">
                        {section.words.length} total words
                        <div className="flex gap-3 text-sm items-center">
                          <span>Filter</span>
                          <select
                            className="border-1 border-[#333] py-2 rounded-md"
                            name={section.label}
                            onChange={(e) => sort(e)}
                          >
                            <option value="A to Z">A to Z</option>
                            <option value="Z to A">Z to A</option>
                            <option value="Longest to Shortest">
                              Longest to Shortest
                            </option>
                            <option value="Shortest to Longest">
                              Shortest to Longest
                            </option>
                            <option value="Most Used">Most Used</option>
                            <option value="Least Used">Least Used</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-wrap flex-col lg:flex-row gap-2 lg:gap-1 w-full">
                        {(sortedWords[section.label] || []).map(
                          ([word, count]) => (
                            <span
                              key={word}
                              className="px-3 py-2 bg-[#ccc] rounded-lg text-base lg:text-lg text-gray-800 flex items-center gap-2"
                            >
                              <span className="font-bold text-[#3F3D56]">
                                {word}
                              </span>
                              <span className="text-gray-500">|</span>
                              <span className="text-sm text-gray-600">
                                appeared {count}{" "}
                                {count === 1 ? "time" : "times"}
                              </span>
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Suspense>
    </>
  );
}
