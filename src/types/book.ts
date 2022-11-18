// Generated by https://quicktype.io

export interface Book {
  isbn: string;
  "book-title": string;
  author: string;
  "book-des": string;
  edition: string;
  "image-url": string;
  average_price: string;
  tags: Tag[];
}

export interface Tag {
  "tag-id": number;
  "t-data": string;
  "t-pic": null;
  isbn: string;
}
