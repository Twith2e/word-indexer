declare module "pdfjs-dist/legacy/build/pdf.worker.entry" {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
}

declare module "pdfjs-dist/build/pdf" {
  import * as pdfjsLib from "pdfjs-dist";
  export = pdfjsLib;
}
